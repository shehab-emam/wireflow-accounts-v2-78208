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

interface CustodySettlementData {
  voucherNumber: string;
  date: Date;
  originalCustodyNumber: string;
  custodyHolderName: string;
  originalAmount: string;
  spentAmount: string;
  returnedAmount: string;
  settlementDate: Date;
  description: string;
  approvedBy: string;
  receivedBy: string;
}

export function CustodySettlementForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<CustodySettlementData>({
    voucherNumber: `CS${String(Date.now()).slice(-6)}`,
    date: new Date(),
    originalCustodyNumber: "",
    custodyHolderName: "",
    originalAmount: "",
    spentAmount: "",
    returnedAmount: "",
    settlementDate: new Date(),
    description: "",
    approvedBy: "",
    receivedBy: ""
  });

  const handleInputChange = (field: keyof CustodySettlementData, value: string | Date) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-calculate returned amount
    if (field === 'originalAmount' || field === 'spentAmount') {
      const original = parseFloat(field === 'originalAmount' ? value as string : formData.originalAmount) || 0;
      const spent = parseFloat(field === 'spentAmount' ? value as string : formData.spentAmount) || 0;
      const returned = Math.max(0, original - spent);
      
      setFormData(prev => ({ ...prev, returnedAmount: returned.toString() }));
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase.from("custody_settlements").insert({
        voucher_number: formData.voucherNumber,
        date: format(formData.date, "yyyy-MM-dd"),
        custodian_name: formData.custodyHolderName,
        original_amount: parseFloat(formData.originalAmount),
        spent_amount: parseFloat(formData.spentAmount),
        returned_amount: parseFloat(formData.returnedAmount),
        settlement_date: format(formData.settlementDate, "yyyy-MM-dd"),
        notes: formData.description,
        approved_by: formData.approvedBy
      });

      if (error) throw error;

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ إذن تصفية العهدة"
      });

      handleNew();
    } catch (error) {
      console.error("Error saving custody settlement:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الحفظ",
        variant: "destructive"
      });
    }
  };

  const handleNew = () => {
    setFormData({
      voucherNumber: `CS${String(Date.now()).slice(-6)}`,
      date: new Date(),
      originalCustodyNumber: "",
      custodyHolderName: "",
      originalAmount: "",
      spentAmount: "",
      returnedAmount: "",
      settlementDate: new Date(),
      description: "",
      approvedBy: "",
      receivedBy: ""
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">إذن تصفية عهدة ورد المبلغ المتبقي</h1>
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
          <CardTitle>بيانات تصفية العهدة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="voucherNumber">رقم إذن التصفية</Label>
              <Input
                id="voucherNumber"
                value={formData.voucherNumber}
                onChange={(e) => handleInputChange('voucherNumber', e.target.value)}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="originalCustodyNumber">رقم العهدة الأصلية</Label>
              <Input
                id="originalCustodyNumber"
                value={formData.originalCustodyNumber}
                onChange={(e) => handleInputChange('originalCustodyNumber', e.target.value)}
                className="text-right"
                placeholder="رقم العهدة المراد تصفيتها"
              />
            </div>

            <div className="space-y-2">
              <Label>تاريخ التصفية</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-right font-normal",
                      !formData.settlementDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.settlementDate ? format(formData.settlementDate, "PPP") : "اختر التاريخ"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.settlementDate}
                    onSelect={(date) => date && handleInputChange('settlementDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custodyHolderName">اسم المتعهد</Label>
            <Input
              id="custodyHolderName"
              value={formData.custodyHolderName}
              onChange={(e) => handleInputChange('custodyHolderName', e.target.value)}
              className="text-right"
              placeholder="اسم الموظف صاحب العهدة"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="originalAmount">المبلغ الأصلي للعهدة</Label>
              <Input
                id="originalAmount"
                type="number"
                value={formData.originalAmount}
                onChange={(e) => handleInputChange('originalAmount', e.target.value)}
                className="text-right"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="spentAmount">المبلغ المصروف</Label>
              <Input
                id="spentAmount"
                type="number"
                value={formData.spentAmount}
                onChange={(e) => handleInputChange('spentAmount', e.target.value)}
                className="text-right"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="returnedAmount">المبلغ المُرجع</Label>
              <Input
                id="returnedAmount"
                type="number"
                value={formData.returnedAmount}
                readOnly
                className="text-right bg-muted"
                placeholder="0.00"
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
              <Label htmlFor="receivedBy">استلم بواسطة</Label>
              <Input
                id="receivedBy"
                value={formData.receivedBy}
                onChange={(e) => handleInputChange('receivedBy', e.target.value)}
                className="text-right"
                placeholder="اسم أمين الخزنة"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">تفاصيل التصفية</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="text-right"
              placeholder="تفاصيل المصروفات وأي ملاحظات..."
              rows={4}
            />
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2 text-right">ملخص التصفية</h3>
            <div className="grid grid-cols-3 gap-4 text-sm text-right">
              <div>
                <span className="text-muted-foreground">المبلغ الأصلي: </span>
                <span className="font-medium">{formData.originalAmount || "0.00"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">المصروف: </span>
                <span className="font-medium text-red-600">{formData.spentAmount || "0.00"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">المُرجع: </span>
                <span className="font-medium text-green-600">{formData.returnedAmount || "0.00"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}