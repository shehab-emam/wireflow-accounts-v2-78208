import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Minus, FileText, Eye, Trash2, Edit, RefreshCw, Printer, FileDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import * as XLSX from 'xlsx';

interface Transaction {
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
  total_items?: number;
  total_quantity?: number;
}

interface TransactionItem {
  id: string;
  product_id: string;
  quantity: number;
  product_name?: string;
  product_code?: string;
}

interface TransactionDetails extends Transaction {
  items: TransactionItem[];
}

const FinishedProductsManagement: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportData, setReportData] = useState<TransactionDetails | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  
  const [filters, setFilters] = useState({
    transactionNumber: '',
    date: '',
    type: '',
    warehouse: '',
    employee: '',
    reference: '',
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      // Get all transactions from all warehouses
      // @ts-ignore
      const transQuery: any = await supabase
        .from('warehouse_transactions')
        .select('*')
        .order('transaction_date', { ascending: false});

      if (transQuery.error) throw transQuery.error;

      // Get details for each transaction
      const transactionsWithDetails: Transaction[] = [];
      
      for (const trans of transQuery.data || []) {
        // Get warehouse name
        // @ts-ignore
        const warehouseQuery: any = await supabase
          .from('warehouses')
          .select('name')
          .eq('id', trans.warehouse_id)
          .single();

        // Get items
        // @ts-ignore
        const itemsQuery: any = await supabase
          .from('warehouse_transaction_items')
          .select('quantity')
          .eq('transaction_id', trans.id);

        // Get employee name
        // @ts-ignore
        const employeeQuery: any = await supabase
          .from('employees')
          .select('name')
          .eq('id', trans.created_by)
          .single();

        transactionsWithDetails.push({
          id: trans.id,
          transaction_number: trans.transaction_number,
          transaction_date: trans.transaction_date,
          transaction_type: trans.transaction_type as 'incoming' | 'outgoing',
          warehouse_id: trans.warehouse_id,
          created_by: trans.created_by,
          reference_number: trans.reference_number,
          notes: trans.notes,
          warehouse_name: warehouseQuery.data?.name || '-',
          employee_name: employeeQuery.data?.name || '-',
          total_items: itemsQuery.data?.length || 0,
          total_quantity: itemsQuery.data?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0,
        });
      }

      setTransactions(transactionsWithDetails);
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

  const applyFilters = () => {
    let filtered = [...transactions];

    if (filters.transactionNumber) {
      filtered = filtered.filter((t) =>
        t.transaction_number.toLowerCase().includes(filters.transactionNumber.toLowerCase())
      );
    }

    if (filters.date) {
      filtered = filtered.filter((t) =>
        new Date(t.transaction_date).toLocaleDateString('en-GB').includes(filters.date)
      );
    }

    if (filters.type) {
      filtered = filtered.filter((t) =>
        (t.transaction_type === 'incoming' ? 'وارد' : 'صادر').includes(filters.type)
      );
    }

    if (filters.warehouse) {
      filtered = filtered.filter((t) =>
        t.warehouse_name?.toLowerCase().includes(filters.warehouse.toLowerCase())
      );
    }

    if (filters.employee) {
      filtered = filtered.filter((t) =>
        t.employee_name?.toLowerCase().includes(filters.employee.toLowerCase())
      );
    }

    if (filters.reference) {
      filtered = filtered.filter((t) =>
        t.reference_number?.toLowerCase().includes(filters.reference.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDelete = async () => {
    if (!selectedTransaction) return;

    try {
      // Delete transaction items first
      const itemsDelete = await supabase
        .from('warehouse_transaction_items')
        .delete()
        .eq('transaction_id', selectedTransaction);

      if (itemsDelete.error) throw itemsDelete.error;

      // Delete transaction
      const transDelete = await supabase
        .from('warehouse_transactions')
        .delete()
        .eq('id', selectedTransaction);

      if (transDelete.error) throw transDelete.error;

      toast({
        title: 'تم الحذف بنجاح',
        description: 'تم حذف المعاملة بنجاح',
      });

      setDeleteDialogOpen(false);
      setSelectedTransaction(null);
      fetchTransactions();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء الحذف',
        variant: 'destructive',
      });
    }
  };

  const handleViewReport = async (transactionId: string) => {
    try {
      setLoadingReport(true);
      setReportDialogOpen(true);

      // Get transaction
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

      // Get employee name
      const { data: employeeData } = await supabase
        .from('employees')
        .select('name')
        .eq('id', transData.created_by)
        .single();

      // Get items with product details
      const { data: itemsData, error: itemsError } = await supabase
        .from('warehouse_transaction_items')
        .select('id, product_id, quantity')
        .eq('transaction_id', transactionId);

      if (itemsError) throw itemsError;

      // Get product details for each item
      const itemsWithDetails = await Promise.all(
        itemsData.map(async (item: any) => {
          const { data: productData } = await supabase
            .from('products')
            .select('name, product_code')
            .eq('id', item.product_id)
            .single();

          return {
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            product_name: productData?.name,
            product_code: productData?.product_code,
          };
        })
      );

      setReportData({
        ...transData,
        transaction_type: transData.transaction_type as 'incoming' | 'outgoing',
        warehouse_name: warehouseData?.name,
        employee_name: employeeData?.name,
        items: itemsWithDetails,
      });
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء تحميل التقرير',
        variant: 'destructive',
      });
      setReportDialogOpen(false);
    } finally {
      setLoadingReport(false);
    }
  };

  const handlePrintReport = () => {
    const printContent = document.getElementById('transaction-report-content');
    if (!printContent) return;

    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    printWindow.document.write('<html><head><title>تقرير المعاملة</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('body { font-family: Arial, sans-serif; direction: rtl; padding: 20px; }');
    printWindow.document.write('table { width: 100%; border-collapse: collapse; margin-top: 20px; }');
    printWindow.document.write('th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }');
    printWindow.document.write('th { background-color: #f2f2f2; }');
    printWindow.document.write('.header { margin-bottom: 20px; }');
    printWindow.document.write('.badge { display: inline-block; padding: 4px 8px; border-radius: 4px; }');
    printWindow.document.write('.badge-incoming { background-color: #d4edda; color: #155724; }');
    printWindow.document.write('.badge-outgoing { background-color: #f8d7da; color: #721c24; }');
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportExcel = () => {
    if (!reportData) return;

    const worksheet = XLSX.utils.json_to_sheet([
      { 'رقم المعاملة': reportData.transaction_number },
      { 'التاريخ': new Date(reportData.transaction_date).toLocaleDateString('en-GB') },
      { 'النوع': reportData.transaction_type === 'incoming' ? 'Incoming' : 'Outgoing' },
      { 'المخزن': reportData.warehouse_name },
      { 'الموظف': reportData.employee_name },
      { 'رقم المرجع': reportData.reference_number || '-' },
      {},
      { 'الأصناف': '' },
      ...reportData.items.map((item, index) => ({
        '#': index + 1,
        'كود الصنف': item.product_code,
        'اسم الصنف': item.product_name,
        'الكمية': item.quantity,
      })),
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transaction Report');
    XLSX.writeFile(workbook, `transaction-${reportData.transaction_number}.xlsx`);

    toast({
      title: 'تم التصدير بنجاح',
      description: 'تم تصدير التقرير إلى Excel',
    });
  };

  const handleEdit = (transactionId: string) => {
    navigate(`/warehouse/transaction/${transactionId}/edit`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            إدارة مخزن المنتجات التامة
          </CardTitle>
          <CardDescription>
            إدارة جميع معاملات مخزن المنتجات التامة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => navigate('/warehouse/finished_products/incoming')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              إدخال منتجات
            </Button>
            <Button
              onClick={() => navigate('/warehouse/finished_products/outgoing')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Minus className="h-4 w-4" />
              صرف منتجات
            </Button>
            <Button
              onClick={() => navigate('/warehouse/finished_products/item-card')}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              بطاقة صنف
            </Button>
            <Button
              onClick={() => navigate('/warehouse/products-stock-report')}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              تقرير حركة الأصناف
            </Button>
            <Button
              onClick={fetchTransactions}
              variant="outline"
              className="flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              تحديث البيانات
            </Button>
          </div>

          {/* Transactions Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">
                    <div className="space-y-2">
                      <div>رقم المعاملة</div>
                      <Input
                        placeholder="بحث..."
                        value={filters.transactionNumber}
                        onChange={(e) => handleFilterChange('transactionNumber', e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="space-y-2">
                      <div>التاريخ</div>
                      <Input
                        placeholder="بحث..."
                        value={filters.date}
                        onChange={(e) => handleFilterChange('date', e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="space-y-2">
                      <div>النوع</div>
                      <Input
                        placeholder="بحث..."
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="space-y-2">
                      <div>المخزن</div>
                      <Input
                        placeholder="بحث..."
                        value={filters.warehouse}
                        onChange={(e) => handleFilterChange('warehouse', e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="space-y-2">
                      <div>الموظف</div>
                      <Input
                        placeholder="بحث..."
                        value={filters.employee}
                        onChange={(e) => handleFilterChange('employee', e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="space-y-2">
                      <div>رقم المرجع</div>
                      <Input
                        placeholder="بحث..."
                        value={filters.reference}
                        onChange={(e) => handleFilterChange('reference', e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="text-center">عدد الأصناف</TableHead>
                  <TableHead className="text-center">إجمالي الكمية</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      لا توجد معاملات
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((trans) => (
                    <TableRow key={trans.id}>
                      <TableCell className="text-center">{trans.transaction_number}</TableCell>
                      <TableCell className="text-center">
                        {new Date(trans.transaction_date).toLocaleDateString('en-GB')}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={trans.transaction_type === 'incoming' ? 'default' : 'destructive'}
                        >
                          {trans.transaction_type === 'incoming' ? 'وارد' : 'صادر'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{trans.warehouse_name}</TableCell>
                      <TableCell className="text-center">{trans.employee_name}</TableCell>
                      <TableCell className="text-center">{trans.reference_number || '-'}</TableCell>
                      <TableCell className="text-center">{trans.total_items}</TableCell>
                      <TableCell className="text-center">{trans.total_quantity}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewReport(trans.id)}
                            title="عرض التقرير"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(trans.id)}
                            title="تعديل"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedTransaction(trans.id);
                              setDeleteDialogOpen(true);
                            }}
                            title="حذف"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه المعاملة؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-center">تقرير المعاملة</DialogTitle>
          </DialogHeader>
          
          {loadingReport ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : reportData ? (
            <div id="transaction-report-content">
              <div className="space-y-6">
                {/* Action Buttons */}
                <div className="flex justify-end gap-2 print:hidden">
                  <Button variant="outline" onClick={handlePrintReport}>
                    <Printer className="ml-2 h-4 w-4" />
                    طباعة
                  </Button>
                  <Button variant="outline" onClick={handleExportExcel}>
                    <FileDown className="ml-2 h-4 w-4" />
                    تصدير Excel
                  </Button>
                </div>

                {/* Transaction Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-semibold">رقم المعاملة:</span>
                      <span>{reportData.transaction_number}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-semibold">التاريخ:</span>
                      <span>{new Date(reportData.transaction_date).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-semibold">النوع:</span>
                      <Badge
                        variant={reportData.transaction_type === 'incoming' ? 'default' : 'destructive'}
                        className={reportData.transaction_type === 'incoming' ? 'badge-incoming' : 'badge-outgoing'}
                      >
                        {reportData.transaction_type === 'incoming' ? 'وارد' : 'صادر'}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-semibold">المخزن:</span>
                      <span>{reportData.warehouse_name}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-semibold">الموظف:</span>
                      <span>{reportData.employee_name}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-semibold">رقم المرجع:</span>
                      <span>{reportData.reference_number || '-'}</span>
                    </div>
                  </div>
                </div>

                {reportData.notes && (
                  <div className="border-t pt-4">
                    <span className="font-semibold">ملاحظات:</span>
                    <p className="mt-2 text-muted-foreground">{reportData.notes}</p>
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
                      {reportData.items.map((item, index) => (
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
                          {reportData.items.reduce((sum, item) => sum + item.quantity, 0)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinishedProductsManagement;
