import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export default function CustodySettlementsReport() {
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettlements();
  }, []);

  const fetchSettlements = async () => {
    try {
      const { data, error } = await supabase
        .from("custody_settlements")
        .select("*")
        .order("settlement_date", { ascending: false });

      if (error) throw error;
      setSettlements(data || []);
    } catch (error) {
      console.error("Error fetching settlements:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">تقرير إذونات تصفية العهد</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">جاري التحميل...</p>
          ) : settlements.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم الإذن</TableHead>
                  <TableHead className="text-right">تاريخ التصفية</TableHead>
                  <TableHead className="text-right">اسم المتعهد</TableHead>
                  <TableHead className="text-right">المبلغ الأصلي</TableHead>
                  <TableHead className="text-right">المصروف</TableHead>
                  <TableHead className="text-right">المُرجع</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settlements.map((settlement) => (
                  <TableRow key={settlement.id}>
                    <TableCell className="text-right">{settlement.voucher_number}</TableCell>
                    <TableCell className="text-right">{format(new Date(settlement.settlement_date), "yyyy-MM-dd")}</TableCell>
                    <TableCell className="text-right">{settlement.custodian_name}</TableCell>
                    <TableCell className="text-right">{parseFloat(settlement.original_amount).toLocaleString()} ريال</TableCell>
                    <TableCell className="text-right text-red-600">{parseFloat(settlement.spent_amount).toLocaleString()} ريال</TableCell>
                    <TableCell className="text-right text-green-600">{parseFloat(settlement.returned_amount).toLocaleString()} ريال</TableCell>
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
