'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';

export interface Product {
  id: string;
  image: string;
  reference: string;
  name: string;
  price: number;
  purchase_price: number;
  etsy_link: string;
  dropshipping_link: string;
  category: string;
  status: 'active' | 'draft' | 'inactive';
  shop_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useProducts = (shopId: string) => {
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    if (!user || !isAuthenticated || !shopId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shopId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur chargement produits:', error);
        setError('Erreur lors du chargement des produits');
        setProducts([]);
      } else {
        setProducts(data || []);
      }
    } catch (err) {
      console.error('Erreur chargement produits:', err);
      setError('Erreur lors du chargement des produits');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user || !isAuthenticated) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      const insertData = {
        ...productData,
        user_id: user.id,
        shop_id: shopId
      };
      
      const { data, error } = await supabase
        .from('products')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Erreur Supabase création produit:', error);
        throw new Error(`Erreur lors de la création du produit: ${error.message}`);
      }

      // Mettre à jour l'état local immédiatement
      setProducts(prev => [data, ...prev]);
      
      // Mettre à jour le compteur de produits dans la boutique
      await updateShopProductsCount(shopId);
      
      return { success: true, product: data };
    } catch (err: any) {
      console.error('Erreur création produit:', err);
      throw new Error(err.message || 'Erreur lors de la création du produit');
    }
  };

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    if (!user || !isAuthenticated) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId)
        .eq('user_id', user.id)
        .eq('shop_id', shopId)
        .select()
        .single();

      if (error) {
        console.error('Erreur mise à jour produit:', error);
        throw new Error('Erreur lors de la mise à jour du produit');
      }

      // Mettre à jour l'état local immédiatement
      setProducts(prev => prev.map(product => product.id === productId ? data : product));
      
      // Mettre à jour le compteur de produits dans la boutique
      await updateShopProductsCount(shopId);
      
      return { success: true, product: data };
    } catch (err: any) {
      console.error('Erreur mise à jour produit:', err);
      throw new Error(err.message || 'Erreur lors de la mise à jour du produit');
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!user || !isAuthenticated) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('user_id', user.id)
        .eq('shop_id', shopId);

      if (error) {
        console.error('Erreur suppression produit:', error);
        throw new Error('Erreur lors de la suppression du produit');
      }

      // Mettre à jour l'état local immédiatement
      setProducts(prev => prev.filter(product => product.id !== productId));
      
      // Mettre à jour le compteur de produits dans la boutique
      await updateShopProductsCount(shopId);
      
      return { success: true };
    } catch (err: any) {
      console.error('Erreur suppression produit:', err);
      throw new Error(err.message || 'Erreur lors de la suppression du produit');
    }
  };

  const updateShopProductsCount = async (shopId: string) => {
    if (!user || !isAuthenticated) {
      return;
    }

    try {
      // Compter les produits de cette boutique
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('shop_id', shopId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erreur comptage produits:', error);
        return;
      }

      // Mettre à jour le compteur dans la table shops
      const { error: updateError } = await supabase
        .from('shops')
        .update({ products_count: count || 0 })
        .eq('id', shopId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Erreur mise à jour compteur boutique:', updateError);
      }
    } catch (err) {
      console.error('Erreur mise à jour compteur boutique:', err);
    }
  };

  const toggleProductStatus = async (productId: string, currentStatus: 'active' | 'draft' | 'inactive') => {
  let newStatus: 'active' | 'draft' | 'inactive';
    
    // Cycle: active -> draft -> active
    switch (currentStatus) {
      case 'active':
        newStatus = 'draft';
        break;
      case 'draft':
        newStatus = 'active';
        break;
      default:
        newStatus = 'draft';
    }
    
    return updateProduct(productId, { status: newStatus });
  };

  useEffect(() => {
    if (user && isAuthenticated && shopId) {
      loadProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [user?.id, isAuthenticated, shopId]);

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    refreshProducts: loadProducts,
  };
}; 