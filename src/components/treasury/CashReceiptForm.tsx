import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Printer, Plus, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CashReceiptData {
  voucherNumber: string;
  date: Date;
  customerId: string;
  receivedFrom: string;
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

export function CashReceiptForm() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [treasuryBalance, setTreasuryBalance] = useState<number>(0);
  const [formData, setFormData] = useState<CashReceiptData>({
    voucherNumber: `CR${String(Date.now()).slice(-6)}`,
    date: new Date(),
    customerId: "",
    receivedFrom: "",
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

  const handleInputChange = (field: keyof CashReceiptData, value: string | Date) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-populate receivedFrom when customer is selected
      if (field === "customerId" && typeof value === "string") {
        const selectedCustomer = customers.find(c => c.id === value);
        if (selectedCustomer) {
          updated.receivedFrom = selectedCustomer.business_owner_name;
        }
      }
      
      return updated;
    });
  };

  const printReceipt = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>إذن استلام نقدية - ${formData.voucherNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            direction: rtl;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            color: #333;
          }
          .content {
            margin: 20px 0;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin: 15px 0;
            padding: 10px;
            border-bottom: 1px solid #eee;
          }
          .label {
            font-weight: bold;
            color: #555;
          }
          .value {
            color: #000;
          }
          .amount-box {
            background: #f5f5f5;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
            border: 2px solid #333;
          }
          .amount-box .amount {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
          }
          .footer {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
          }
          .signature {
            border-top: 1px solid #333;
            padding-top: 10px;
            width: 200px;
            text-align: center;
          }
          @media print {
            body {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>إذن استلام نقدية</h1>
          <p>رقم الإذن: ${formData.voucherNumber}</p>
        </div>
        
        <div class="content">
          <div class="row">
            <span class="label">التاريخ:</span>
            <span class="value">${format(formData.date, "yyyy-MM-dd")}</span>
          </div>
          
          <div class="row">
            <span class="label">استلم من:</span>
            <span class="value">${formData.receivedFrom}</span>
          </div>
          
          <div class="amount-box">
            <div class="label">المبلغ المستلم</div>
            <div class="amount">${parseFloat(formData.amount).toLocaleString()} ريال سعودي</div>
          </div>
          
          <div class="row">
            <span class="label">الغرض:</span>
            <span class="value">${formData.purpose || '-'}</span>
          </div>
          
          <div class="row">
            <span class="label">الوصف:</span>
            <span class="value">${formData.description || '-'}</span>
          </div>
          
          <div class="row">
            <span class="label">استلم بواسطة:</span>
            <span class="value">${formData.receivedBy || '-'}</span>
          </div>
        </div>
        
        <div class="footer">
          <div class="signature">
            <div>توقيع المستلم</div>
          </div>
          <div class="signature">
            <div>توقيع المسؤول</div>
          </div>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(content);
    printWindow.document.close();
  };

  const handleSave = async (andPrint: boolean = true) => {
    try {
      const { error } = await supabase.from("cash_receipts").insert({
        voucher_number: formData.voucherNumber,
        date: format(formData.date, "yyyy-MM-dd"),
        customer_id: formData.customerId || null,
        received_from: formData.receivedFrom,
        amount: parseFloat(formData.amount),
        purpose: formData.purpose,
        description: formData.description,
        received_by: formData.receivedBy
      });

      if (error) throw error;

      toast({
        title: "تم الحفظ بنجاح",
        description: andPrint ? "جاري طباعة الإذن..." : "تم حفظ الإذن بنجاح. تم تحديث رصيد الخزنة تلقائياً."
      });

      // Refresh treasury balance
      await fetchTreasuryBalance();

      if (andPrint) {
        // Print after successful save
        setTimeout(() => {
          printReceipt();
        }, 500);
      }

      handleNew();
    } catch (error) {
      console.error("Error saving cash receipt:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الحفظ",
        variant: "destructive"
      });
    }
  };

  const handleNew = () => {
    setFormData({
      voucherNumber: `CR${String(Date.now()).slice(-6)}`,
      date: new Date(),
      customerId: "",
      receivedFrom: "",
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
      receivedFrom: selectedCustomer 
        ? (selectedCustomer.institution_name || selectedCustomer.business_owner_name)
        : ""
    }));
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إذن استلام نقدية</h1>
          <p className="text-sm text-muted-foreground mt-1">
            رصيد الخزنة الحالي: <span className="font-bold text-primary">{treasuryBalance.toLocaleString()} ريال</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleSave(true)} className="gap-2">
            <Printer className="h-4 w-4" />
            حفظ وطباعة
          </Button>
          <Button onClick={() => handleSave(false)} variant="secondary" className="gap-2">
            <Plus className="h-4 w-4" />
            حفظ وجديد
          </Button>
          <Button onClick={handleNew} variant="outline" className="gap-2">
            <X className="h-4 w-4" />
            إلغاء
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>بيانات إذن الاستلام</CardTitle>
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
              <Label htmlFor="customerId">العميل</Label>
              <Select value={formData.customerId} onValueChange={handleCustomerChange}>
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="اختر العميل" />
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
              <Label htmlFor="receivedFrom">استلم من</Label>
              <Input
                id="receivedFrom"
                value={formData.receivedFrom}
                onChange={(e) => handleInputChange('receivedFrom', e.target.value)}
                className="text-right"
                placeholder="اسم الدافع"
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
            <Label htmlFor="purpose">الغرض من الاستلام</Label>
            <Input
              id="purpose"
              value={formData.purpose}
              onChange={(e) => handleInputChange('purpose', e.target.value)}
              className="text-right"
              placeholder="سبب الاستلام"
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