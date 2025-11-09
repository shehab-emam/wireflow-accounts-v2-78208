-- Add customer_id to cash_sales_invoices table
ALTER TABLE public.cash_sales_invoices 
ADD COLUMN customer_id uuid REFERENCES public.customers(id);

-- Add index for better query performance
CREATE INDEX idx_cash_sales_invoices_customer_id ON public.cash_sales_invoices(customer_id);