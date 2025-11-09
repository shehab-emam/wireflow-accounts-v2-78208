import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export default function CashDisbursementsReport() {
  const [disbursements, setDisbursements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisbursements();
  }, []);

  const fetchDisbursements = async () => {
    try {
      const { data, error } = await supabase
        .from("cash_disbursements")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      setDisbursements(data || []);
    } catch (error) {
      console.error("Error fetching disbursements:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">تقرير إذونات صرف النقدية</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">جاري التحميل...</p>
          ) : disbursements.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم الإذن</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">صرف إلى</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">الغرض</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disbursements.map((disbursement) => (
                  <TableRow key={disbursement.id}>
                    <TableCell className="text-right">{disbursement.voucher_number}</TableCell>
                    <TableCell className="text-right">{format(new Date(disbursement.date), "yyyy-MM-dd")}</TableCell>
                    <TableCell className="text-right">{disbursement.paid_to}</TableCell>
                    <TableCell className="text-right">{parseFloat(disbursement.amount).toLocaleString()} ريال</TableCell>
                    <TableCell className="text-right">{disbursement.purpose || "-"}</TableCell>
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
