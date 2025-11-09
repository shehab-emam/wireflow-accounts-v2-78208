-- Create product categories table
CREATE TABLE public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create units of measure table
CREATE TABLE public.units_of_measure (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product codes sequence table
CREATE TABLE public.product_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  current_code INTEGER NOT NULL DEFAULT 1,
  prefix TEXT DEFAULT 'P',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial product code sequence
INSERT INTO public.product_codes (current_code, prefix) VALUES (1, 'P');

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_code TEXT NOT NULL UNIQUE,
  barcode TEXT,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.product_categories(id),
  unit_id UUID REFERENCES public.units_of_measure(id),
  sale_price DECIMAL(10,2) DEFAULT 0,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  opening_balance INTEGER DEFAULT 0,
  purchase_limit INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units_of_measure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create public access policies (since this is a business application)
CREATE POLICY "Allow public access to product_categories" 
ON public.product_categories FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access to units_of_measure" 
ON public.units_of_measure FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access to product_codes" 
ON public.product_codes FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access to products" 
ON public.products FOR ALL USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_product_categories_updated_at
  BEFORE UPDATE ON public.product_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_units_of_measure_updated_at
  BEFORE UPDATE ON public.units_of_measure
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_codes_updated_at
  BEFORE UPDATE ON public.product_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate next product code
CREATE OR REPLACE FUNCTION public.generate_product_code()
RETURNS TEXT AS $$
DECLARE
  next_code INTEGER;
  code_prefix TEXT;
  new_code TEXT;
BEGIN
  -- Get current code and increment it
  UPDATE public.product_codes 
  SET current_code = current_code + 1 
  WHERE id = (SELECT id FROM public.product_codes LIMIT 1)
  RETURNING current_code, prefix INTO next_code, code_prefix;
  
  -- Format the code
  new_code := code_prefix || LPAD(next_code::TEXT, 6, '0');
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate barcode
CREATE OR REPLACE FUNCTION public.generate_barcode()
RETURNS TEXT AS $$
BEGIN
  -- Generate a simple 13-digit barcode (EAN-13 format without check digit calculation)
  RETURN '2' || LPAD(floor(random() * 1000000000000)::TEXT, 12, '0');
END;
$$ LANGUAGE plpgsql;

-- Insert some initial categories and units
INSERT INTO public.product_categories (name) VALUES 
('إلكترونيات'),
('ملابس'),
('طعام ومشروبات'),
('أدوات منزلية'),
('كتب وقرطاسية');

INSERT INTO public.units_of_measure (name) VALUES 
('قطعة'),
('كيلو جرام'),
('لتر'),
('متر'),
('علبة'),
('كرتونة'),
('دزينة');