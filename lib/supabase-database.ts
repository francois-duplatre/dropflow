import { supabase } from './supabase';

export interface Shop {
  id: string;
  name: string;
  image: string;
  userId: string;
  createdAt: string;
  productsCount: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  reference: string;
  category: string;
  etsyLink: string;
  dropshippingLink: string;
  status: 'active' | 'inactive';
  shopId: string;
  userId: string;
  createdAt: string;
}

// Service de base de données Supabase
export const supabaseDatabase = {
  // === BOUTIQUES ===
  
  // Récupérer toutes les boutiques d'un utilisateur
  async getShops(userId: string): Promise<Shop[]> {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur récupération boutiques:', error);
        return [];
      }

      return data.map(shop => ({
        id: shop.id,
        name: shop.name,
        image: shop.image || 'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=400',
        userId: shop.user_id,
        createdAt: shop.created_at,
        productsCount: shop.products_count || 0,
      }));
    } catch (error) {
      console.error('Erreur getShops:', error);
      return [];
    }
  },

  // Créer une nouvelle boutique
  async createShop(shop: Omit<Shop, 'id' | 'createdAt'>): Promise<{ success: boolean; shop?: Shop; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('shops')
        .insert({
          name: shop.name,
          image: shop.image,
          user_id: shop.userId,
          products_count: 0,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      const newShop: Shop = {
        id: data.id,
        name: data.name,
        image: data.image || 'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=400',
        userId: data.user_id,
        createdAt: data.created_at,
        productsCount: data.products_count || 0,
      };

      return { success: true, shop: newShop };
    } catch (error) {
      return { success: false, error: 'Erreur lors de la création de la boutique' };
    }
  },

  // Supprimer une boutique
  async deleteShop(shopId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Supprimer d'abord tous les produits de la boutique
      const { error: productsError } = await supabase
        .from('products')
        .delete()
        .eq('shop_id', shopId)
        .eq('user_id', userId);

      if (productsError) {
        console.error('Erreur suppression produits:', productsError);
      }

      // Supprimer la boutique
      const { error } = await supabase
        .from('shops')
        .delete()
        .eq('id', shopId)
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erreur lors de la suppression' };
    }
  },

  // Mettre à jour une boutique
  async updateShop(shopId: string, userId: string, updates: Partial<Shop>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('shops')
        .update({
          name: updates.name,
          image: updates.image,
          products_count: updates.productsCount,
        })
        .eq('id', shopId)
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erreur lors de la mise à jour' };
    }
  },

  // === PRODUITS ===

  // Récupérer tous les produits d'une boutique
  async getProducts(shopId: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur récupération produits:', error);
        return [];
      }

      return data.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        image: product.image || 'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=100',
        reference: product.reference,
        category: product.category || '',
        etsyLink: product.etsy_link || '',
        dropshippingLink: product.dropshipping_link || '',
        status: product.status || 'inactive',
        shopId: product.shop_id,
        userId: product.user_id,
        createdAt: product.created_at,
      }));
    } catch (error) {
      console.error('Erreur getProducts:', error);
      return [];
    }
  },

  // Créer un nouveau produit
  async createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<{ success: boolean; product?: Product; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          reference: product.reference,
          category: product.category,
          etsy_link: product.etsyLink,
          dropshipping_link: product.dropshippingLink,
          status: product.status,
          shop_id: product.shopId,
          user_id: product.userId,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Mettre à jour le nombre de produits dans la boutique
      await this.updateShopProductsCount(product.shopId, product.userId);

      const newProduct: Product = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        price: data.price,
        image: data.image || 'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=100',
        reference: data.reference,
        category: data.category || '',
        etsyLink: data.etsy_link || '',
        dropshippingLink: data.dropshipping_link || '',
        status: data.status || 'inactive',
        shopId: data.shop_id,
        userId: data.user_id,
        createdAt: data.created_at,
      };

      return { success: true, product: newProduct };
    } catch (error) {
      return { success: false, error: 'Erreur lors de la création du produit' };
    }
  },

  // Mettre à jour un produit
  async updateProduct(productId: string, shopId: string, updates: Partial<Product>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: updates.name,
          description: updates.description,
          price: updates.price,
          image: updates.image,
          reference: updates.reference,
          category: updates.category,
          etsy_link: updates.etsyLink,
          dropshipping_link: updates.dropshippingLink,
          status: updates.status,
        })
        .eq('id', productId)
        .eq('shop_id', shopId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erreur lors de la mise à jour' };
    }
  },

  // Supprimer un produit
  async deleteProduct(productId: string, shopId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('shop_id', shopId)
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      // Mettre à jour le nombre de produits dans la boutique
      await this.updateShopProductsCount(shopId, userId);

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erreur lors de la suppression' };
    }
  },

  // Mettre à jour le nombre de produits d'une boutique
  async updateShopProductsCount(shopId: string, userId: string): Promise<void> {
    try {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('shop_id', shopId)
        .eq('user_id', userId);

      if (!error && count !== null) {
        await supabase
          .from('shops')
          .update({ products_count: count })
          .eq('id', shopId)
          .eq('user_id', userId);
      }
    } catch (error) {
      console.error('Erreur mise à jour nombre produits:', error);
    }
  }
}; 