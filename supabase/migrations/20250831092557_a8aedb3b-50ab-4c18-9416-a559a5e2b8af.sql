-- Create customer types table
CREATE TABLE public.customer_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create countries table
CREATE TABLE public.countries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create provinces table
CREATE TABLE public.provinces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country_id UUID REFERENCES public.countries(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer codes table
CREATE TABLE public.customer_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  current_code INTEGER NOT NULL DEFAULT 1,
  prefix TEXT DEFAULT 'C',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_code TEXT NOT NULL UNIQUE,
  customer_type_id UUID REFERENCES public.customer_types(id),
  business_owner_name TEXT NOT NULL,
  institution_name TEXT,
  address TEXT,
  location_link TEXT,
  country_id UUID REFERENCES public.countries(id),
  province_id UUID REFERENCES public.provinces(id),
  whatsapp_number TEXT,
  phone_number TEXT,
  opening_balance NUMERIC DEFAULT 0,
  credit_limit NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.customer_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for customer_types
CREATE POLICY "Authenticated can select customer_types" ON public.customer_types FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert customer_types" ON public.customer_types FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update customer_types" ON public.customer_types FOR UPDATE USING (true);
CREATE POLICY "Authenticated can delete customer_types" ON public.customer_types FOR DELETE USING (true);

-- Create RLS policies for countries
CREATE POLICY "Authenticated can select countries" ON public.countries FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert countries" ON public.countries FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update countries" ON public.countries FOR UPDATE USING (true);
CREATE POLICY "Authenticated can delete countries" ON public.countries FOR DELETE USING (true);

-- Create RLS policies for provinces
CREATE POLICY "Authenticated can select provinces" ON public.provinces FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert provinces" ON public.provinces FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update provinces" ON public.provinces FOR UPDATE USING (true);
CREATE POLICY "Authenticated can delete provinces" ON public.provinces FOR DELETE USING (true);

-- Create RLS policies for customer_codes
CREATE POLICY "Authenticated can select customer_codes" ON public.customer_codes FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert customer_codes" ON public.customer_codes FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update customer_codes" ON public.customer_codes FOR UPDATE USING (true);
CREATE POLICY "Authenticated can delete customer_codes" ON public.customer_codes FOR DELETE USING (true);

-- Create RLS policies for customers
CREATE POLICY "Authenticated can select customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert customers" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update customers" ON public.customers FOR UPDATE USING (true);
CREATE POLICY "Authenticated can delete customers" ON public.customers FOR DELETE USING (true);

-- Create function to generate customer code
CREATE OR REPLACE FUNCTION public.generate_customer_code()
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  next_code INTEGER;
  code_prefix TEXT;
  new_code TEXT;
BEGIN
  -- Get current code and increment it
  UPDATE public.customer_codes 
  SET current_code = current_code + 1 
  WHERE id = (SELECT id FROM public.customer_codes LIMIT 1)
  RETURNING current_code, prefix INTO next_code, code_prefix;
  
  -- If no record exists, insert initial record
  IF next_code IS NULL THEN
    INSERT INTO public.customer_codes (current_code, prefix) 
    VALUES (1, 'C') 
    RETURNING current_code, prefix INTO next_code, code_prefix;
  END IF;
  
  -- Format the code
  new_code := code_prefix || LPAD(next_code::TEXT, 6, '0');
  
  RETURN new_code;
END;
$function$;

-- Create trigger for updated_at columns
CREATE TRIGGER update_customer_types_updated_at
  BEFORE UPDATE ON public.customer_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_countries_updated_at
  BEFORE UPDATE ON public.countries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_provinces_updated_at
  BEFORE UPDATE ON public.provinces
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_codes_updated_at
  BEFORE UPDATE ON public.customer_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial customer code record
INSERT INTO public.customer_codes (current_code, prefix) VALUES (0, 'C');

-- Insert some initial data
INSERT INTO public.customer_types (name) VALUES 
('عميل'), 
('مورد'), 
('عميل ومورد');

INSERT INTO public.countries (name) VALUES 
('مصر'), 
('السعودية'), 
('الإمارات'), 
('الكويت');