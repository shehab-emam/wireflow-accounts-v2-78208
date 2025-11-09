import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowDownCircle, ArrowUpCircle, Wallet, TrendingUp, TrendingDown, FileText, CheckSquare, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export default function TreasuryManagement() {
  const navigate = useNavigate();
  const [treasuryBalance, setTreasuryBalance] = useState(0);
  const [totalIncoming, setTotalIncoming] = useState(0);
  const [totalOutgoing, setTotalOutgoing] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetchTreasuryData();
  }, []);

  const fetchTreasuryData = async () => {
    try {
      // Fetch cash receipts (incoming)
      const { data: cashReceipts } = await supabase
        .from("cash_receipts")
        .select("amount, date, received_from, voucher_number, created_at")
        .order("created_at", { ascending: false });

      // Fetch cash disbursements (outgoing)
      const { data: cashDisbursements } = await supabase
        .from("cash_disbursements")
        .select("amount, date, paid_to, voucher_number, created_at")
        .order("created_at", { ascending: false });

      // Fetch check receipts (incoming)
      const { data: checkReceipts } = await supabase
        .from("check_receipts")
        .select("amount, date, received_from, voucher_number, created_at, check_number")
        .order("created_at", { ascending: false });

      // Fetch check disbursements (outgoing)
      const { data: checkDisbursements } = await supabase
        .from("check_disbursements")
        .select("amount, date, paid_to, voucher_number, created_at, check_number")
        .order("created_at", { ascending: false });

      // Fetch expenses disbursements (outgoing)
      const { data: expensesDisbursements } = await supabase
        .from("expenses_disbursements")
        .select("amount, date, paid_to, voucher_number, created_at, expense_category")
        .order("created_at", { ascending: false });

      // Fetch custody disbursements (outgoing)
      const { data: custodyDisbursements } = await supabase
        .from("custody_disbursements")
        .select("amount, date, custodian_name, voucher_number, created_at, purpose")
        .order("created_at", { ascending: false });

      // Fetch custody settlements (incoming)
      const { data: custodySettlements } = await supabase
        .from("custody_settlements")
        .select("returned_amount, date, custodian_name, voucher_number, created_at")
        .order("created_at", { ascending: false });

      // Calculate totals
      const cashIncoming = cashReceipts?.reduce((sum, r) => sum + (parseFloat(String(r.amount)) || 0), 0) || 0;
      const checkIncoming = checkReceipts?.reduce((sum, r) => sum + (parseFloat(String(r.amount)) || 0), 0) || 0;
      const custodyReturned = custodySettlements?.reduce((sum, s) => sum + (parseFloat(String(s.returned_amount)) || 0), 0) || 0;
      
      const cashOutgoing = cashDisbursements?.reduce((sum, d) => sum + (parseFloat(String(d.amount)) || 0), 0) || 0;
      const checkOutgoing = checkDisbursements?.reduce((sum, d) => sum + (parseFloat(String(d.amount)) || 0), 0) || 0;
      const expensesOutgoing = expensesDisbursements?.reduce((sum, d) => sum + (parseFloat(String(d.amount)) || 0), 0) || 0;
      const custodyOutgoing = custodyDisbursements?.reduce((sum, d) => sum + (parseFloat(String(d.amount)) || 0), 0) || 0;

      const totalIncoming = cashIncoming + checkIncoming + custodyReturned;
      const totalOutgoing = cashOutgoing + checkOutgoing + expensesOutgoing + custodyOutgoing;
      const balance = totalIncoming - totalOutgoing;

      setTotalIncoming(totalIncoming);
      setTotalOutgoing(totalOutgoing);
      setTreasuryBalance(balance);

      // Combine and sort recent transactions
      const allTransactions = [
        ...(cashReceipts?.map(r => ({ ...r, type: 'cash-receipt', description: `استلام نقدية من ${r.received_from}` })) || []),
        ...(cashDisbursements?.map(d => ({ ...d, type: 'cash-disbursement', description: `صرف نقدية إلى ${d.paid_to}` })) || []),
        ...(checkReceipts?.map(r => ({ ...r, type: 'check-receipt', description: `استلام شيك من ${r.received_from} - رقم ${r.check_number}` })) || []),
        ...(checkDisbursements?.map(d => ({ ...d, type: 'check-disbursement', description: `صرف شيك إلى ${d.paid_to} - رقم ${d.check_number}` })) || []),
        ...(expensesDisbursements?.map(d => ({ ...d, type: 'expenses', description: `مصروفات ${d.expense_category} - ${d.paid_to}` })) || []),
        ...(custodyDisbursements?.map(d => ({ ...d, type: 'custody-disbursement', description: `عهدة لـ ${d.custodian_name} - ${d.purpose || ''}` })) || []),
        ...(custodySettlements?.map(s => ({ ...s, type: 'custody-settlement', amount: s.returned_amount, description: `تصفية عهدة من ${s.custodian_name}` })) || [])
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);

      setRecentTransactions(allTransactions);
    } catch (error) {
      console.error("Error fetching treasury data:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">الإدارة المالية</h1>
        <p className="text-muted-foreground mt-1">إدارة الوارد والمنصرف ورصيد الخزنة</p>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button
          onClick={() => navigate('/treasury/cash-receipt')}
          className="h-24 text-lg font-semibold gap-3"
          variant="default"
        >
          <ArrowDownCircle className="h-8 w-8" />
          إذن استلام نقدية
        </Button>
        <Button
          onClick={() => navigate('/treasury/cash-disbursement')}
          className="h-24 text-lg font-semibold gap-3"
          variant="secondary"
        >
          <ArrowUpCircle className="h-8 w-8" />
          إذن صرف نقدية
        </Button>
        <Button
          onClick={() => navigate('/treasury/check-receipt')}
          className="h-24 text-lg font-semibold gap-3"
          variant="outline"
        >
          <CheckSquare className="h-8 w-8" />
          إذن استلام شيك
        </Button>
        <Button
          onClick={() => navigate('/treasury/check-disbursement')}
          className="h-24 text-lg font-semibold gap-3"
          variant="outline"
        >
          <CheckSquare className="h-8 w-8" />
          إذن صرف شيك
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Button
          onClick={() => navigate('/treasury/expenses-disbursement')}
          className="h-24 text-lg font-semibold gap-3"
          variant="outline"
        >
          <Receipt className="h-8 w-8" />
          إذن صرف مصروفات
        </Button>
        <Button
          onClick={() => navigate('/treasury/custody-disbursement')}
          className="h-24 text-lg font-semibold gap-3"
          variant="outline"
        >
          <FileText className="h-8 w-8" />
          إذن صرف عهدة
        </Button>
        <Button
          onClick={() => navigate('/treasury/custody-settlement')}
          className="h-24 text-lg font-semibold gap-3"
          variant="outline"
        >
          <FileText className="h-8 w-8" />
          إذن تصفية عهدة
        </Button>
      </div>

      {/* Treasury Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Treasury Balance */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">رصيد الخزنة</p>
              <p className="text-3xl font-bold text-foreground">{treasuryBalance.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">ريال سعودي</p>
            </div>
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="h-7 w-7 text-primary" />
            </div>
          </div>
        </Card>

        {/* Total Incoming */}
        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">إجمالي الوارد</p>
              <p className="text-3xl font-bold text-foreground">{totalIncoming.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">هذا الشهر</p>
            </div>
            <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="h-7 w-7 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Total Outgoing */}
        <Card className="p-6 bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">إجمالي المنصرف</p>
              <p className="text-3xl font-bold text-foreground">{totalOutgoing.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">هذا الشهر</p>
            </div>
            <div className="h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center">
              <TrendingDown className="h-7 w-7 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">آخر الحركات</h2>
        <div className="space-y-3">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <div
                key={transaction.voucher_number}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    ['cash-receipt', 'check-receipt', 'custody-settlement'].includes(transaction.type)
                      ? 'bg-green-500/10' 
                      : 'bg-red-500/10'
                  }`}>
                    {['cash-receipt', 'check-receipt', 'custody-settlement'].includes(transaction.type) ? (
                      <ArrowDownCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <ArrowUpCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(transaction.date), "yyyy-MM-dd")} - {transaction.voucher_number}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p className={`text-lg font-semibold ${
                    ['cash-receipt', 'check-receipt', 'custody-settlement'].includes(transaction.type)
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {['cash-receipt', 'check-receipt', 'custody-settlement'].includes(transaction.type) ? '+' : '-'}{parseFloat(transaction.amount).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">ريال</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">لا توجد حركات حتى الآن</p>
          )}
        </div>
      </Card>
    </div>
  );
}
