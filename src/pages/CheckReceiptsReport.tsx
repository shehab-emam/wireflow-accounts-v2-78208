import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export default function CheckReceiptsReport() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const { data, error } = await supabase
        .from("check_receipts")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      setReceipts(data || []);
    } catch (error) {
      console.error("Error fetching check receipts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">تقرير إذونات استلام الشيكات</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">جاري التحميل...</p>
          ) : receipts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم الإذن</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">رقم الشيك</TableHead>
                  <TableHead className="text-right">البنك</TableHead>
                  <TableHead className="text-right">استلم من</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell className="text-right">{receipt.voucher_number}</TableCell>
                    <TableCell className="text-right">{format(new Date(receipt.date), "yyyy-MM-dd")}</TableCell>
                    <TableCell className="text-right">{receipt.check_number}</TableCell>
                    <TableCell className="text-right">{receipt.bank_name}</TableCell>
                    <TableCell className="text-right">{receipt.received_from}</TableCell>
                    <TableCell className="text-right">{parseFloat(receipt.amount).toLocaleString()} ريال</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">لا توجد إذونات حتى الآن</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
