import { useState } from "react";
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

interface ExpensesDisbursementData {
  voucherNumber: string;
  date: Date;
  expenseCategory: string;
  amount: string;
  paidTo: string;
  purpose: string;
  description: string;
  approvedBy: string;
  paymentMethod: string;
}

const expenseCategories = [
  "مصروفات إدارية",
  "مصروفات تشغيلية",
  "صيانة ومعدات",
  "مصروفات نقل ومواصلات",
  "فواتير وخدمات",
  "مصروفات تسويق",
  "أخرى"
];

const paymentMethods = [
  "نقدي",
  "شيك",
  "تحويل مصرفي"
];

export function ExpensesDisbursementForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ExpensesDisbursementData>({
    voucherNumber: `EXP${String(Date.now()).slice(-6)}`,
    date: new Date(),
    expenseCategory: "",
    amount: "",
    paidTo: "",
    purpose: "",
    description: "",
    approvedBy: "",
    paymentMethod: ""
  });

  const handleInputChange = (field: keyof ExpensesDisbursementData, value: string | Date) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase.from("expenses_disbursements").insert({
        voucher_number: formData.voucherNumber,
        date: format(formData.date, "yyyy-MM-dd"),
        expense_category: formData.expenseCategory,
        amount: parseFloat(formData.amount),
        paid_to: formData.paidTo,
        purpose: formData.purpose,
        description: formData.description,
        approved_by: formData.approvedBy,
        payment_method: formData.paymentMethod
      });

      if (error) throw error;

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ إذن صرف المصروفات"
      });

      handleNew();
    } catch (error) {
      console.error("Error saving expenses disbursement:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الحفظ",
        variant: "destructive"
      });
    }
  };

  const handleNew = () => {
    setFormData({
      voucherNumber: `EXP${String(Date.now()).slice(-6)}`,
      date: new Date(),
      expenseCategory: "",
      amount: "",
      paidTo: "",
      purpose: "",
      description: "",
      approvedBy: "",
      paymentMethod: ""
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">إذن صرف مصروفات عمومية</h1>
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
          <CardTitle>بيانات إذن صرف المصروفات</CardTitle>
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
              <Label>فئة المصروف</Label>
              <Select value={formData.expenseCategory} onValueChange={(value) => handleInputChange('expenseCategory', value)}>
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="اختر فئة المصروف" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>طريقة الدفع</Label>
              <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="اختر طريقة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paidTo">صرف إلى</Label>
              <Input
                id="paidTo"
                value={formData.paidTo}
                onChange={(e) => handleInputChange('paidTo', e.target.value)}
                className="text-right"
                placeholder="اسم المستفيد أو الجهة"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="approvedBy">موافق بواسطة</Label>
              <Input
                id="approvedBy"
                value={formData.approvedBy}
                onChange={(e) => handleInputChange('approvedBy', e.target.value)}
                className="text-right"
                placeholder="اسم الموافق"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">الغرض من المصروف</Label>
            <Input
              id="purpose"
              value={formData.purpose}
              onChange={(e) => handleInputChange('purpose', e.target.value)}
              className="text-right"
              placeholder="تفاصيل الغرض"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">الوصف التفصيلي</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="text-right"
              placeholder="تفاصيل إضافية عن المصروف..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}