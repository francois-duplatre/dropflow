'use client';

import { useState, useEffect } from 'react';
import { supabaseAuth, User } from '@/lib/supabase-auth';
import { supabaseDatabase, Shop, Product } from '@/lib/supabase-database';

export const useSupabase = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await supabaseAuth.getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          // Charger les boutiques de l'utilisateur
          const userShops = await supabaseDatabase.getShops(currentUser.id);
          setShops(userShops);
        }
      } catch (error) {
        console.error('Erreur vérification auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabaseAuth.onAuthStateChange(async (user) => {
      setUser(user);
      setLoading(false);
      
      if (user) {
        const userShops = await supabaseDatabase.getShops(user.id);
        setShops(userShops);
      } else {
        setShops([]);
        setProducts([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Authentification
  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    setLoading(true);
    try {
      const result = await supabaseAuth.signUp(email, password, firstName, lastName);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await supabaseAuth.signIn(email, password);
      if (result.success && result.user) {
        setUser(result.user);
        const userShops = await supabaseDatabase.getShops(result.user.id);
        setShops(userShops);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const result = await supabaseAuth.signOut();
      if (result.success) {
        setUser(null);
        setShops([]);
        setProducts([]);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  // Gestion des boutiques
  const createShop = async (shopData: Omit<Shop, 'id' | 'createdAt'>) => {
    if (!user) return { success: false, error: 'Utilisateur non connecté' };

    try {
      const result = await supabaseDatabase.createShop(shopData);
      if (result.success && result.shop) {
        setShops(prev => [result.shop!, ...prev]);
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Erreur lors de la création' };
    }
  };

  const deleteShop = async (shopId: string) => {
    if (!user) return { success: false, error: 'Utilisateur non connecté' };

    try {
      const result = await supabaseDatabase.deleteShop(shopId, user.id);
      if (result.success) {
        setShops(prev => prev.filter(shop => shop.id !== shopId));
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Erreur lors de la suppression' };
    }
  };

  // Gestion des produits
  const loadProducts = async (shopId: string) => {
    try {
      const shopProducts = await supabaseDatabase.getProducts(shopId);
      setProducts(shopProducts);
      return shopProducts;
    } catch (error) {
      console.error('Erreur chargement produits:', error);
      return [];
    }
  };

  const createProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    if (!user) return { success: false, error: 'Utilisateur non connecté' };

    try {
      const result = await supabaseDatabase.createProduct(productData);
      if (result.success && result.product) {
        setProducts(prev => [result.product!, ...prev]);
        
        // Mettre à jour le nombre de produits dans la boutique
        setShops(prev => prev.map(shop => 
          shop.id === productData.shopId 
            ? { ...shop, productsCount: shop.productsCount + 1 }
            : shop
        ));
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Erreur lors de la création' };
    }
  };

  const updateProduct = async (productId: string, shopId: string, updates: Partial<Product>) => {
    try {
      const result = await supabaseDatabase.updateProduct(productId, shopId, updates);
      if (result.success) {
        setProducts(prev => prev.map(product => 
          product.id === productId 
            ? { ...product, ...updates }
            : product
        ));
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Erreur lors de la mise à jour' };
    }
  };

  const deleteProduct = async (productId: string, shopId: string) => {
    if (!user) return { success: false, error: 'Utilisateur non connecté' };

    try {
      const result = await supabaseDatabase.deleteProduct(productId, shopId, user.id);
      if (result.success) {
        setProducts(prev => prev.filter(product => product.id !== productId));
        
        // Mettre à jour le nombre de produits dans la boutique
        setShops(prev => prev.map(shop => 
          shop.id === shopId 
            ? { ...shop, productsCount: Math.max(0, shop.productsCount - 1) }
            : shop
        ));
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Erreur lors de la suppression' };
    }
  };

  // Mise à jour du profil
  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { success: false, error: 'Utilisateur non connecté' };

    try {
      const result = await supabaseAuth.updateProfile(user.id, updates);
      if (result.success) {
        setUser(prev => prev ? { ...prev, ...updates } : null);
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Erreur lors de la mise à jour' };
    }
  };

  return {
    // État
    user,
    loading,
    shops,
    products,
    isAuthenticated: !!user,

    // Authentification
    signUp,
    signIn,
    signOut,

    // Boutiques
    createShop,
    deleteShop,

    // Produits
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,

    // Profil
    updateProfile,
  };
}; 