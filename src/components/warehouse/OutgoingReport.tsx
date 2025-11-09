import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Printer, FileDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface OutgoingReportProps {
  warehouseTypeFilter?: string;
}

export default function OutgoingReport({ warehouseTypeFilter }: OutgoingReportProps) {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalQuantity: 0
  });

  useEffect(() => {
    fetchWarehouses();
  }, [warehouseTypeFilter]);

  const fetchWarehouses = async () => {
    let query = supabase.from('warehouses').select('*, warehouse_types(*)');
    
    if (warehouseTypeFilter) {
      query = query.eq('warehouse_types.name', warehouseTypeFilter);
    }
    
    const { data, error } = await query;
    if (error) {
      toast.error('خطأ في تحميل المخازن');
      return;
    }
    const fetchedWarehouses = data || [];
    setWarehouses(fetchedWarehouses);
    
    if (fetchedWarehouses.length === 1) {
      setSelectedWarehouse(fetchedWarehouses[0].id);
    }
  };

  const handleRefresh = async () => {
    if (!selectedWarehouse) {
      toast.error('الرجاء اختيار المخزن');
      return;
    }

    try {
      let query = supabase
        .from('warehouse_transaction_items')
        .select(`
          *,
          warehouse_transactions!inner (
            transaction_number,
            transaction_type,
            transaction_date,
            warehouse_id,
            reference_number,
            notes
          ),
          products (
            product_code,
            name,
            units_of_measure (
              name
            )
          )
        `)
        .eq('warehouse_transactions.warehouse_id', selectedWarehouse)
        .eq('warehouse_transactions.transaction_type', 'outgoing');

      if (dateFrom) {
        query = query.gte('warehouse_transactions.transaction_date', dateFrom);
      }
      if (dateTo) {
        query = query.lte('warehouse_transactions.transaction_date', dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;

      const sortedData = (data || []).sort((a: any, b: any) => {
        const dateA = new Date(a.warehouse_transactions.transaction_date).getTime();
        const dateB = new Date(b.warehouse_transactions.transaction_date).getTime();
        return dateA - dateB;
      });

      // Fetch current stock for each product
      const dataWithStock = await Promise.all(sortedData.map(async (trans: any) => {
        const { data: stockData } = await supabase
          .from('warehouse_stock')
          .select('quantity')
          .eq('warehouse_id', selectedWarehouse)
          .eq('product_id', trans.product_id)
          .maybeSingle();

        return {
          ...trans,
          currentStock: stockData?.quantity || 0
        };
      }));

      setTransactions(dataWithStock);

      const totalQty = dataWithStock.reduce((sum: number, item: any) => sum + item.quantity, 0);

      setSummary({
        totalQuantity: totalQty
      });

      toast.success('تم تحديث البيانات');
    } catch (error: any) {
      toast.error('خطأ في تحميل البيانات: ' + error.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    if (transactions.length === 0) {
      toast.error('لا توجد بيانات لتصديرها');
      return;
    }

    const doc = new jsPDF();
    const warehouse = warehouses.find(w => w.id === selectedWarehouse);
    
    // Add Arabic font support
    doc.setLanguage('ar');
    doc.setR2L(true);
    
    // Title
    doc.setFontSize(18);
    doc.text('تقرير الصادر من المخزن', 105, 20, { align: 'center' });
    
    // Warehouse and date info
    doc.setFontSize(12);
    doc.text(`المخزن: ${warehouse?.name || ''}`, 180, 35, { align: 'right' });
    doc.text(`الفترة: ${dateFrom || 'البداية'} - ${dateTo}`, 180, 45, { align: 'right' });
    doc.text(`تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}`, 180, 55, { align: 'right' });
    
    // Prepare table data
    const tableData = transactions.map((trans: any) => [
      trans.products?.product_code || '-',
      trans.products?.name || '-',
      trans.quantity.toString(),
      trans.products?.units_of_measure?.name || '-',
      trans.currentStock?.toString() || '0',
      trans.warehouse_transactions.reference_number || '-',
      new Date(trans.warehouse_transactions.transaction_date).toLocaleDateString('ar-SA'),
      trans.notes || '-'
    ]);
    
    // Add table
    (doc as any).autoTable({
      startY: 65,
      head: [['كود الصنف', 'اسم الصنف', 'الكمية', 'الوحدة', 'الرصيد الحالي', 'رقم المرجع', 'التاريخ', 'ملاحظات']],
      body: tableData,
      styles: { font: 'helvetica', halign: 'center', fontSize: 9 },
      headStyles: { fillColor: [220, 53, 69], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { halign: 'center' },
        1: { halign: 'right' },
        2: { halign: 'center', textColor: [220, 53, 69], fontStyle: 'bold' },
        3: { halign: 'center' },
        4: { halign: 'center', textColor: [41, 128, 185], fontStyle: 'bold' },
        5: { halign: 'center' },
        6: { halign: 'center' },
        7: { halign: 'right' }
      }
    });
    
    // Summary
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`إجمالي الكمية: ${summary.totalQuantity}`, 180, finalY, { align: 'right' });
    
    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('طُبع بواسطة نظام إدارة المخازن', 105, 280, { align: 'center' });
    
    doc.save(`تقرير_الصادر_${warehouse?.name || 'المخزن'}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('تم تصدير التقرير بنجاح');
  };

  const selectedWarehouseName = warehouses.find(w => w.id === selectedWarehouse)?.name || '';

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <Card className="accounting-card">
        <CardHeader className="primary-gradient">
          <CardTitle className="text-white text-2xl">
            تقرير الصادر من المخزن
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
            <div>
              <Label>المخزن</Label>
              <Select 
                value={selectedWarehouse} 
                onValueChange={setSelectedWarehouse}
                disabled={warehouses.length === 1}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المخزن" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>من تاريخ</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div>
              <Label>إلى تاريخ</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 print:hidden">
            <Button onClick={handleRefresh} className="bg-primary hover:bg-primary-hover">
              <RefreshCw className="ml-2 h-4 w-4" />
              تحديث
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

          {/* Report Header for Print */}
          <div className="hidden print:block text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">تقرير الصادر من المخزن</h1>
            <p className="text-lg">المخزن: {selectedWarehouseName}</p>
            <p className="text-sm text-muted-foreground">
              الفترة: {dateFrom || 'البداية'} - {dateTo}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              تاريخ الطباعة: {new Date().toLocaleString('ar-SA')}
            </p>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <Table className="border-collapse">
              <TableHeader>
                <TableRow className="bg-primary/10">
                  <TableHead className="text-right border border-border font-bold">كود الصنف</TableHead>
                  <TableHead className="text-right border border-border font-bold">اسم الصنف</TableHead>
                  <TableHead className="text-right border border-border font-bold">الكمية</TableHead>
                  <TableHead className="text-right border border-border font-bold">الوحدة</TableHead>
                  <TableHead className="text-right border border-border font-bold">الرصيد الحالي</TableHead>
                  <TableHead className="text-right border border-border font-bold">رقم المرجع</TableHead>
                  <TableHead className="text-right border border-border font-bold">التاريخ</TableHead>
                  <TableHead className="text-right border border-border font-bold">ملاحظات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((trans: any) => (
                  <TableRow key={trans.id} className="hover:bg-muted/50">
                    <TableCell className="border border-border">{trans.products?.product_code}</TableCell>
                    <TableCell className="border border-border">{trans.products?.name}</TableCell>
                    <TableCell className="border border-border font-semibold text-destructive">{trans.quantity}</TableCell>
                    <TableCell className="border border-border">{trans.products?.units_of_measure?.name}</TableCell>
                    <TableCell className="border border-border font-semibold text-primary">{trans.currentStock}</TableCell>
                    <TableCell className="border border-border">{trans.warehouse_transactions.reference_number || '-'}</TableCell>
                    <TableCell className="border border-border">
                      {new Date(trans.warehouse_transactions.transaction_date).toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell className="border border-border">{trans.notes || '-'}</TableCell>
                  </TableRow>
                ))}

                {transactions.length > 0 && (
                  <TableRow className="bg-accent/10 font-bold">
                    <TableCell className="border border-border" colSpan={2}>الإجمالي</TableCell>
                    <TableCell className="border border-border text-destructive">{summary.totalQuantity}</TableCell>
                    <TableCell className="border border-border" colSpan={5}>-</TableCell>
                  </TableRow>
                )}

                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      لا توجد بيانات للعرض
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Print Footer */}
          <div className="hidden print:block text-center mt-6 text-sm text-muted-foreground">
            <p>طُبع بواسطة النظام في {new Date().toLocaleString('ar-SA')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
