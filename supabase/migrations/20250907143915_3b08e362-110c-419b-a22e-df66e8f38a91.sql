-- Create cash sales invoices table
CREATE TABLE public.cash_sales_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  customer_phone TEXT,
  sales_representative TEXT,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  subtotal NUMERIC DEFAULT 0,
  discount_percentage NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  payment_amount NUMERIC DEFAULT 0,
  change_amount NUMERIC DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cash sales invoice items table
CREATE TABLE public.cash_sales_invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.cash_sales_invoices(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id),
  quantity INTEGER NOT NULL,
  available_quantity INTEGER DEFAULT 0,
  unit_price NUMERIC NOT NULL,
  discount_percentage NUMERIC DEFAULT 0,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoice number codes table
CREATE TABLE public.cash_invoice_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  current_code INTEGER NOT NULL DEFAULT 1,
  prefix TEXT DEFAULT 'CSI',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial record
INSERT INTO public.cash_invoice_codes (current_code, prefix) VALUES (1, 'CSI');

-- Enable RLS
ALTER TABLE public.cash_sales_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_sales_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_invoice_codes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated can select cash_sales_invoices" 
ON public.cash_sales_invoices FOR SELECT 
USING (true);

CREATE POLICY "Authenticated can insert cash_sales_invoices" 
ON public.cash_sales_invoices FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated can update cash_sales_invoices" 
ON public.cash_sales_invoices FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated can delete cash_sales_invoices" 
ON public.cash_sales_invoices FOR DELETE 
USING (true);

CREATE POLICY "Authenticated can select cash_sales_invoice_items" 
ON public.cash_sales_invoice_items FOR SELECT 
USING (true);

CREATE POLICY "Authenticated can insert cash_sales_invoice_items" 
ON public.cash_sales_invoice_items FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated can update cash_sales_invoice_items" 
ON public.cash_sales_invoice_items FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated can delete cash_sales_invoice_items" 
ON public.cash_sales_invoice_items FOR DELETE 
USING (true);

CREATE POLICY "Authenticated can select cash_invoice_codes" 
ON public.cash_invoice_codes FOR SELECT 
USING (true);

CREATE POLICY "Authenticated can update cash_invoice_codes" 
ON public.cash_invoice_codes FOR UPDATE 
USING (true);

-- Create function to generate cash invoice number
CREATE OR REPLACE FUNCTION public.generate_cash_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $function$
DECLARE
  next_code INTEGER;
  code_prefix TEXT;
  new_code TEXT;
BEGIN
  -- Get current code and increment it
  UPDATE public.cash_invoice_codes 
  SET current_code = current_code + 1 
  WHERE id = (SELECT id FROM public.cash_invoice_codes LIMIT 1)
  RETURNING current_code, prefix INTO next_code, code_prefix;
  
  -- If no record exists, insert initial record
  IF next_code IS NULL THEN
    INSERT INTO public.cash_invoice_codes (current_code, prefix) 
    VALUES (1, 'CSI') 
    RETURNING current_code, prefix INTO next_code, code_prefix;
  END IF;
  
  -- Format the code
  new_code := code_prefix || LPAD(next_code::TEXT, 6, '0');
  
  RETURN new_code;
END;
$function$;

-- Create triggers for timestamp updates
CREATE TRIGGER update_cash_sales_invoices_updated_at
BEFORE UPDATE ON public.cash_sales_invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cash_sales_invoice_items_updated_at
BEFORE UPDATE ON public.cash_sales_invoice_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();