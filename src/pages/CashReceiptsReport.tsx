import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Printer } from "lucide-react";

export default function CashReceiptsReport() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const { data, error } = await supabase
        .from("cash_receipts")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      setReceipts(data || []);
    } catch (error) {
      console.error("Error fetching receipts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalAmount = receipts.reduce((sum, receipt) => sum + parseFloat(receipt.amount || 0), 0);

  return (
    <div className="container mx-auto p-6">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          @page {
            margin: 2cm;
          }
        }
      `}} />
      
      <div className="flex justify-between items-center mb-4 no-print">
        <h1 className="text-3xl font-bold text-foreground">تقرير إذونات استلام النقدية</h1>
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" />
          طباعة التقرير
        </Button>
      </div>

      <Card className="print-content">
        <CardHeader>
          <CardTitle className="text-2xl text-center">تقرير إذونات استلام النقدية</CardTitle>
          <p className="text-center text-muted-foreground">
            تاريخ الطباعة: {format(new Date(), "yyyy-MM-dd HH:mm")}
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">جاري التحميل...</p>
          ) : receipts.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">رقم الإذن</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">استلم من</TableHead>
                    <TableHead className="text-right">المبلغ</TableHead>
                    <TableHead className="text-right">الغرض</TableHead>
                    <TableHead className="text-right">الوصف</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="text-right">{receipt.voucher_number}</TableCell>
                      <TableCell className="text-right">{format(new Date(receipt.date), "yyyy-MM-dd")}</TableCell>
                      <TableCell className="text-right">{receipt.received_from}</TableCell>
                      <TableCell className="text-right font-semibold">{parseFloat(receipt.amount).toLocaleString()} ريال</TableCell>
                      <TableCell className="text-right">{receipt.purpose || "-"}</TableCell>
                      <TableCell className="text-right">{receipt.description || "-"}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={3} className="text-right">الإجمالي</TableCell>
                    <TableCell className="text-right text-lg">{totalAmount.toLocaleString()} ريال</TableCell>
                    <TableCell colSpan={2}></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">عدد الإذونات</p>
                    <p className="text-2xl font-bold">{receipts.length}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">إجمالي المبالغ</p>
                    <p className="text-2xl font-bold text-green-600">{totalAmount.toLocaleString()} ريال</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground py-8">لا توجد إذونات حتى الآن</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
