-- Create warehouse types table for categorizing warehouses
CREATE TABLE public.warehouse_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the 3 warehouse types
INSERT INTO public.warehouse_types (name, name_ar, description) VALUES
('finished_products', 'مخزن المنتجات تامة الصنع', 'Warehouse for finished products ready for sale'),
('raw_materials', 'مخزن المواد الخام', 'Warehouse for raw materials and components'),
('equipment_spare_parts', 'مخزن المعدات وقطع الغيار', 'Warehouse for equipment and spare parts');

-- Add warehouse_type_id to warehouses table
ALTER TABLE public.warehouses 
ADD COLUMN warehouse_type_id UUID REFERENCES public.warehouse_types(id);

-- Create warehouse transactions table for tracking all movements
CREATE TABLE public.warehouse_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number TEXT NOT NULL UNIQUE,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('incoming', 'outgoing')),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference_number TEXT,
  notes TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('draft', 'completed', 'cancelled')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create warehouse transaction items table
CREATE TABLE public.warehouse_transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.warehouse_transactions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(15, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create warehouse stock balances table for real-time inventory tracking
CREATE TABLE public.warehouse_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id),
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(warehouse_id, product_id)
);

-- Create code generator for warehouse transactions
CREATE TABLE public.warehouse_transaction_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prefix TEXT DEFAULT 'WT',
  current_code INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Initialize transaction codes table
INSERT INTO public.warehouse_transaction_codes (prefix, current_code) VALUES ('WT', 1);

-- Function to generate warehouse transaction number
CREATE OR REPLACE FUNCTION public.generate_warehouse_transaction_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_code INTEGER;
  code_prefix TEXT;
  new_code TEXT;
BEGIN
  UPDATE public.warehouse_transaction_codes 
  SET current_code = current_code + 1 
  WHERE id = (SELECT id FROM public.warehouse_transaction_codes LIMIT 1)
  RETURNING current_code, prefix INTO next_code, code_prefix;
  
  IF next_code IS NULL THEN
    INSERT INTO public.warehouse_transaction_codes (current_code, prefix) 
    VALUES (1, 'WT') 
    RETURNING current_code, prefix INTO next_code, code_prefix;
  END IF;
  
  new_code := code_prefix || LPAD(next_code::TEXT, 6, '0');
  RETURN new_code;
END;
$$;

-- Enable RLS on all new tables
ALTER TABLE public.warehouse_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_transaction_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for warehouse_types (read-only for authenticated users)
CREATE POLICY "Authenticated can select warehouse_types"
ON public.warehouse_types FOR SELECT
TO authenticated
USING (true);

-- RLS Policies for warehouse_transactions
CREATE POLICY "Authenticated can select warehouse_transactions"
ON public.warehouse_transactions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can insert warehouse_transactions"
ON public.warehouse_transactions FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can update warehouse_transactions"
ON public.warehouse_transactions FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated can delete warehouse_transactions"
ON public.warehouse_transactions FOR DELETE
TO authenticated
USING (true);

-- RLS Policies for warehouse_transaction_items
CREATE POLICY "Authenticated can select warehouse_transaction_items"
ON public.warehouse_transaction_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can insert warehouse_transaction_items"
ON public.warehouse_transaction_items FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can update warehouse_transaction_items"
ON public.warehouse_transaction_items FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated can delete warehouse_transaction_items"
ON public.warehouse_transaction_items FOR DELETE
TO authenticated
USING (true);

-- RLS Policies for warehouse_stock
CREATE POLICY "Authenticated can select warehouse_stock"
ON public.warehouse_stock FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can insert warehouse_stock"
ON public.warehouse_stock FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can update warehouse_stock"
ON public.warehouse_stock FOR UPDATE
TO authenticated
USING (true);

-- RLS Policies for warehouse_transaction_codes
CREATE POLICY "Authenticated can select warehouse_transaction_codes"
ON public.warehouse_transaction_codes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can update warehouse_transaction_codes"
ON public.warehouse_transaction_codes FOR UPDATE
TO authenticated
USING (true);

-- Trigger to update updated_at columns
CREATE TRIGGER update_warehouse_types_updated_at
BEFORE UPDATE ON public.warehouse_types
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_warehouse_transactions_updated_at
BEFORE UPDATE ON public.warehouse_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_warehouse_transaction_items_updated_at
BEFORE UPDATE ON public.warehouse_transaction_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_warehouse_transaction_codes_updated_at
BEFORE UPDATE ON public.warehouse_transaction_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();