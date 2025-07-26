-- Corriger la contrainte de statut dans la table products
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Supprimer l'ancienne contrainte si elle existe
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_status_check;

-- Recréer la contrainte avec la bonne syntaxe
ALTER TABLE products ADD CONSTRAINT products_status_check 
CHECK (status IN ('active', 'draft'));

-- Vérifier que la contrainte est bien créée
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'products'::regclass 
AND conname = 'products_status_check';

-- Vérifier la structure de la table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'status'; 