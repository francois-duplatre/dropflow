-- Mettre à jour le compteur de produits pour toutes les boutiques
UPDATE shops 
SET products_count = (
  SELECT COUNT(*) 
  FROM products 
  WHERE products.shop_id = shops.id
);

-- Vérifier les résultats
SELECT 
  s.id,
  s.name,
  s.products_count,
  COUNT(p.id) as real_count
FROM shops s
LEFT JOIN products p ON s.id = p.shop_id
GROUP BY s.id, s.name, s.products_count
ORDER BY s.name; 