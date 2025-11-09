import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Save, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CashDisbursementData {
  voucherNumber: string;
  date: Date;
  customerId: string;
  paidTo: string;
  amount: string;
  purpose: string;
  description: string;
  receivedBy: string;
}

interface Customer {
  id: string;
  customer_code: string;
  business_owner_name: string;
  institution_name: string | null;
}

export function CashDisbursementForm() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [treasuryBalance, setTreasuryBalance] = useState<number>(0);
  const [formData, setFormData] = useState<CashDisbursementData>({
    voucherNumber: `CD${String(Date.now()).slice(-6)}`,
    date: new Date(),
    customerId: "",
    paidTo: "",
    amount: "",
    purpose: "",
    description: "",
    receivedBy: ""
  });

  useEffect(() => {
    fetchCustomers();
    fetchTreasuryBalance();
  }, []);

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('id, customer_code, business_owner_name, institution_name')
      .order('customer_code', { ascending: true });

    if (error) {
      console.error('Error fetching customers:', error);
      return;
    }

    setCustomers(data || []);
  };

  const fetchTreasuryBalance = async () => {
    const { data, error } = await supabase
      .from("treasury_balance")
      .select("balance")
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching treasury balance:", error);
    } else if (data) {
      setTreasuryBalance(data.balance);
    }
  };

  const handleInputChange = (field: keyof CashDisbursementData, value: string | Date) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-populate paidTo when customer is selected
      if (field === "customerId" && typeof value === "string") {
        const selectedCustomer = customers.find(c => c.id === value);
        if (selectedCustomer) {
          updated.paidTo = selectedCustomer.institution_name || selectedCustomer.business_owner_name;
        }
      }
      
      return updated;
    });
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase.from("cash_disbursements").insert({
        voucher_number: formData.voucherNumber,
        date: format(formData.date, "yyyy-MM-dd"),
        customer_id: formData.customerId || null,
        paid_to: formData.paidTo,
        amount: parseFloat(formData.amount),
        purpose: formData.purpose,
        description: formData.description,
        received_by: formData.receivedBy
      });

      if (error) throw error;

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ إذن صرف النقدية. تم تحديث رصيد الخزنة تلقائياً."
      });

      // Refresh treasury balance
      await fetchTreasuryBalance();

      handleNew();
    } catch (error) {
      console.error("Error saving cash disbursement:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الحفظ",
        variant: "destructive"
      });
    }
  };

  const handleNew = () => {
    setFormData({
      voucherNumber: `CD${String(Date.now()).slice(-6)}`,
      date: new Date(),
      customerId: "",
      paidTo: "",
      amount: "",
      purpose: "",
      description: "",
      receivedBy: ""
    });
  };

  const handleCustomerChange = (customerId: string) => {
    const selectedCustomer = customers.find(c => c.id === customerId);
    setFormData(prev => ({
      ...prev,
      customerId,
      paidTo: selectedCustomer 
        ? (selectedCustomer.institution_name || selectedCustomer.business_owner_name)
        : ""
    }));
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إذن صرف نقدية</h1>
          <p className="text-sm text-muted-foreground mt-1">
            رصيد الخزنة الحالي: <span className="font-bold text-primary">{treasuryBalance.toLocaleString()} ريال</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            حفظ
          </Button>
          <Button onClick={handleNew} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            جديد
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>بيانات إذن الصرف</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="voucherNumber">رقم الإذن</Label>
              <Input
                id="voucherNumber"
                value={formData.voucherNumber}
                onChange={(e) => handleInputChange('voucherNumber', e.target.value)}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label>التاريخ</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-right font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP") : "اختر التاريخ"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => date && handleInputChange('date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">المبلغ</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="text-right"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerId">العميل/المورد</Label>
              <Select value={formData.customerId} onValueChange={handleCustomerChange}>
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="اختر العميل (اختياري)" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.customer_code} - {customer.institution_name || customer.business_owner_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paidTo">صرف إلى</Label>
              <Input
                id="paidTo"
                value={formData.paidTo}
                onChange={(e) => handleInputChange('paidTo', e.target.value)}
                className="text-right"
                placeholder="اسم المستلم"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receivedBy">استلم بواسطة</Label>
              <Input
                id="receivedBy"
                value={formData.receivedBy}
                onChange={(e) => handleInputChange('receivedBy', e.target.value)}
                className="text-right"
                placeholder="اسم المستلم"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">الغرض من الصرف</Label>
            <Input
              id="purpose"
              value={formData.purpose}
              onChange={(e) => handleInputChange('purpose', e.target.value)}
              className="text-right"
              placeholder="سبب الصرف"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="text-right"
              placeholder="تفاصيل إضافية..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
