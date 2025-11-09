-- Add foreign key constraint for warehouse_id in credit_sales_invoice_items
ALTER TABLE public.credit_sales_invoice_items
ADD CONSTRAINT credit_sales_invoice_items_warehouse_id_fkey 
FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);