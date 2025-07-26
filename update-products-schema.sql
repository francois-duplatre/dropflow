-- Ajouter le prix d'achat à la table products
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Ajouter la colonne purchase_price (prix d'achat)
ALTER TABLE products ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Mettre à jour les produits existants si nécessaire
UPDATE products SET purchase_price = price * 0.6 WHERE purchase_price = 0;

-- Vérifier la structure mise à jour
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position; 