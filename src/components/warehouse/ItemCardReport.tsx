import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RefreshCw, Printer, FileText, Check, ChevronsUpDown, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ItemCardReportProps {
  warehouseTypeFilter?: string;
}

export default function ItemCardReport({ warehouseTypeFilter }: ItemCardReportProps) {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [openProductCombo, setOpenProductCombo] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [summary, setSummary] = useState({
    opening: 0,
    totalIncoming: 0,
    totalOutgoing: 0,
    balance: 0
  });
  const [selectedTransactionId, setSelectedTransactionId] = useState<string>('');
  const [openTransactionDialog, setOpenTransactionDialog] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);

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
    
    // Auto-select the first warehouse if there's only one
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
    if (!selectedWarehouse || !selectedProduct) {
      toast.error('الرجاء اختيار المخزن والصنف');
      return;
    }

    try {
      // Fetch transactions
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
          )
        `)
        .eq('product_id', selectedProduct)
        .eq('warehouse_transactions.warehouse_id', selectedWarehouse);

      if (dateFrom) {
        query = query.gte('warehouse_transactions.transaction_date', dateFrom);
      }
      if (dateTo) {
        query = query.lte('warehouse_transactions.transaction_date', dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Sort transactions by date in JavaScript
      const sortedData = (data || []).sort((a: any, b: any) => {
        const dateA = new Date(a.warehouse_transactions.transaction_date).getTime();
        const dateB = new Date(b.warehouse_transactions.transaction_date).getTime();
        return dateA - dateB;
      });

      // Calculate summary
      let incoming = 0;
      let outgoing = 0;

      sortedData?.forEach((item: any) => {
        if (item.warehouse_transactions.transaction_type === 'incoming') {
          incoming += item.quantity;
        } else {
          outgoing += item.quantity;
        }
      });

      // Get opening balance from product
      const { data: productData } = await supabase
        .from('products')
        .select('opening_balance')
        .eq('id', selectedProduct)
        .maybeSingle();

      const opening = productData?.opening_balance || 0;
      const currentBalance = opening + incoming - outgoing;

      // Add running balance to each transaction
      let runningBalance = opening;
      const transactionsWithBalance = sortedData.map((trans: any, index: number) => {
        const qty = trans.quantity;
        if (trans.warehouse_transactions.transaction_type === 'incoming') {
          runningBalance += qty;
        } else {
          runningBalance -= qty;
        }
        return {
          ...trans,
          serial: index + 1,
          runningBalance: runningBalance
        };
      });

      setTransactions(transactionsWithBalance);

      setSummary({
        opening,
        totalIncoming: incoming,
        totalOutgoing: outgoing,
        balance: currentBalance
      });

      setShowReport(true);
      toast.success('تم تحديث البيانات');
    } catch (error: any) {
      toast.error('خطأ في تحميل البيانات: ' + error.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleTransactionClick = async (transactionId: string) => {
    try {
      // Get transaction details
      const { data: transData, error: transError } = await supabase
        .from('warehouse_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (transError) throw transError;

      // Get warehouse name
      const { data: warehouseData } = await supabase
        .from('warehouses')
        .select('name')
        .eq('id', transData.warehouse_id)
        .single();

      // Get items
      const { data: itemsData, error: itemsError } = await supabase
        .from('warehouse_transaction_items')
        .select('*, products(name, product_code)')
        .eq('transaction_id', transactionId);

      if (itemsError) throw itemsError;

      setTransactionDetails({
        ...transData,
        warehouse_name: warehouseData?.name,
        items: itemsData || []
      });

      setSelectedTransactionId(transactionId);
      setOpenTransactionDialog(true);
    } catch (error: any) {
      toast.error('خطأ في تحميل بيانات العملية: ' + error.message);
    }
  };

  const handleExportExcel = () => {
    if (transactions.length === 0) {
      toast.error('لا توجد بيانات لتصديرها');
      return;
    }

    const warehouse = warehouses.find(w => w.id === selectedWarehouse);
    const product = products.find(p => p.id === selectedProduct);

    // Prepare data for Excel
    const excelData: any[] = [];

    // Header info
    excelData.push(['بطاقة صنف - حركة المخزون']);
    excelData.push([]);
    excelData.push(['المخزن:', warehouse?.name || '-', '', 'من تاريخ:', dateFrom ? new Date(dateFrom).toLocaleDateString('en-GB') : '-']);
    excelData.push(['كود الصنف:', product?.product_code || '-', '', 'إلى تاريخ:', new Date(dateTo).toLocaleDateString('en-GB')]);
    excelData.push(['اسم الصنف:', product?.name || '-', '', 'تاريخ الطباعة:', new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'})]);
    excelData.push([]);

    // Summary
    excelData.push(['رصيد افتتاحي', 'إجمالي الوارد', 'إجمالي الصادر', 'الرصيد الحالي']);
    excelData.push([summary.opening, summary.totalIncoming, summary.totalOutgoing, summary.balance]);
    excelData.push([]);

    // Table header
    excelData.push(['م', 'التاريخ', 'رقم العملية', 'النوع', 'وارد', 'صادر', 'الرصيد', 'رقم البيان', 'البيان', 'ملاحظات']);

    // Opening balance row
    excelData.push([
      '-',
      dateFrom ? new Date(dateFrom).toLocaleDateString('en-GB') : '-',
      'رصيد أول المدة',
      '-',
      '-',
      '-',
      summary.opening,
      '-',
      '-',
      '-'
    ]);

    // Transaction rows
    transactions.forEach((trans: any, index: number) => {
      // Parse notes to extract statement info
      let statementNumber = '-';
      let statementText = '-';
      let regularNotes = '-';
      
      try {
        if (trans.notes) {
          const parsedNotes = JSON.parse(trans.notes);
          statementNumber = parsedNotes.statement_number || '-';
          statementText = parsedNotes.statement_text || '-';
        }
      } catch {
        regularNotes = trans.notes || '-';
      }
      
      if (regularNotes === '-' && trans.warehouse_transactions.notes) {
        regularNotes = trans.warehouse_transactions.notes;
      }

      excelData.push([
        index + 1,
        new Date(trans.warehouse_transactions.transaction_date).toLocaleDateString('en-GB'),
        trans.warehouse_transactions.transaction_number || '-',
        trans.warehouse_transactions.transaction_type === 'incoming' ? 'وارد' : 'صادر',
        trans.warehouse_transactions.transaction_type === 'incoming' ? trans.quantity : '-',
        trans.warehouse_transactions.transaction_type === 'outgoing' ? trans.quantity : '-',
        trans.runningBalance || 0,
        statementNumber,
        statementText,
        regularNotes
      ]);
    });

    // Total row
    excelData.push([
      'الإجمالي',
      '',
      '',
      '',
      summary.totalIncoming,
      summary.totalOutgoing,
      summary.balance,
      '',
      '',
      ''
    ]);

    // Create workbook and worksheet
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'بطاقة صنف');

    // Set column widths
    ws['!cols'] = [
      { wch: 6 },   // م
      { wch: 12 },  // التاريخ
      { wch: 15 },  // رقم العملية
      { wch: 10 },  // النوع
      { wch: 10 },  // وارد
      { wch: 10 },  // صادر
      { wch: 12 },  // الرصيد
      { wch: 15 },  // رقم البيان
      { wch: 30 },  // البيان
      { wch: 25 }   // ملاحظات
    ];

    // Save file
    const fileName = `بطاقة_صنف_${product?.product_code || 'صنف'}_${warehouse?.name || 'المخزن'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast.success('تم تصدير ملف Excel بنجاح');
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <Card className="accounting-card">
        <CardHeader className="primary-gradient">
          <CardTitle className="text-white text-2xl">
            بطاقة صنف
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
            <div>
              <Label>اسم المخزن</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {selectedWarehouse
                      ? warehouses.find((w) => w.id === selectedWarehouse)?.name
                      : "اختر المخزن"}
                    <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="ابحث عن المخزن..." />
                    <CommandList>
                      <CommandEmpty>لا توجد مخازن</CommandEmpty>
                      <CommandGroup>
                        {warehouses.map((warehouse) => (
                          <CommandItem
                            key={warehouse.id}
                            value={warehouse.name}
                            onSelect={() => {
                              setSelectedWarehouse(warehouse.id);
                            }}
                          >
                            <Check
                              className={cn(
                                "ml-2 h-4 w-4",
                                selectedWarehouse === warehouse.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {warehouse.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>الصنف</Label>
              <Popover open={openProductCombo} onOpenChange={setOpenProductCombo}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openProductCombo}
                    className="w-full justify-between"
                  >
                    {selectedProduct
                      ? `${products.find((product) => product.id === selectedProduct)?.product_code} - ${products.find((product) => product.id === selectedProduct)?.name}`
                      : "اختر الصنف"}
                    <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="ابحث بالكود أو الاسم..." />
                    <CommandList>
                      <CommandEmpty>لا توجد منتجات</CommandEmpty>
                      <CommandGroup>
                        {products.map((product) => (
                          <CommandItem
                            key={product.id}
                            value={`${product.product_code} ${product.name}`}
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
                            <div className="flex flex-col">
                              <span className="font-semibold">{product.product_code}</span>
                              <span className="text-sm text-muted-foreground">{product.name}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>اسم الصنف</Label>
              <Input
                type="text"
                value={selectedProduct ? products.find(p => p.id === selectedProduct)?.name || '' : ''}
                readOnly
                className="bg-gray-100"
                placeholder="سيظهر بعد اختيار الصنف"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
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
          </div>

          <div className="flex gap-3 print:hidden">
            <Button 
              onClick={handleRefresh} 
              className="bg-primary hover:bg-primary-hover"
              disabled={!selectedWarehouse || !selectedProduct}
            >
              <RefreshCw className="ml-2 h-4 w-4" />
              تحديث البيانات
            </Button>
            {showReport && transactions.length > 0 && (
              <>
                <Button onClick={handlePrint} variant="outline" className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300">
                  <Printer className="ml-2 h-4 w-4" />
                  طباعة التقرير
                </Button>
                <Button onClick={handleExportExcel} variant="outline" className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300">
                  <FileText className="ml-2 h-4 w-4" />
                  تصدير Excel
                </Button>
              </>
            )}
          </div>

          {/* Print Header - Only visible when printing */}
          {showReport && (
          <>
          <div className="hidden print:block mb-6">
            <div className="text-center mb-6 border-b-2 border-gray-800 pb-4">
              <h1 className="text-3xl font-bold mb-2">بطاقة صنف - حركة المخزون</h1>
              <p className="text-sm text-gray-600">تقرير حركة المخزون التفصيلي</p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between border-b pb-1">
                  <span className="font-semibold">المخزن:</span>
                  <span>{warehouses.find(w => w.id === selectedWarehouse)?.name || '-'}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="font-semibold">كود الصنف:</span>
                  <span>{products.find(p => p.id === selectedProduct)?.product_code || '-'}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="font-semibold">اسم الصنف:</span>
                  <span>{products.find(p => p.id === selectedProduct)?.name || '-'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between border-b pb-1">
                  <span className="font-semibold">من تاريخ:</span>
                  <span>{dateFrom ? new Date(dateFrom).toLocaleDateString('en-GB') : '-'}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="font-semibold">إلى تاريخ:</span>
                  <span>{new Date(dateTo).toLocaleDateString('en-GB')}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="font-semibold">تاريخ الطباعة:</span>
                  <span>{new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
            </div>

            {/* Summary for Print */}
            <div className="grid grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-lg border-2 border-gray-300">
              <div className="text-center">
                <div className="text-xs text-gray-600 mb-1">رصيد افتتاحي</div>
                <div className="text-xl font-bold text-blue-600">{summary.opening}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-600 mb-1">إجمالي الوارد</div>
                <div className="text-xl font-bold text-green-600">{summary.totalIncoming}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-600 mb-1">إجمالي الصادر</div>
                <div className="text-xl font-bold text-red-600">{summary.totalOutgoing}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-600 mb-1">الرصيد الحالي</div>
                <div className="text-xl font-bold text-purple-600">{summary.balance}</div>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <h3 className="text-lg font-semibold mb-4 print:hidden">الحركات</h3>
            <Table className="border-collapse print:text-sm">
              <TableHeader>
                <TableRow className="bg-primary/10">
                  <TableHead className="text-right border border-border font-bold">م</TableHead>
                  <TableHead className="text-right border border-border font-bold">التاريخ</TableHead>
                  <TableHead className="text-right border border-border font-bold">رقم العملية</TableHead>
                  <TableHead className="text-right border border-border font-bold">النوع</TableHead>
                  <TableHead className="text-right border border-border font-bold">وارد</TableHead>
                  <TableHead className="text-right border border-border font-bold">صادر</TableHead>
                  <TableHead className="text-right border border-border font-bold">الرصيد</TableHead>
                  <TableHead className="text-right border border-border font-bold">رقم البيان</TableHead>
                  <TableHead className="text-right border border-border font-bold">البيان</TableHead>
                  <TableHead className="text-right border border-border font-bold">ملاحظات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Opening Balance Row */}
                <TableRow className="bg-blue-50 dark:bg-blue-900/20 font-semibold">
                  <TableCell className="border border-border">-</TableCell>
                  <TableCell className="border border-border">
                    {dateFrom ? new Date(dateFrom).toLocaleDateString('en-GB') : '-'}
                  </TableCell>
                  <TableCell className="border border-border" colSpan={1}>رصيد أول المدة</TableCell>
                  <TableCell className="border border-border">-</TableCell>
                  <TableCell className="border border-border">-</TableCell>
                  <TableCell className="border border-border">-</TableCell>
                  <TableCell className="border border-border text-primary font-bold">
                    {summary.opening}
                  </TableCell>
                  <TableCell className="border border-border">-</TableCell>
                  <TableCell className="border border-border">-</TableCell>
                  <TableCell className="border border-border">-</TableCell>
                </TableRow>

                {/* Transaction Rows */}
                {transactions.map((trans: any) => {
                  // Parse notes to extract statement info
                  let statementNumber = '-';
                  let statementText = '-';
                  let regularNotes = '-';
                  
                  try {
                    if (trans.notes) {
                      const parsedNotes = JSON.parse(trans.notes);
                      statementNumber = parsedNotes.statement_number || '-';
                      statementText = parsedNotes.statement_text || '-';
                    }
                  } catch {
                    // If not JSON, treat as regular notes
                    regularNotes = trans.notes || '-';
                  }
                  
                  // Use transaction notes if item notes don't exist
                  if (regularNotes === '-' && trans.warehouse_transactions.notes) {
                    regularNotes = trans.warehouse_transactions.notes;
                  }
                  
                  return (
                    <TableRow key={trans.id} className="hover:bg-muted/50">
                      <TableCell className="border border-border">{trans.serial}</TableCell>
                      <TableCell className="border border-border">
                        {new Date(trans.warehouse_transactions.transaction_date).toLocaleDateString('en-GB')}
                      </TableCell>
                      <TableCell className="border border-border">
                        <button
                          onClick={() => handleTransactionClick(trans.transaction_id)}
                          className="text-primary hover:text-primary-hover underline flex items-center gap-1 print:no-underline print:text-foreground"
                        >
                          {trans.warehouse_transactions.transaction_number}
                          <ExternalLink className="h-3 w-3 print:hidden" />
                        </button>
                      </TableCell>
                      <TableCell className="border border-border">
                        <span className={trans.warehouse_transactions.transaction_type === 'incoming' ? 'text-success font-semibold' : 'text-destructive font-semibold'}>
                          {trans.warehouse_transactions.transaction_type === 'incoming' ? 'وارد' : 'صادر'}
                        </span>
                      </TableCell>
                      <TableCell className="border border-border font-semibold">
                        {trans.warehouse_transactions.transaction_type === 'incoming' ? trans.quantity : '-'}
                      </TableCell>
                      <TableCell className="border border-border font-semibold">
                        {trans.warehouse_transactions.transaction_type === 'outgoing' ? trans.quantity : '-'}
                      </TableCell>
                      <TableCell className="border border-border font-bold text-primary">
                        {trans.runningBalance}
                      </TableCell>
                      <TableCell className="border border-border">{statementNumber}</TableCell>
                      <TableCell className="border border-border">{statementText}</TableCell>
                      <TableCell className="border border-border">{regularNotes}</TableCell>
                    </TableRow>
                  );
                })}

                {/* Total Row */}
                {transactions.length > 0 && (
                  <TableRow className="bg-accent/10 font-bold">
                    <TableCell className="border border-border" colSpan={4}>الإجمالي</TableCell>
                    <TableCell className="border border-border text-success">
                      {summary.totalIncoming}
                    </TableCell>
                    <TableCell className="border border-border text-destructive">
                      {summary.totalOutgoing}
                    </TableCell>
                    <TableCell className="border border-border text-primary">
                      {summary.balance}
                    </TableCell>
                    <TableCell className="border border-border">-</TableCell>
                    <TableCell className="border border-border">-</TableCell>
                    <TableCell className="border border-border">-</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Print Footer */}
          <div className="hidden print:block mt-8 pt-6 border-t-2 border-gray-300">
            <div className="grid grid-cols-3 gap-8 text-center text-sm">
              <div>
                <div className="border-t-2 border-gray-800 pt-2 mt-12">
                  <p className="font-semibold">مدير المخازن</p>
                </div>
              </div>
              <div>
                <div className="border-t-2 border-gray-800 pt-2 mt-12">
                  <p className="font-semibold">المحاسب</p>
                </div>
              </div>
              <div>
                <div className="border-t-2 border-gray-800 pt-2 mt-12">
                  <p className="font-semibold">المدير العام</p>
                </div>
              </div>
            </div>
            <div className="text-center mt-8 text-xs text-gray-500">
              <p>تم إنشاء هذا التقرير بواسطة نظام إدارة المخازن</p>
            </div>
          </div>
          </>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog open={openTransactionDialog} onOpenChange={setOpenTransactionDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">تقرير العملية</DialogTitle>
          </DialogHeader>
          
          {transactionDetails && (
            <div className="space-y-6">
              {/* Transaction Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold">رقم العملية:</span>
                    <span>{transactionDetails.transaction_number}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold">التاريخ:</span>
                    <span>{new Date(transactionDetails.transaction_date).toLocaleDateString('en-GB')}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold">النوع:</span>
                    <Badge variant={transactionDetails.transaction_type === 'incoming' ? 'default' : 'destructive'}>
                      {transactionDetails.transaction_type === 'incoming' ? 'وارد' : 'صادر'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold">المخزن:</span>
                    <span>{transactionDetails.warehouse_name}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold">رقم المرجع:</span>
                    <span>{transactionDetails.reference_number || '-'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold">الحالة:</span>
                    <Badge variant="outline">{transactionDetails.status || 'مكتمل'}</Badge>
                  </div>
                </div>
              </div>

              {transactionDetails.notes && (
                <div className="border-t pt-4">
                  <span className="font-semibold">ملاحظات:</span>
                  <p className="mt-2 text-muted-foreground">{transactionDetails.notes}</p>
                </div>
              )}

              {/* Items Table */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">الأصناف</h3>
                <Table className="border">
                  <TableHeader>
                    <TableRow className="bg-muted">
                      <TableHead className="text-center border">#</TableHead>
                      <TableHead className="text-center border">كود الصنف</TableHead>
                      <TableHead className="text-center border">اسم الصنف</TableHead>
                      <TableHead className="text-center border">الكمية</TableHead>
                      {transactionDetails.items[0]?.unit_price && (
                        <TableHead className="text-center border">سعر الوحدة</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionDetails.items.map((item: any, index: number) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-center border">{index + 1}</TableCell>
                        <TableCell className="text-center border">{item.products?.product_code || '-'}</TableCell>
                        <TableCell className="text-center border">{item.products?.name || '-'}</TableCell>
                        <TableCell className="text-center border font-semibold">{item.quantity}</TableCell>
                        {item.unit_price && (
                          <TableCell className="text-center border">{item.unit_price}</TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                  <tfoot>
                    <TableRow className="bg-muted font-semibold">
                      <TableCell colSpan={3} className="text-center border">الإجمالي</TableCell>
                      <TableCell className="text-center border">
                        {transactionDetails.items.reduce((sum: number, item: any) => sum + item.quantity, 0)}
                      </TableCell>
                      {transactionDetails.items[0]?.unit_price && (
                        <TableCell className="border"></TableCell>
                      )}
                    </TableRow>
                  </tfoot>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .accounting-card, .accounting-card * {
            visibility: visible;
          }
          .accounting-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none;
            border: none;
          }
          @page {
            size: A4;
            margin: 15mm;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
        }
      `}</style>
    </div>
  );
}