import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Save, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CheckDisbursementData {
  voucherNumber: string;
  date: Date;
  paidTo: string;
  checkNumber: string;
  bankName: string;
  amount: string;
  dueDate: Date;
  purpose: string;
  description: string;
  issuedBy: string;
}

export function CheckDisbursementForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<CheckDisbursementData>({
    voucherNumber: `CHD${String(Date.now()).slice(-6)}`,
    date: new Date(),
    paidTo: "",
    checkNumber: "",
    bankName: "",
    amount: "",
    dueDate: new Date(),
    purpose: "",
    description: "",
    issuedBy: ""
  });

  const handleInputChange = (field: keyof CheckDisbursementData, value: string | Date) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase.from("check_disbursements").insert({
        voucher_number: formData.voucherNumber,
        date: format(formData.date, "yyyy-MM-dd"),
        paid_to: formData.paidTo,
        check_number: formData.checkNumber,
        bank_name: formData.bankName,
        amount: parseFloat(formData.amount),
        purpose: formData.purpose,
        description: formData.description
      });

      if (error) throw error;

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ إذن صرف الشيك"
      });

      handleNew();
    } catch (error) {
      console.error("Error saving check disbursement:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الحفظ",
        variant: "destructive"
      });
    }
  };

  const handleNew = () => {
    setFormData({
      voucherNumber: `CHD${String(Date.now()).slice(-6)}`,
      date: new Date(),
      paidTo: "",
      checkNumber: "",
      bankName: "",
      amount: "",
      dueDate: new Date(),
      purpose: "",
      description: "",
      issuedBy: ""
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">إذن صرف شيك</h1>
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
          <CardTitle>بيانات إذن صرف الشيك</CardTitle>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkNumber">رقم الشيك</Label>
              <Input
                id="checkNumber"
                value={formData.checkNumber}
                onChange={(e) => handleInputChange('checkNumber', e.target.value)}
                className="text-right"
                placeholder="رقم الشيك"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankName">اسم البنك</Label>
              <Input
                id="bankName"
                value={formData.bankName}
                onChange={(e) => handleInputChange('bankName', e.target.value)}
                className="text-right"
                placeholder="اسم البنك"
              />
            </div>

            <div className="space-y-2">
              <Label>تاريخ الاستحقاق</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-right font-normal",
                      !formData.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? format(formData.dueDate, "PPP") : "اختر التاريخ"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => date && handleInputChange('dueDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
                placeholder="اسم المستفيد"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issuedBy">أصدر بواسطة</Label>
              <Input
                id="issuedBy"
                value={formData.issuedBy}
                onChange={(e) => handleInputChange('issuedBy', e.target.value)}
                className="text-right"
                placeholder="اسم المصدر"
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