-- Fix products status constraint to allow three statuses: active, draft, inactive
ALTER TABLE products
ALTER COLUMN status DROP DEFAULT,
ALTER COLUMN status TYPE TEXT;

-- Drop existing constraint and add new one with three statuses
ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_status_check,
ADD CONSTRAINT products_status_check CHECK (status IN ('active', 'draft', 'inactive'));

-- Set default value to 'draft'
ALTER TABLE products
ALTER COLUMN status SET DEFAULT 'draft'; 