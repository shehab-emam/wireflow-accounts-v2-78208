import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RefreshCw, Printer, FileDown, Check, ChevronsUpDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { cn } from '@/lib/utils';

interface IncomingReportProps {
  warehouseTypeFilter?: string;
}

export default function IncomingReport({ warehouseTypeFilter }: IncomingReportProps) {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [openProductCombo, setOpenProductCombo] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [statementText, setStatementText] = useState('');
  const [statementNumber, setStatementNumber] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalQuantity: 0,
    totalValue: 0
  });

  useEffect(() => {
    fetchWarehouses();
    fetchProducts();
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

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_categories(*), units_of_measure(*)');
    
    if (error) {
      toast.error('خطأ في تحميل المنتجات');
      return;
    }
    setProducts(data || []);
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
        .eq('warehouse_transactions.transaction_type', 'incoming');

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

      setTransactions(sortedData);

      const totalQty = sortedData.reduce((sum: number, item: any) => sum + item.quantity, 0);
      const totalVal = sortedData.reduce((sum: number, item: any) => sum + (item.quantity * (item.unit_price || 0)), 0);

      setSummary({
        totalQuantity: totalQty,
        totalValue: totalVal
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
    doc.text('تقرير الوارد للمخزن', 105, 20, { align: 'center' });
    
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
      (trans.unit_price || 0).toFixed(2),
      (trans.quantity * (trans.unit_price || 0)).toFixed(2),
      statementNumber || '-',
      statementText || '-',
      new Date(trans.warehouse_transactions.transaction_date).toLocaleDateString('en-GB'),
      trans.notes || '-'
    ]);
    
    // Add table
    (doc as any).autoTable({
      startY: 65,
      head: [['كود الصنف', 'اسم الصنف', 'الكمية', 'الوحدة', 'سعر الوحدة', 'القيمة', 'رقم البيان', 'البيان', 'التاريخ', 'ملاحظات']],
      body: tableData,
      styles: { font: 'helvetica', halign: 'center', fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { halign: 'center' },
        1: { halign: 'right' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'center' },
        7: { halign: 'center' },
        8: { halign: 'right' }
      }
    });
    
    // Summary
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`إجمالي الكمية: ${summary.totalQuantity}`, 180, finalY, { align: 'right' });
    doc.text(`إجمالي القيمة: ${summary.totalValue.toFixed(2)}`, 180, finalY + 10, { align: 'right' });
    
    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('طُبع بواسطة نظام إدارة المخازن', 105, 280, { align: 'center' });
    
    doc.save(`تقرير_الوارد_${warehouse?.name || 'المخزن'}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('تم تصدير التقرير بنجاح');
  };

  const selectedWarehouseName = warehouses.find(w => w.id === selectedWarehouse)?.name || '';

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <Card className="accounting-card">
        <CardHeader className="primary-gradient">
          <CardTitle className="text-white text-2xl">
            تقرير الوارد للمخزن
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:hidden">
            <div>
              <Label>كود الصنف</Label>
              <Popover open={openProductCombo} onOpenChange={setOpenProductCombo}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openProductCombo}
                    className="w-full justify-between"
                  >
                    {selectedProduct
                      ? products.find((product) => product.id === selectedProduct)?.product_code
                      : "اختر كود الصنف"}
                    <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="ابحث عن كود الصنف..." />
                    <CommandList>
                      <CommandEmpty>لا توجد منتجات</CommandEmpty>
                      <CommandGroup>
                        {products.map((product) => (
                          <CommandItem
                            key={product.id}
                            value={product.product_code}
                            onSelect={() => {
                              setSelectedProduct(product.id);
                              setOpenProductCombo(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "ml-2 h-4 w-4",
                                selectedProduct === product.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {product.product_code}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>رقم البيان</Label>
              <Input
                type="text"
                placeholder="رقم البيان"
                value={statementNumber}
                onChange={(e) => setStatementNumber(e.target.value)}
              />
            </div>

            <div>
              <Label>البيان</Label>
              <Input
                type="text"
                placeholder="البيان"
                value={statementText}
                onChange={(e) => setStatementText(e.target.value)}
              />
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
              حفظ وعرض التقرير
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
            <h1 className="text-2xl font-bold mb-2">تقرير الوارد للمخزن</h1>
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
                  <TableHead className="text-right border border-border font-bold">سعر الوحدة</TableHead>
                  <TableHead className="text-right border border-border font-bold">القيمة الإجمالية</TableHead>
                  <TableHead className="text-right border border-border font-bold">رقم البيان</TableHead>
                  <TableHead className="text-right border border-border font-bold">البيان</TableHead>
                  <TableHead className="text-right border border-border font-bold">التاريخ</TableHead>
                  <TableHead className="text-right border border-border font-bold">ملاحظات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((trans: any) => (
                  <TableRow key={trans.id} className="hover:bg-muted/50">
                    <TableCell className="border border-border">{trans.products?.product_code}</TableCell>
                    <TableCell className="border border-border">{trans.products?.name}</TableCell>
                    <TableCell className="border border-border font-semibold">{trans.quantity}</TableCell>
                    <TableCell className="border border-border">{trans.products?.units_of_measure?.name}</TableCell>
                    <TableCell className="border border-border">{(trans.unit_price || 0).toFixed(2)}</TableCell>
                    <TableCell className="border border-border font-semibold">
                      {(trans.quantity * (trans.unit_price || 0)).toFixed(2)}
                    </TableCell>
                    <TableCell className="border border-border">{statementNumber || '-'}</TableCell>
                    <TableCell className="border border-border">{statementText || '-'}</TableCell>
                    <TableCell className="border border-border">
                      {new Date(trans.warehouse_transactions.transaction_date).toLocaleDateString('en-GB')}
                    </TableCell>
                    <TableCell className="border border-border">{trans.notes || '-'}</TableCell>
                  </TableRow>
                ))}

                {transactions.length > 0 && (
                  <TableRow className="bg-accent/10 font-bold">
                    <TableCell className="border border-border" colSpan={2}>الإجمالي</TableCell>
                    <TableCell className="border border-border text-primary">{summary.totalQuantity}</TableCell>
                    <TableCell className="border border-border" colSpan={2}>إجمالي القيمة</TableCell>
                    <TableCell className="border border-border text-primary">{summary.totalValue.toFixed(2)}</TableCell>
                    <TableCell className="border border-border" colSpan={4}>-</TableCell>
                  </TableRow>
                )}

                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
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
