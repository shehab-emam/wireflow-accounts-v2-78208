import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, FileDown, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';

interface IncomingProductsReportProps {
  transactionId: string;
  transactionData?: any;
}

export default function IncomingProductsReport({ transactionId, transactionData }: IncomingProductsReportProps) {
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<any>(transactionData?.transaction || null);
  const [items, setItems] = useState<any[]>(transactionData?.items || []);
  const [warehouse, setWarehouse] = useState<any>(null);
  const [loading, setLoading] = useState(!transactionData);

  useEffect(() => {
    if (!transactionData) {
      fetchTransactionData();
    } else {
      setWarehouse({ name: transactionData.warehouseName });
    }
  }, [transactionId, transactionData]);

  const fetchTransactionData = async () => {
    try {
      setLoading(true);

      const { data: transData, error: transError } = await supabase
        .from('warehouse_transactions')
        .select(`
          *,
          warehouses (
            id,
            name,
            location
          )
        `)
        .eq('id', transactionId)
        .single();

      if (transError) throw transError;

      setTransaction(transData);
      setWarehouse(transData.warehouses);

      const { data: itemsData, error: itemsError } = await supabase
        .from('warehouse_transaction_items')
        .select(`
          *,
          products (
            product_code,
            name,
            product_categories (
              name
            ),
            units_of_measure (
              name
            )
          )
        `)
        .eq('transaction_id', transactionId);

      if (itemsError) throw itemsError;

      const processedItems = (itemsData || []).map(item => {
        let statementData = { statement_number: '', statement_text: '' };
        try {
          if (item.notes) {
            statementData = JSON.parse(item.notes);
          }
        } catch (e) {
          // If notes is not JSON, ignore
        }
        return { ...item, ...statementData };
      });

      setItems(processedItems);
    } catch (error: any) {
      console.error('Error fetching transaction data:', error);
      toast.error('خطأ في تحميل بيانات التقرير');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    return {
      totalItems: items.length,
      totalPieces: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    if (!transaction || items.length === 0) {
      toast.error('لا توجد بيانات لتصديرها');
      return;
    }

    const doc = new jsPDF();

    doc.setLanguage('ar');
    doc.setR2L(true);

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('تقرير إدخال منتجات تامة', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    let yPos = 35;

    doc.text(`رقم الإدخال: ${transaction.transaction_number}`, 180, yPos, { align: 'right' });
    yPos += 8;
    doc.text(`المخزن: ${warehouse?.name || '-'}`, 180, yPos, { align: 'right' });
    yPos += 8;
    doc.text(`التاريخ: ${new Date(transaction.transaction_date).toLocaleDateString('en-GB')}`, 180, yPos, { align: 'right' });
    yPos += 8;

    if (transaction.statement_number) {
      doc.text(`رقم البيان: ${transaction.statement_number}`, 180, yPos, { align: 'right' });
      yPos += 8;
    }

    if (transaction.statement_text) {
      doc.text(`البيان: ${transaction.statement_text}`, 180, yPos, { align: 'right' });
      yPos += 8;
    }

    if (transaction.reference_number) {
      doc.text(`رقم المرجع: ${transaction.reference_number}`, 180, yPos, { align: 'right' });
      yPos += 8;
    }

    if (transaction.notes) {
      doc.text(`الشرح: ${transaction.notes}`, 180, yPos, { align: 'right' });
      yPos += 8;
    }

    const tableData = items.map((item: any) => [
      item.products?.product_code || item.product_code || '-',
      item.products?.name || item.product_name || '-',
      item.products?.product_categories?.name || item.category_name || '-',
      item.products?.units_of_measure?.name || item.unit_name || '-',
      item.quantity.toString(),
      item.statement_number || '-',
      item.statement_text || '-',
    ]);

    (doc as any).autoTable({
      startY: yPos + 5,
      head: [['كود الصنف', 'اسم الصنف', 'نوع الصنف', 'وحدة القياس', 'الكمية', 'رقم البيان', 'شرح البيان']],
      body: tableData,
      styles: {
        font: 'helvetica',
        halign: 'center',
        fontSize: 9
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { halign: 'center' },
        1: { halign: 'right' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'right' }
      }
    });

    const totals = calculateTotals();
    const finalY = (doc as any).lastAutoTable.finalY + 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`عدد الأصناف المذكورة: ${totals.totalItems}`, 180, finalY, { align: 'right' });
    doc.text(`عدد القطع المذكورة: ${totals.totalPieces}`, 180, finalY + 10, { align: 'right' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('طُبع بواسطة نظام إدارة المخازن', 105, 285, { align: 'center' });

    doc.save(`تقرير_إدخال_${transaction.transaction_number}.pdf`);
    toast.success('تم تصدير التقرير بنجاح');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">لم يتم العثور على التقرير</div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-background p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex gap-3 print:hidden">
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowRight className="ml-2 h-4 w-4" />
            رجوع
          </Button>
          <Button onClick={handlePrint} variant="outline">
            <Printer className="ml-2 h-4 w-4" />
            طباعة
          </Button>
          <Button onClick={handleExportPDF} variant="outline">
            <FileDown className="ml-2 h-4 w-4" />
            تصدير PDF
          </Button>
        </div>

        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white print:bg-white print:text-black">
            <CardTitle className="text-2xl font-bold text-center">
              تقرير إدخال منتجات تامة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4 text-lg border-b pb-4">
              <div>
                <span className="font-semibold">رقم الإدخال:</span>
                <span className="mr-2">{transaction.transaction_number}</span>
              </div>
              <div>
                <span className="font-semibold">المخزن:</span>
                <span className="mr-2">{warehouse?.name || '-'}</span>
              </div>
              <div>
                <span className="font-semibold">التاريخ:</span>
                <span className="mr-2">{new Date(transaction.transaction_date).toLocaleDateString('en-GB')}</span>
              </div>
              {transaction.statement_number && (
                <div>
                  <span className="font-semibold">رقم البيان:</span>
                  <span className="mr-2">{transaction.statement_number}</span>
                </div>
              )}
              {transaction.statement_text && (
                <div className="col-span-2">
                  <span className="font-semibold">البيان:</span>
                  <span className="mr-2">{transaction.statement_text}</span>
                </div>
              )}
              {transaction.reference_number && (
                <div>
                  <span className="font-semibold">رقم المرجع:</span>
                  <span className="mr-2">{transaction.reference_number}</span>
                </div>
              )}
              {transaction.notes && (
                <div className="col-span-2">
                  <span className="font-semibold">الشرح:</span>
                  <span className="mr-2">{transaction.notes}</span>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">الأصناف المدخلة</h3>
              <div className="overflow-x-auto">
                <Table className="border-collapse">
                  <TableHeader>
                    <TableRow className="bg-primary/10">
                      <TableHead className="text-right border border-border font-bold">كود الصنف</TableHead>
                      <TableHead className="text-right border border-border font-bold">اسم الصنف</TableHead>
                      <TableHead className="text-right border border-border font-bold">نوع الصنف</TableHead>
                      <TableHead className="text-right border border-border font-bold">وحدة القياس</TableHead>
                      <TableHead className="text-right border border-border font-bold">الكمية</TableHead>
                      <TableHead className="text-right border border-border font-bold">رقم البيان</TableHead>
                      <TableHead className="text-right border border-border font-bold">شرح البيان</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item: any, index: number) => (
                      <TableRow key={item.id || index} className="hover:bg-muted/50">
                        <TableCell className="border border-border">{item.products?.product_code || item.product_code}</TableCell>
                        <TableCell className="border border-border">{item.products?.name || item.product_name}</TableCell>
                        <TableCell className="border border-border">{item.products?.product_categories?.name || item.category_name || '-'}</TableCell>
                        <TableCell className="border border-border">{item.products?.units_of_measure?.name || item.unit_name || '-'}</TableCell>
                        <TableCell className="border border-border font-semibold text-center">{item.quantity}</TableCell>
                        <TableCell className="border border-border text-center">{item.statement_number || '-'}</TableCell>
                        <TableCell className="border border-border">{item.statement_text || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="grid grid-cols-2 gap-4 text-xl font-bold">
                <div className="text-right">
                  عدد الأصناف المذكورة:
                  <span className="text-primary mr-2">{totals.totalItems}</span>
                </div>
                <div className="text-right">
                  عدد القطع المذكورة:
                  <span className="text-primary mr-2">{totals.totalPieces}</span>
                </div>
              </div>
            </div>

            <div className="hidden print:block text-center text-sm text-muted-foreground border-t pt-4 mt-8">
              <p>طُبع بواسطة نظام إدارة المخازن في {new Date().toLocaleString('ar-SA')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
