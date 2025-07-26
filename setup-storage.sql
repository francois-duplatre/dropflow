-- Configuration Supabase Storage pour les images de boutiques
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Créer le bucket pour les images de boutiques
INSERT INTO storage.buckets (id, name, public)
VALUES ('shop-images', 'shop-images', true)
ON CONFLICT (id) DO NOTHING;

-- Politique pour permettre l'upload d'images (utilisateurs authentifiés)
CREATE POLICY "Users can upload shop images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'shop-images' 
  AND auth.role() = 'authenticated'
);

-- Politique pour permettre la lecture d'images (publiques)
CREATE POLICY "Anyone can view shop images" ON storage.objects
FOR SELECT USING (bucket_id = 'shop-images');

-- Politique pour permettre la suppression d'images (propriétaire uniquement)
CREATE POLICY "Users can delete own shop images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'shop-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique pour permettre la mise à jour d'images (propriétaire uniquement)
CREATE POLICY "Users can update own shop images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'shop-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
); 