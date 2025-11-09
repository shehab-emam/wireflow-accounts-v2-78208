-- Create credit_sales_invoice_codes table
CREATE TABLE IF NOT EXISTS public.credit_sales_invoice_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  current_code INTEGER NOT NULL DEFAULT 1,
  prefix TEXT DEFAULT 'CRI',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial record
INSERT INTO public.credit_sales_invoice_codes (current_code, prefix) 
VALUES (1, 'CRI')
ON CONFLICT DO NOTHING;

-- Create function to generate credit invoice number
CREATE OR REPLACE FUNCTION public.generate_credit_invoice_number()
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  next_code INTEGER;
  code_prefix TEXT;
  new_code TEXT;
BEGIN
  UPDATE public.credit_sales_invoice_codes 
  SET current_code = current_code + 1 
  WHERE id = (SELECT id FROM public.credit_sales_invoice_codes LIMIT 1)
  RETURNING current_code, prefix INTO next_code, code_prefix;
  
  IF next_code IS NULL THEN
    INSERT INTO public.credit_sales_invoice_codes (current_code, prefix) 
    VALUES (1, 'CRI') 
    RETURNING current_code, prefix INTO next_code, code_prefix;
  END IF;
  
  new_code := code_prefix || LPAD(next_code::TEXT, 6, '0');
  RETURN new_code;
END;
$function$;

-- Create credit_sales_invoices table
CREATE TABLE IF NOT EXISTS public.credit_sales_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id),
  employee_id UUID REFERENCES public.employees(id),
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  subtotal NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  paid_amount NUMERIC DEFAULT 0,
  remaining_amount NUMERIC DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create credit_sales_invoice_items table
CREATE TABLE IF NOT EXISTS public.credit_sales_invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.credit_sales_invoices(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  warehouse_id UUID NOT NULL,
  quantity INTEGER NOT NULL,
  available_quantity INTEGER DEFAULT 0,
  unit_price NUMERIC NOT NULL,
  discount_percentage NUMERIC DEFAULT 0,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credit_sales_invoice_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_sales_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_sales_invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for credit_sales_invoice_codes
CREATE POLICY "Authenticated can select credit_sales_invoice_codes" 
ON public.credit_sales_invoice_codes 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated can update credit_sales_invoice_codes" 
ON public.credit_sales_invoice_codes 
FOR UPDATE 
TO authenticated 
USING (true);

-- RLS Policies for credit_sales_invoices
CREATE POLICY "Authenticated can select credit_sales_invoices" 
ON public.credit_sales_invoices 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated can insert credit_sales_invoices" 
ON public.credit_sales_invoices 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated can update credit_sales_invoices" 
ON public.credit_sales_invoices 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated can delete credit_sales_invoices" 
ON public.credit_sales_invoices 
FOR DELETE 
TO authenticated 
USING (true);

-- RLS Policies for credit_sales_invoice_items
CREATE POLICY "Authenticated can select credit_sales_invoice_items" 
ON public.credit_sales_invoice_items 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated can insert credit_sales_invoice_items" 
ON public.credit_sales_invoice_items 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated can update credit_sales_invoice_items" 
ON public.credit_sales_invoice_items 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated can delete credit_sales_invoice_items" 
ON public.credit_sales_invoice_items 
FOR DELETE 
TO authenticated 
USING (true);