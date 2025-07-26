import { supabase } from './supabase';

export const supabaseStorage = {
  // Upload une image de boutique
  uploadShopImage: async (file: File, userId: string): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Upload du fichier
      const { data, error } = await supabase.storage
        .from('shop-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erreur upload image:', error);
        return { success: false, error: error.message };
      }

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('shop-images')
        .getPublicUrl(fileName);

      return { success: true, url: publicUrl };
    } catch (error: any) {
      console.error('Erreur upload image:', error);
      return { success: false, error: error.message };
    }
  },

  // Supprimer une image
  deleteShopImage: async (imageUrl: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Extraire le nom du fichier de l'URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const userId = urlParts[urlParts.length - 2];

      const { error } = await supabase.storage
        .from('shop-images')
        .remove([`${userId}/${fileName}`]);

      if (error) {
        console.error('Erreur suppression image:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Erreur suppression image:', error);
      return { success: false, error: error.message };
    }
  },

  // Vérifier si une URL est une image uploadée
  isUploadedImage: (url: string): boolean => {
    return url.includes('supabase.co/storage/v1/object/public/shop-images/');
  }
}; 