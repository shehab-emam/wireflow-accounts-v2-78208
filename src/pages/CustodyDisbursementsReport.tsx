import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export default function CustodyDisbursementsReport() {
  const [custodies, setCustodies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustodies();
  }, []);

  const fetchCustodies = async () => {
    try {
      const { data, error } = await supabase
        .from("custody_disbursements")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      setCustodies(data || []);
    } catch (error) {
      console.error("Error fetching custodies:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">تقرير إذونات صرف العهد</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">جاري التحميل...</p>
          ) : custodies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم الإذن</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">اسم المتعهد</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">تاريخ الإرجاع المتوقع</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {custodies.map((custody) => (
                  <TableRow key={custody.id}>
                    <TableCell className="text-right">{custody.voucher_number}</TableCell>
                    <TableCell className="text-right">{format(new Date(custody.date), "yyyy-MM-dd")}</TableCell>
                    <TableCell className="text-right">{custody.custodian_name}</TableCell>
                    <TableCell className="text-right">{parseFloat(custody.amount).toLocaleString()} ريال</TableCell>
                    <TableCell className="text-right">
                      {custody.expected_return_date ? format(new Date(custody.expected_return_date), "yyyy-MM-dd") : "-"}
                    </TableCell>
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
