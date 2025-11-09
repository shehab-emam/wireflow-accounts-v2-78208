-- Add customer_id to cash_receipts table
ALTER TABLE public.cash_receipts 
ADD COLUMN customer_id uuid REFERENCES public.customers(id);

-- Create index for better performance
CREATE INDEX idx_cash_receipts_customer_id ON public.cash_receipts(customer_id);

-- Create treasury_balance table to track safe balance
CREATE TABLE public.treasury_balance (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  balance numeric NOT NULL DEFAULT 0,
  last_updated timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on treasury_balance
ALTER TABLE public.treasury_balance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for treasury_balance
CREATE POLICY "Authenticated can select treasury_balance" 
ON public.treasury_balance 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated can update treasury_balance" 
ON public.treasury_balance 
FOR UPDATE 
TO authenticated 
USING (true);

-- Insert initial balance record if not exists
INSERT INTO public.treasury_balance (balance) 
VALUES (0)
ON CONFLICT DO NOTHING;

-- Create function to update treasury balance when cash receipt is added
CREATE OR REPLACE FUNCTION public.update_treasury_on_cash_receipt()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update treasury balance by adding the receipt amount
  UPDATE public.treasury_balance
  SET 
    balance = balance + NEW.amount,
    last_updated = now()
  WHERE id = (SELECT id FROM public.treasury_balance LIMIT 1);
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update treasury when cash receipt is inserted
CREATE TRIGGER trigger_update_treasury_on_cash_receipt
AFTER INSERT ON public.cash_receipts
FOR EACH ROW
EXECUTE FUNCTION public.update_treasury_on_cash_receipt();

-- Create function to adjust treasury when cash receipt is updated
CREATE OR REPLACE FUNCTION public.adjust_treasury_on_cash_receipt_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Adjust treasury balance by removing old amount and adding new amount
  UPDATE public.treasury_balance
  SET 
    balance = balance - OLD.amount + NEW.amount,
    last_updated = now()
  WHERE id = (SELECT id FROM public.treasury_balance LIMIT 1);
  
  RETURN NEW;
END;
$$;

-- Create trigger for updates
CREATE TRIGGER trigger_adjust_treasury_on_cash_receipt_update
AFTER UPDATE OF amount ON public.cash_receipts
FOR EACH ROW
EXECUTE FUNCTION public.adjust_treasury_on_cash_receipt_update();

-- Create function to adjust treasury when cash receipt is deleted
CREATE OR REPLACE FUNCTION public.adjust_treasury_on_cash_receipt_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Subtract the deleted receipt amount from treasury balance
  UPDATE public.treasury_balance
  SET 
    balance = balance - OLD.amount,
    last_updated = now()
  WHERE id = (SELECT id FROM public.treasury_balance LIMIT 1);
  
  RETURN OLD;
END;
$$;

-- Create trigger for deletes
CREATE TRIGGER trigger_adjust_treasury_on_cash_receipt_delete
AFTER DELETE ON public.cash_receipts
FOR EACH ROW
EXECUTE FUNCTION public.adjust_treasury_on_cash_receipt_delete();