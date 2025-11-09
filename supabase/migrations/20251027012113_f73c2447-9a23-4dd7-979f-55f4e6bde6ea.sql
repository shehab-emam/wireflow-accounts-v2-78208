-- Add code_prefix column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS code_prefix TEXT DEFAULT 'P';

-- Update existing products to have proper prefix based on their current code
UPDATE products 
SET code_prefix = SUBSTRING(product_code FROM 1 FOR 1)
WHERE code_prefix IS NULL OR code_prefix = 'P';

-- Add comment to explain the column
COMMENT ON COLUMN products.code_prefix IS 'Product code prefix: P=Products, M=Materials, R=Requirements, F=Finished, S=Spare Parts';