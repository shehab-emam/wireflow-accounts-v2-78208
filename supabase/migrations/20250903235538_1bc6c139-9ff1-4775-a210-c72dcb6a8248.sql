-- Add foreign key constraints for quotations table
ALTER TABLE public.quotations 
ADD CONSTRAINT quotations_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;

ALTER TABLE public.quotations 
ADD CONSTRAINT quotations_employee_id_fkey 
FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;

-- Add foreign key constraints for quotation_items table
ALTER TABLE public.quotation_items 
ADD CONSTRAINT quotation_items_quotation_id_fkey 
FOREIGN KEY (quotation_id) REFERENCES public.quotations(id) ON DELETE CASCADE;

ALTER TABLE public.quotation_items 
ADD CONSTRAINT quotation_items_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Add missing phone and email columns to customers table if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'phone') THEN
        ALTER TABLE public.customers ADD COLUMN phone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'email') THEN
        ALTER TABLE public.customers ADD COLUMN email TEXT;
    END IF;
END $$;