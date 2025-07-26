'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';
import { supabaseStorage } from '@/lib/supabase-storage';

export interface Shop {
  id: string;
  name: string;
  image: string;
  user_id: string;
  products_count: number;
  created_at: string;
  updated_at: string;
}

export const useShops = () => {
  const { user, isAuthenticated } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadShops = async () => {
    if (!user || !isAuthenticated) {
      setShops([]);
      setLoading(false);
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
    }
  };

  const createShop = async (shopData: { name: string; image?: File | string }) => {
    if (!user || !isAuthenticated) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      let imageUrl = shopData.image as string;

      // Si c'est un fichier, uploader l'image
      if (shopData.image instanceof File) {
        const uploadResult = await supabaseStorage.uploadShopImage(shopData.image, user.id);
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Erreur lors de l\'upload de l\'image');
        }
        imageUrl = uploadResult.url!;
      }

      const { data, error } = await supabase
        .from('shops')
        .insert({
          name: shopData.name,
          image: imageUrl,
          user_id: user.id,
          products_count: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur création boutique:', error);
        throw new Error('Erreur lors de la création de la boutique');
      }

      // Mettre à jour l'état local immédiatement
      setShops(prev => [data, ...prev]);
      return { success: true, shop: data };
    } catch (err: any) {
      console.error('Erreur création boutique:', err);
      throw new Error(err.message || 'Erreur lors de la création de la boutique');
    }
  };

  const deleteShop = async (shopId: string) => {
    if (!user || !isAuthenticated) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      // Récupérer la boutique pour supprimer l'image
      const { data: shop } = await supabase
        .from('shops')
        .select('image')
        .eq('id', shopId)
        .eq('user_id', user.id)
        .single();

      // Supprimer la boutique
      const { error } = await supabase
        .from('shops')
        .delete()
        .eq('id', shopId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erreur suppression boutique:', error);
        throw new Error('Erreur lors de la suppression de la boutique');
      }

      // Supprimer l'image si elle a été uploadée
      if (shop?.image && supabaseStorage.isUploadedImage(shop.image)) {
        await supabaseStorage.deleteShopImage(shop.image);
      }

      // Mettre à jour l'état local immédiatement
      setShops(prev => prev.filter(shop => shop.id !== shopId));
      return { success: true };
    } catch (err: any) {
      console.error('Erreur suppression boutique:', err);
      throw new Error(err.message || 'Erreur lors de la suppression de la boutique');
    }
  };

  const updateShop = async (shopId: string, updates: Partial<Shop>) => {
    if (!user || !isAuthenticated) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      const { data, error } = await supabase
        .from('shops')
        .update(updates)
        .eq('id', shopId)
        .eq('user_id', user.id) // Double sécurité
        .select()
        .single();

      if (error) {
        console.error('Erreur mise à jour boutique:', error);
        throw new Error('Erreur lors de la mise à jour de la boutique');
      }

      // Mettre à jour l'état local immédiatement
      setShops(prev => prev.map(shop => shop.id === shopId ? data : shop));
      return { success: true, shop: data };
    } catch (err: any) {
      console.error('Erreur mise à jour boutique:', err);
      throw new Error(err.message || 'Erreur lors de la mise à jour de la boutique');
    }
  };

  useEffect(() => {
    if (user && isAuthenticated) {
      loadShops();
    } else {
      setShops([]);
      setLoading(false);
    }
  }, [user?.id, isAuthenticated]);

  return {
    shops,
    loading,
    error,
    createShop,
    deleteShop,
    updateShop,
    refreshShops: loadShops,
  };
}; 