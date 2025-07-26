'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

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

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  updateProductInCache: (productId: string, updates: Partial<Product>) => void;
  removeProductFromCache: (productId: string) => void;
  addProductToCache: (product: Product) => void;
  addMultipleProductsToCache: (products: Product[]) => void;
  deleteProduct: (productId: string) => Promise<{ success: boolean; error?: string }>;
  updateShopProductsCount: (shopId: string) => Promise<void>;
  getTotalProductsCount: () => Promise<number>;
  verifyPremiumPassword: (password: string) => Promise<boolean>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const useProductsContext = () => {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProductsContext must be used within a ProductsProvider');
  }
  return context;
};

interface ProductsProviderProps {
  children: ReactNode;
  shopId: string;
}

export const ProductsProvider: React.FC<ProductsProviderProps> = ({ children, shopId }) => {
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const loadProducts = async () => {
    if (!user || !isAuthenticated || !shopId) {
      setProducts([]);
      setLoading(false);
      setIsInitialized(true);
      setIsTransitioning(false);
      return;
    }

    try {
      setIsTransitioning(true);
      setLoading(true);
      setError(null);

      // Délai minimum pour éviter les flashs
      const startTime = Date.now();
      const minLoadingTime = 300; // 300ms minimum

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

      // Attendre le délai minimum si nécessaire
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }
    } catch (err) {
      console.error('Erreur chargement produits:', err);
      setError('Erreur lors du chargement des produits');
      setProducts([]);
    } finally {
      setLoading(false);
      setIsInitialized(true);
      setIsTransitioning(false);
    }
  };

  const updateProductInCache = (productId: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(product => product.id === productId ? { ...product, ...updates } : product));
  };

  const removeProductFromCache = (productId: string) => {
    setProducts(prev => prev.filter(product => product.id !== productId));
  };

  const addProductToCache = (product: Product) => {
    setProducts(prev => [product, ...prev]);
  };

  const addMultipleProductsToCache = (products: Product[]) => {
    setProducts(prev => [...products, ...prev]);
  };

  const deleteProduct = async (productId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user || !isAuthenticated) {
      return { success: false, error: 'Utilisateur non authentifié' };
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
        return { success: false, error: 'Erreur lors de la suppression du produit' };
      }

      // Mettre à jour l'état local immédiatement
      setProducts(prev => prev.filter(product => product.id !== productId));
      
      // Mettre à jour le compteur de produits dans la boutique
      await updateShopProductsCount(shopId);
      
      return { success: true };
    } catch (err: any) {
      console.error('Erreur suppression produit:', err);
      return { success: false, error: err.message || 'Erreur lors de la suppression du produit' };
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

  const getTotalProductsCount = async (): Promise<number> => {
    if (!user || !isAuthenticated) {
      return 0;
    }

    try {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) {
        console.error('Erreur comptage total produits:', error);
        return 0;
      }

      return count || 0;
    } catch (err) {
      console.error('Erreur comptage total produits:', err);
      return 0;
    }
  };

  const verifyPremiumPassword = async (password: string): Promise<boolean> => {
    // Mot de passe premium secret
    const validPasswords = ['ENJOYMYFRIEND'];
    return validPasswords.includes(password.trim().toUpperCase());
  };

  useEffect(() => {
    if (user && isAuthenticated && shopId) {
      // Charger les produits sans vider la liste existante
      setLoading(true);
      setError(null);
      loadProducts();
    } else {
      setProducts([]);
      setLoading(false);
      setIsInitialized(false);
      setError(null);
    }
  }, [user?.id, isAuthenticated, shopId]);

  const value: ProductsContextType = {
    products,
    loading,
    error,
    refreshProducts: loadProducts,
    updateProductInCache,
    removeProductFromCache,
    addProductToCache,
    addMultipleProductsToCache,
    deleteProduct,
    updateShopProductsCount,
    getTotalProductsCount,
    verifyPremiumPassword,
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}; 