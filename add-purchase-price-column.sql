-- Ajouter la colonne purchase_price à la table products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(10,2) DEFAULT 0.00;

-- Mettre à jour les produits existants avec une valeur par défaut
UPDATE products 
SET purchase_price = price * 0.6 
WHERE purchase_price IS NULL OR purchase_price = 0;

-- Vérifier que la colonne a été ajoutée
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'purchase_price'; 