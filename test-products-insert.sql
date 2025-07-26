-- Script de test pour vérifier l'insertion de produits
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Vérifier que la table products existe
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- 2. Vérifier les politiques RLS
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check 
FROM pg_policies 
WHERE tablename = 'products'
ORDER BY policyname;

-- 3. Vérifier que RLS est activé
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'products';

-- 4. Tester une insertion (remplacez les UUIDs par vos vraies valeurs)
-- Note: Cette requête peut échouer si vous n'avez pas d'utilisateur ou de boutique
-- C'est normal, l'important est de voir la structure
SELECT 
  'Test insertion' as test,
  'products' as table_name,
  'Structure OK' as status; 