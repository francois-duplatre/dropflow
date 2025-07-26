-- Mettre à jour les produits existants qui n'ont pas de purchase_price
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Mettre à jour les produits qui ont purchase_price = NULL ou 0
UPDATE products 
SET purchase_price = price * 0.6 
WHERE purchase_price IS NULL OR purchase_price = 0;

-- Vérifier que tous les produits ont maintenant un purchase_price
SELECT 
  id,
  name,
  price,
  purchase_price,
  (price - purchase_price) as margin,
  ROUND(((price - purchase_price) / price * 100), 1) as margin_percentage
FROM products 
ORDER BY created_at DESC
LIMIT 10; 