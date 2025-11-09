-- Create function to update treasury on cash disbursement (subtract amount)
CREATE OR REPLACE FUNCTION public.update_treasury_on_cash_disbursement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Update treasury balance by subtracting the disbursement amount
  UPDATE public.treasury_balance
  SET 
    balance = balance - NEW.amount,
    last_updated = now()
  WHERE id = (SELECT id FROM public.treasury_balance LIMIT 1);
  
  RETURN NEW;
END;
$function$;

-- Create trigger for cash disbursement insert
DROP TRIGGER IF EXISTS update_treasury_on_cash_disbursement_insert ON public.cash_disbursements;
CREATE TRIGGER update_treasury_on_cash_disbursement_insert
  AFTER INSERT ON public.cash_disbursements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_treasury_on_cash_disbursement();

-- Create function to adjust treasury on cash disbursement update
CREATE OR REPLACE FUNCTION public.adjust_treasury_on_cash_disbursement_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Adjust treasury balance by adding back old amount and subtracting new amount
  UPDATE public.treasury_balance
  SET 
    balance = balance + OLD.amount - NEW.amount,
    last_updated = now()
  WHERE id = (SELECT id FROM public.treasury_balance LIMIT 1);
  
  RETURN NEW;
END;
$function$;

-- Create trigger for cash disbursement update
DROP TRIGGER IF EXISTS adjust_treasury_on_cash_disbursement_update ON public.cash_disbursements;
CREATE TRIGGER adjust_treasury_on_cash_disbursement_update
  AFTER UPDATE ON public.cash_disbursements
  FOR EACH ROW
  EXECUTE FUNCTION public.adjust_treasury_on_cash_disbursement_update();

-- Create function to adjust treasury on cash disbursement delete
CREATE OR REPLACE FUNCTION public.adjust_treasury_on_cash_disbursement_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Add back the deleted disbursement amount to treasury balance
  UPDATE public.treasury_balance
  SET 
    balance = balance + OLD.amount,
    last_updated = now()
  WHERE id = (SELECT id FROM public.treasury_balance LIMIT 1);
  
  RETURN OLD;
END;
$function$;

-- Create trigger for cash disbursement delete
DROP TRIGGER IF EXISTS adjust_treasury_on_cash_disbursement_delete ON public.cash_disbursements;
CREATE TRIGGER adjust_treasury_on_cash_disbursement_delete
  AFTER DELETE ON public.cash_disbursements
  FOR EACH ROW
  EXECUTE FUNCTION public.adjust_treasury_on_cash_disbursement_delete();