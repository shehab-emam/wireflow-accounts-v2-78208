-- Create dispatch order codes table for auto-generating order numbers
CREATE TABLE public.dispatch_order_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  current_code INTEGER NOT NULL DEFAULT 1,
  prefix TEXT DEFAULT 'DO',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dispatch orders table
CREATE TABLE public.dispatch_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL,
  permit_number TEXT,
  warehouse_id UUID,
  employee_id UUID,
  description TEXT,
  total_items INTEGER DEFAULT 0,
  total_pieces INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dispatch order items table
CREATE TABLE public.dispatch_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dispatch_order_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.dispatch_order_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatch_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatch_order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for dispatch_order_codes
CREATE POLICY "Authenticated can select dispatch_order_codes" 
ON public.dispatch_order_codes 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated can insert dispatch_order_codes" 
ON public.dispatch_order_codes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated can update dispatch_order_codes" 
ON public.dispatch_order_codes 
FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated can delete dispatch_order_codes" 
ON public.dispatch_order_codes 
FOR DELETE 
USING (true);

-- Create RLS policies for dispatch_orders
CREATE POLICY "Authenticated can select dispatch_orders" 
ON public.dispatch_orders 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated can insert dispatch_orders" 
ON public.dispatch_orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated can update dispatch_orders" 
ON public.dispatch_orders 
FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated can delete dispatch_orders" 
ON public.dispatch_orders 
FOR DELETE 
USING (true);

-- Create RLS policies for dispatch_order_items
CREATE POLICY "Authenticated can select dispatch_order_items" 
ON public.dispatch_order_items 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated can insert dispatch_order_items" 
ON public.dispatch_order_items 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated can update dispatch_order_items" 
ON public.dispatch_order_items 
FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated can delete dispatch_order_items" 
ON public.dispatch_order_items 
FOR DELETE 
USING (true);

-- Create function to generate dispatch order numbers
CREATE OR REPLACE FUNCTION public.generate_dispatch_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $function$
DECLARE
  next_code INTEGER;
  code_prefix TEXT;
  new_code TEXT;
BEGIN
  -- Get current code and increment it
  UPDATE public.dispatch_order_codes 
  SET current_code = current_code + 1 
  WHERE id = (SELECT id FROM public.dispatch_order_codes LIMIT 1)
  RETURNING current_code, prefix INTO next_code, code_prefix;
  
  -- If no record exists, insert initial record
  IF next_code IS NULL THEN
    INSERT INTO public.dispatch_order_codes (current_code, prefix) 
    VALUES (1, 'DO') 
    RETURNING current_code, prefix INTO next_code, code_prefix;
  END IF;
  
  -- Format the code
  new_code := code_prefix || LPAD(next_code::TEXT, 6, '0');
  
  RETURN new_code;
END;
$function$;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_dispatch_order_codes_updated_at
BEFORE UPDATE ON public.dispatch_order_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dispatch_orders_updated_at
BEFORE UPDATE ON public.dispatch_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dispatch_order_items_updated_at
BEFORE UPDATE ON public.dispatch_order_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial data
INSERT INTO public.dispatch_order_codes (current_code, prefix) VALUES (0, 'DO');