-- Create table for cash receipts (إذن استلام نقدية)
CREATE TABLE IF NOT EXISTS public.cash_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voucher_number TEXT NOT NULL UNIQUE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  received_from TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  purpose TEXT,
  description TEXT,
  received_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create table for cash disbursements (إذن صرف نقدية)
CREATE TABLE IF NOT EXISTS public.cash_disbursements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voucher_number TEXT NOT NULL UNIQUE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  paid_to TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  purpose TEXT,
  description TEXT,
  received_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create table for check receipts (إذن استلام شيك)
CREATE TABLE IF NOT EXISTS public.check_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voucher_number TEXT NOT NULL UNIQUE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_number TEXT NOT NULL,
  check_date DATE NOT NULL,
  bank_name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  received_from TEXT NOT NULL,
  due_date DATE,
  purpose TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create table for check disbursements (إذن صرف شيك)
CREATE TABLE IF NOT EXISTS public.check_disbursements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voucher_number TEXT NOT NULL UNIQUE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_number TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  paid_to TEXT NOT NULL,
  purpose TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create table for expenses disbursements (إذن صرف مصروفات)
CREATE TABLE IF NOT EXISTS public.expenses_disbursements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voucher_number TEXT NOT NULL UNIQUE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  expense_category TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  paid_to TEXT NOT NULL,
  purpose TEXT,
  description TEXT,
  approved_by TEXT,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create table for custody disbursements (إذن صرف عهدة)
CREATE TABLE IF NOT EXISTS public.custody_disbursements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voucher_number TEXT NOT NULL UNIQUE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  custodian_name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  purpose TEXT,
  description TEXT,
  expected_return_date DATE,
  approved_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create table for custody settlements (إذن تصفية عهدة)
CREATE TABLE IF NOT EXISTS public.custody_settlements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voucher_number TEXT NOT NULL UNIQUE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  custody_disbursement_id UUID REFERENCES public.custody_disbursements(id),
  custodian_name TEXT NOT NULL,
  original_amount NUMERIC NOT NULL DEFAULT 0,
  spent_amount NUMERIC NOT NULL DEFAULT 0,
  returned_amount NUMERIC NOT NULL DEFAULT 0,
  settlement_date DATE NOT NULL,
  notes TEXT,
  approved_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on all tables
ALTER TABLE public.cash_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_disbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_disbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses_disbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custody_disbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custody_settlements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for cash_receipts
CREATE POLICY "Authenticated can select cash_receipts" ON public.cash_receipts FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert cash_receipts" ON public.cash_receipts FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update cash_receipts" ON public.cash_receipts FOR UPDATE USING (true);
CREATE POLICY "Authenticated can delete cash_receipts" ON public.cash_receipts FOR DELETE USING (true);

-- Create RLS policies for cash_disbursements
CREATE POLICY "Authenticated can select cash_disbursements" ON public.cash_disbursements FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert cash_disbursements" ON public.cash_disbursements FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update cash_disbursements" ON public.cash_disbursements FOR UPDATE USING (true);
CREATE POLICY "Authenticated can delete cash_disbursements" ON public.cash_disbursements FOR DELETE USING (true);

-- Create RLS policies for check_receipts
CREATE POLICY "Authenticated can select check_receipts" ON public.check_receipts FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert check_receipts" ON public.check_receipts FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update check_receipts" ON public.check_receipts FOR UPDATE USING (true);
CREATE POLICY "Authenticated can delete check_receipts" ON public.check_receipts FOR DELETE USING (true);

-- Create RLS policies for check_disbursements
CREATE POLICY "Authenticated can select check_disbursements" ON public.check_disbursements FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert check_disbursements" ON public.check_disbursements FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update check_disbursements" ON public.check_disbursements FOR UPDATE USING (true);
CREATE POLICY "Authenticated can delete check_disbursements" ON public.check_disbursements FOR DELETE USING (true);

-- Create RLS policies for expenses_disbursements
CREATE POLICY "Authenticated can select expenses_disbursements" ON public.expenses_disbursements FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert expenses_disbursements" ON public.expenses_disbursements FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update expenses_disbursements" ON public.expenses_disbursements FOR UPDATE USING (true);
CREATE POLICY "Authenticated can delete expenses_disbursements" ON public.expenses_disbursements FOR DELETE USING (true);

-- Create RLS policies for custody_disbursements
CREATE POLICY "Authenticated can select custody_disbursements" ON public.custody_disbursements FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert custody_disbursements" ON public.custody_disbursements FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update custody_disbursements" ON public.custody_disbursements FOR UPDATE USING (true);
CREATE POLICY "Authenticated can delete custody_disbursements" ON public.custody_disbursements FOR DELETE USING (true);

-- Create RLS policies for custody_settlements
CREATE POLICY "Authenticated can select custody_settlements" ON public.custody_settlements FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert custody_settlements" ON public.custody_settlements FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update custody_settlements" ON public.custody_settlements FOR UPDATE USING (true);
CREATE POLICY "Authenticated can delete custody_settlements" ON public.custody_settlements FOR DELETE USING (true);

-- Create triggers for updated_at columns
CREATE TRIGGER update_cash_receipts_updated_at BEFORE UPDATE ON public.cash_receipts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cash_disbursements_updated_at BEFORE UPDATE ON public.cash_disbursements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_check_receipts_updated_at BEFORE UPDATE ON public.check_receipts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_check_disbursements_updated_at BEFORE UPDATE ON public.check_disbursements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_expenses_disbursements_updated_at BEFORE UPDATE ON public.expenses_disbursements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_custody_disbursements_updated_at BEFORE UPDATE ON public.custody_disbursements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_custody_settlements_updated_at BEFORE UPDATE ON public.custody_settlements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();