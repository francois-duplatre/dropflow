-- Script complet pour corriger les politiques RLS
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

DROP POLICY IF EXISTS "Users can view own shops" ON shops;
DROP POLICY IF EXISTS "Users can insert own shops" ON shops;
DROP POLICY IF EXISTS "Users can update own shops" ON shops;
DROP POLICY IF EXISTS "Users can delete own shops" ON shops;

DROP POLICY IF EXISTS "Users can view own products" ON products;
DROP POLICY IF EXISTS "Users can insert own products" ON products;
DROP POLICY IF EXISTS "Users can update own products" ON products;
DROP POLICY IF EXISTS "Users can delete own products" ON products;

-- 2. S'assurer que RLS est activé
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 3. Créer les nouvelles politiques avec la syntaxe correcte
-- Politiques pour la table users
CREATE POLICY "Users can view own profile" 
ON users FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON users FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Politiques pour la table shops
CREATE POLICY "Users can view own shops" 
ON shops FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shops" 
ON shops FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shops" 
ON shops FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shops" 
ON shops FOR DELETE 
USING (auth.uid() = user_id);

-- Politiques pour la table products
CREATE POLICY "Users can view own products" 
ON products FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" 
ON products FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" 
ON products FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" 
ON products FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Vérifier que les politiques sont créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('users', 'shops', 'products')
ORDER BY tablename, policyname; 