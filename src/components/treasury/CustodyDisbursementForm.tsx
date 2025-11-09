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

interface CustodyDisbursementData {
  voucherNumber: string;
  date: Date;
  custodyHolderName: string;
  employeeId: string;
  amount: string;
  purpose: string;
  expectedReturnDate: Date;
  description: string;
  approvedBy: string;
  witnessName: string;
}

export function CustodyDisbursementForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<CustodyDisbursementData>({
    voucherNumber: `CUS${String(Date.now()).slice(-6)}`,
    date: new Date(),
    custodyHolderName: "",
    employeeId: "",
    amount: "",
    purpose: "",
    expectedReturnDate: new Date(),
    description: "",
    approvedBy: "",
    witnessName: ""
  });

  const handleInputChange = (field: keyof CustodyDisbursementData, value: string | Date) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase.from("custody_disbursements").insert({
        voucher_number: formData.voucherNumber,
        date: format(formData.date, "yyyy-MM-dd"),
        custodian_name: formData.custodyHolderName,
        amount: parseFloat(formData.amount),
        purpose: formData.purpose,
        expected_return_date: format(formData.expectedReturnDate, "yyyy-MM-dd"),
        description: formData.description,
        approved_by: formData.approvedBy
      });

      if (error) throw error;

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ إذن صرف العهدة"
      });

      handleNew();
    } catch (error) {
      console.error("Error saving custody disbursement:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الحفظ",
        variant: "destructive"
      });
    }
  };

  const handleNew = () => {
    setFormData({
      voucherNumber: `CUS${String(Date.now()).slice(-6)}`,
      date: new Date(),
      custodyHolderName: "",
      employeeId: "",
      amount: "",
      purpose: "",
      expectedReturnDate: new Date(),
      description: "",
      approvedBy: "",
      witnessName: ""
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">إذن صرف عهدة من الخزنة</h1>
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
          <CardTitle>بيانات إذن صرف العهدة</CardTitle>
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
              <Label htmlFor="amount">مبلغ العهدة</Label>
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
              <Label htmlFor="custodyHolderName">اسم المتعهد</Label>
              <Input
                id="custodyHolderName"
                value={formData.custodyHolderName}
                onChange={(e) => handleInputChange('custodyHolderName', e.target.value)}
                className="text-right"
                placeholder="اسم الموظف المستلم للعهدة"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeId">رقم الموظف</Label>
              <Input
                id="employeeId"
                value={formData.employeeId}
                onChange={(e) => handleInputChange('employeeId', e.target.value)}
                className="text-right"
                placeholder="رقم الموظف"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="approvedBy">موافق بواسطة</Label>
              <Input
                id="approvedBy"
                value={formData.approvedBy}
                onChange={(e) => handleInputChange('approvedBy', e.target.value)}
                className="text-right"
                placeholder="اسم المدير المسؤول"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="witnessName">اسم الشاهد</Label>
              <Input
                id="witnessName"
                value={formData.witnessName}
                onChange={(e) => handleInputChange('witnessName', e.target.value)}
                className="text-right"
                placeholder="اسم الشاهد على العملية"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>التاريخ المتوقع للإرجاع</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-right font-normal",
                    !formData.expectedReturnDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.expectedReturnDate ? format(formData.expectedReturnDate, "PPP") : "اختر التاريخ"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.expectedReturnDate}
                  onSelect={(date) => date && handleInputChange('expectedReturnDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">الغرض من العهدة</Label>
            <Input
              id="purpose"
              value={formData.purpose}
              onChange={(e) => handleInputChange('purpose', e.target.value)}
              className="text-right"
              placeholder="تفاصيل استخدام العهدة"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">الوصف والشروط</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="text-right"
              placeholder="شروط العهدة وتفاصيل إضافية..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}