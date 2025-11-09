-- Create quotation codes table for generating quotation numbers
CREATE TABLE public.quotation_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  current_code INTEGER NOT NULL DEFAULT 1,
  prefix TEXT DEFAULT 'Q',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quotations table
CREATE TABLE public.quotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_number TEXT NOT NULL,
  customer_id UUID,
  employee_id UUID,
  quotation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  status TEXT DEFAULT 'draft',
  subtotal NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  notes TEXT,
  terms_and_conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quotation items table
CREATE TABLE public.quotation_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  discount_percentage NUMERIC DEFAULT 0,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quotation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for quotation_codes
CREATE POLICY "Authenticated can select quotation_codes" ON public.quotation_codes
  FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert quotation_codes" ON public.quotation_codes
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update quotation_codes" ON public.quotation_codes
  FOR UPDATE USING (true);
CREATE POLICY "Authenticated can delete quotation_codes" ON public.quotation_codes
  FOR DELETE USING (true);

-- Create RLS policies for quotations
CREATE POLICY "Authenticated can select quotations" ON public.quotations
  FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert quotations" ON public.quotations
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update quotations" ON public.quotations
  FOR UPDATE USING (true);
CREATE POLICY "Authenticated can delete quotations" ON public.quotations
  FOR DELETE USING (true);

-- Create RLS policies for quotation_items
CREATE POLICY "Authenticated can select quotation_items" ON public.quotation_items
  FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert quotation_items" ON public.quotation_items
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update quotation_items" ON public.quotation_items
  FOR UPDATE USING (true);
CREATE POLICY "Authenticated can delete quotation_items" ON public.quotation_items
  FOR DELETE USING (true);

-- Create function to generate quotation numbers
CREATE OR REPLACE FUNCTION public.generate_quotation_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_code INTEGER;
  code_prefix TEXT;
  new_code TEXT;
BEGIN
  -- Get current code and increment it
  UPDATE public.quotation_codes 
  SET current_code = current_code + 1 
  WHERE id = (SELECT id FROM public.quotation_codes LIMIT 1)
  RETURNING current_code, prefix INTO next_code, code_prefix;
  
  -- If no record exists, insert initial record
  IF next_code IS NULL THEN
    INSERT INTO public.quotation_codes (current_code, prefix) 
    VALUES (1, 'Q') 
    RETURNING current_code, prefix INTO next_code, code_prefix;
  END IF;
  
  -- Format the code
  new_code := code_prefix || LPAD(next_code::TEXT, 6, '0');
  
  RETURN new_code;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_quotation_codes_updated_at
  BEFORE UPDATE ON public.quotation_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON public.quotations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quotation_items_updated_at
  BEFORE UPDATE ON public.quotation_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial data
INSERT INTO public.quotation_codes (current_code, prefix) VALUES (0, 'Q');