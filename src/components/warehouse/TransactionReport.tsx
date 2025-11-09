import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Printer, FileDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface TransactionItem {
  id: string;
  product_id: string;
  quantity: number;
  product_name?: string;
  product_code?: string;
}

interface TransactionData {
  id: string;
  transaction_number: string;
  transaction_date: string;
  transaction_type: 'incoming' | 'outgoing';
  warehouse_id: string;
  created_by: string;
  reference_number: string;
  notes: string;
  warehouse_name?: string;
  employee_name?: string;
  items: TransactionItem[];
}

const TransactionReport: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTransaction();
    }
  }, [id]);

  const fetchTransaction = async () => {
    try {
      setLoading(true);

      // Get transaction
      const { data: transData, error: transError } = await supabase
        .from('warehouse_transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (transError) throw transError;

      // Get warehouse name
      const { data: warehouseData } = await supabase
        .from('warehouses')
        .select('name')
        .eq('id', transData.warehouse_id)
        .single();

      // Get employee name
      const { data: employeeData } = await supabase
        .from('employees')
        .select('name')
        .eq('id', transData.created_by)
        .single();

      // Get items
      const { data: itemsData, error: itemsError } = await supabase
        .from('warehouse_transaction_items')
        .select('*, products(name, code)')
        .eq('transaction_id', id);

      if (itemsError) throw itemsError;

      const items = itemsData.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        product_name: item.products?.name,
        product_code: item.products?.code,
      }));

      setTransaction({
        ...transData,
        transaction_type: transData.transaction_type as 'incoming' | 'outgoing',
        warehouse_name: warehouseData?.name,
        employee_name: employeeData?.name,
        items,
      });
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء تحميل البيانات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (!transaction) return;

    const worksheet = XLSX.utils.json_to_sheet([
      { 'رقم المعاملة': transaction.transaction_number },
      { 'التاريخ': new Date(transaction.transaction_date).toLocaleDateString('en-GB') },
      { 'النوع': transaction.transaction_type === 'incoming' ? 'Incoming' : 'Outgoing' },
      { 'المخزن': transaction.warehouse_name },
      { 'الموظف': transaction.employee_name },
      { 'رقم المرجع': transaction.reference_number || '-' },
      {},
      { 'الأصناف': '' },
      ...transaction.items.map((item, index) => ({
        '#': index + 1,
        'كود الصنف': item.product_code,
        'اسم الصنف': item.product_name,
        'الكمية': item.quantity,
      })),
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transaction Report');
    XLSX.writeFile(workbook, `transaction-${transaction.transaction_number}.xlsx`);
  };

  if (loading) {
    return <div className="container mx-auto p-6">جاري التحميل...</div>;
  }

  if (!transaction) {
    return <div className="container mx-auto p-6">لا توجد بيانات</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="ml-2 h-4 w-4" />
          رجوع
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="ml-2 h-4 w-4" />
            طباعة
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <FileDown className="ml-2 h-4 w-4" />
            تصدير Excel
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-center">تقرير المعاملة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Transaction Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold">رقم المعاملة:</span>
                <span>{transaction.transaction_number}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold">التاريخ:</span>
                <span>{new Date(transaction.transaction_date).toLocaleDateString('en-GB')}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold">النوع:</span>
                <Badge variant={transaction.transaction_type === 'incoming' ? 'default' : 'destructive'}>
                  {transaction.transaction_type === 'incoming' ? 'وارد' : 'صادر'}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold">المخزن:</span>
                <span>{transaction.warehouse_name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold">الموظف:</span>
                <span>{transaction.employee_name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold">رقم المرجع:</span>
                <span>{transaction.reference_number || '-'}</span>
              </div>
            </div>
          </div>

          {transaction.notes && (
            <div className="border-t pt-4">
              <span className="font-semibold">ملاحظات:</span>
              <p className="mt-2 text-muted-foreground">{transaction.notes}</p>
            </div>
          )}

          {/* Items Table */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-4">الأصناف</h3>
            <table className="w-full border">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2 text-center">#</th>
                  <th className="border p-2 text-center">كود الصنف</th>
                  <th className="border p-2 text-center">اسم الصنف</th>
                  <th className="border p-2 text-center">الكمية</th>
                </tr>
              </thead>
              <tbody>
                {transaction.items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="border p-2 text-center">{index + 1}</td>
                    <td className="border p-2 text-center">{item.product_code}</td>
                    <td className="border p-2 text-center">{item.product_name}</td>
                    <td className="border p-2 text-center">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted font-semibold">
                  <td colSpan={3} className="border p-2 text-center">
                    الإجمالي
                  </td>
                  <td className="border p-2 text-center">
                    {transaction.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionReport;
