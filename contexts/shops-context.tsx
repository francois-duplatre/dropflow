'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

export interface Shop {
  id: string;
  name: string;
  image: string;
  user_id: string;
  products_count: number;
  created_at: string;
  updated_at: string;
}

interface ShopsContextType {
  shops: Shop[];
  loading: boolean;
  error: string | null;
  refreshShops: () => Promise<void>;
  updateShopInCache: (shopId: string, updates: Partial<Shop>) => void;
  removeShopFromCache: (shopId: string) => void;
  addShopToCache: (shop: Shop) => void;
}

const ShopsContext = createContext<ShopsContextType | undefined>(undefined);

export const useShopsContext = () => {
  const context = useContext(ShopsContext);
  if (context === undefined) {
    throw new Error('useShopsContext must be used within a ShopsProvider');
  }
  return context;
};

interface ShopsProviderProps {
  children: ReactNode;
}

export const ShopsProvider: React.FC<ShopsProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const loadShops = async () => {
    if (!user || !isAuthenticated) {
      setShops([]);
      setLoading(false);
      setIsInitialized(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur chargement boutiques:', error);
        setError('Erreur lors du chargement des boutiques');
        return;
      }

      setShops(data || []);
    } catch (err) {
      console.error('Erreur chargement boutiques:', err);
      setError('Erreur lors du chargement des boutiques');
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  const updateShopInCache = (shopId: string, updates: Partial<Shop>) => {
    setShops(prev => prev.map(shop => shop.id === shopId ? { ...shop, ...updates } : shop));
  };

  const removeShopFromCache = (shopId: string) => {
    setShops(prev => prev.filter(shop => shop.id !== shopId));
  };

  const addShopToCache = (shop: Shop) => {
    setShops(prev => [shop, ...prev]);
  };

  useEffect(() => {
    if (user && isAuthenticated && !isInitialized) {
      loadShops();
    } else if (!user || !isAuthenticated) {
      setShops([]);
      setLoading(false);
      setIsInitialized(false);
    }
  }, [user?.id, isAuthenticated, isInitialized]);

  const value: ShopsContextType = {
    shops,
    loading,
    error,
    refreshShops: loadShops,
    updateShopInCache,
    removeShopFromCache,
    addShopToCache,
  };

  return (
    <ShopsContext.Provider value={value}>
      {children}
    </ShopsContext.Provider>
  );
}; 