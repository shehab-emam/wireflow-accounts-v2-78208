-- Create warehouses table
CREATE TABLE public.warehouses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employees table
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase order codes table
CREATE TABLE public.purchase_order_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prefix TEXT DEFAULT 'PO',
  current_code INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase orders table
CREATE TABLE public.purchase_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  permit_number TEXT,
  warehouse_id UUID REFERENCES public.warehouses(id),
  employee_id UUID REFERENCES public.employees(id),
  description TEXT,
  total_items INTEGER DEFAULT 0,
  total_pieces INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase order items table
CREATE TABLE public.purchase_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for warehouses
CREATE POLICY "Authenticated can select warehouses" ON public.warehouses FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert warehouses" ON public.warehouses FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update warehouses" ON public.warehouses FOR UPDATE USING (true);
CREATE POLICY "Authenticated can delete warehouses" ON public.warehouses FOR DELETE USING (true);

-- Create RLS policies for employees
CREATE POLICY "Authenticated can select employees" ON public.employees FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert employees" ON public.employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update employees" ON public.employees FOR UPDATE USING (true);
CREATE POLICY "Authenticated can delete employees" ON public.employees FOR DELETE USING (true);

-- Create RLS policies for purchase_order_codes
CREATE POLICY "Authenticated can select purchase_order_codes" ON public.purchase_order_codes FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert purchase_order_codes" ON public.purchase_order_codes FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update purchase_order_codes" ON public.purchase_order_codes FOR UPDATE USING (true);
CREATE POLICY "Authenticated can delete purchase_order_codes" ON public.purchase_order_codes FOR DELETE USING (true);

-- Create RLS policies for purchase_orders
CREATE POLICY "Authenticated can select purchase_orders" ON public.purchase_orders FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert purchase_orders" ON public.purchase_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update purchase_orders" ON public.purchase_orders FOR UPDATE USING (true);
CREATE POLICY "Authenticated can delete purchase_orders" ON public.purchase_orders FOR DELETE USING (true);

-- Create RLS policies for purchase_order_items
CREATE POLICY "Authenticated can select purchase_order_items" ON public.purchase_order_items FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert purchase_order_items" ON public.purchase_order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update purchase_order_items" ON public.purchase_order_items FOR UPDATE USING (true);
CREATE POLICY "Authenticated can delete purchase_order_items" ON public.purchase_order_items FOR DELETE USING (true);

-- Create function to generate purchase order number
CREATE OR REPLACE FUNCTION public.generate_purchase_order_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  next_code INTEGER;
  code_prefix TEXT;
  new_code TEXT;
BEGIN
  -- Get current code and increment it
  UPDATE public.purchase_order_codes 
  SET current_code = current_code + 1 
  WHERE id = (SELECT id FROM public.purchase_order_codes LIMIT 1)
  RETURNING current_code, prefix INTO next_code, code_prefix;
  
  -- If no record exists, insert initial record
  IF next_code IS NULL THEN
    INSERT INTO public.purchase_order_codes (current_code, prefix) 
    VALUES (1, 'PO') 
    RETURNING current_code, prefix INTO next_code, code_prefix;
  END IF;
  
  -- Format the code
  new_code := code_prefix || LPAD(next_code::TEXT, 6, '0');
  
  RETURN new_code;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_warehouses_updated_at
  BEFORE UPDATE ON public.warehouses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchase_order_codes_updated_at
  BEFORE UPDATE ON public.purchase_order_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchase_order_items_updated_at
  BEFORE UPDATE ON public.purchase_order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial data
INSERT INTO public.purchase_order_codes (prefix, current_code) VALUES ('PO', 0);

-- Insert sample warehouses
INSERT INTO public.warehouses (name, location, description) VALUES
  ('المخزن الرئيسي', 'القاهرة', 'المخزن الرئيسي للشركة'),
  ('مخزن الفرع الأول', 'الإسكندرية', 'مخزن فرع الإسكندرية'),
  ('مخزن قطع الغيار', 'الجيزة', 'مخزن مخصص لقطع الغيار');

-- Insert sample employees
INSERT INTO public.employees (name, position, phone) VALUES
  ('أحمد محمد', 'مدير المخزن', '01234567890'),
  ('فاطمة علي', 'أمين المخزن', '01234567891'),
  ('محمد حسن', 'موظف استقبال', '01234567892');