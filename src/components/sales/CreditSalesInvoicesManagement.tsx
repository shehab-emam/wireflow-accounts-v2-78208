import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, Eye, Edit, Trash2, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
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

interface CreditInvoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  customer_id: string;
  customer_name: string;
  customer_code: string;
  employee_name: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: string;
  notes: string;
}

export default function CreditSalesInvoicesManagement() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<CreditInvoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<CreditInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    invoice_number: '',
    customer_name: '',
    from_date: '',
    to_date: '',
    status: 'all'
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, invoices]);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('credit_sales_invoices')
        .select(`
          *,
          customer:customers(business_owner_name, customer_code),
          employee:employees(name)
        `)
        .order('invoice_date', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedInvoices: CreditInvoice[] = data.map((inv: any) => ({
          id: inv.id,
          invoice_number: inv.invoice_number,
          invoice_date: inv.invoice_date,
          customer_id: inv.customer_id,
          customer_name: inv.customer?.business_owner_name || '',
          customer_code: inv.customer?.customer_code || '',
          employee_name: inv.employee?.name || '',
          total_amount: inv.total_amount || 0,
          paid_amount: inv.paid_amount || 0,
          remaining_amount: inv.remaining_amount || 0,
          status: inv.status || 'draft',
          notes: inv.notes || ''
        }));

        setInvoices(formattedInvoices);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('خطأ في تحميل الفواتير');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...invoices];

    if (filters.invoice_number) {
      filtered = filtered.filter(inv =>
        inv.invoice_number.toLowerCase().includes(filters.invoice_number.toLowerCase())
      );
    }

    if (filters.customer_name) {
      filtered = filtered.filter(inv =>
        inv.customer_name.toLowerCase().includes(filters.customer_name.toLowerCase()) ||
        inv.customer_code.toLowerCase().includes(filters.customer_name.toLowerCase())
      );
    }

    if (filters.from_date) {
      filtered = filtered.filter(inv => inv.invoice_date >= filters.from_date);
    }

    if (filters.to_date) {
      filtered = filtered.filter(inv => inv.invoice_date <= filters.to_date);
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(inv => inv.status === filters.status);
    }

    setFilteredInvoices(filtered);
  };

  const handleReset = () => {
    setFilters({
      invoice_number: '',
      customer_name: '',
      from_date: '',
      to_date: '',
      status: 'all'
    });
  };

  const handleDeleteClick = (id: string) => {
    setInvoiceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!invoiceToDelete) return;

    try {
      // Delete invoice items first
      const { error: itemsError } = await supabase
        .from('credit_sales_invoice_items')
        .delete()
        .eq('invoice_id', invoiceToDelete);

      if (itemsError) throw itemsError;

      // Delete invoice
      const { error: invoiceError } = await supabase
        .from('credit_sales_invoices')
        .delete()
        .eq('id', invoiceToDelete);

      if (invoiceError) throw invoiceError;

      toast.success('تم حذف الفاتورة بنجاح');
      fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('خطأ في حذف الفاتورة');
    } finally {
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
  };

  const handleViewInvoice = (id: string) => {
    navigate(`/credit-sales-invoice-report/${id}`);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
      draft: { label: 'مسودة', variant: 'secondary' },
      completed: { label: 'مكتملة', variant: 'default' },
      cancelled: { label: 'ملغاة', variant: 'destructive' }
    };

    const statusInfo = statusMap[status] || { label: status, variant: 'secondary' };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getPaymentStatusBadge = (remaining: number) => {
    if (remaining === 0) {
      return <Badge variant="default" className="bg-green-500">مدفوعة</Badge>;
    } else if (remaining > 0) {
      return <Badge variant="destructive">غير مدفوعة</Badge>;
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">إدارة فواتير المبيعات الآجلة</h1>
        <Button onClick={() => navigate('/credit-sales-invoice')}>
          <Plus className="h-4 w-4 mr-2" />
          فاتورة جديدة
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            فلاتر البحث
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="invoice_number">رقم الفاتورة</Label>
              <Input
                id="invoice_number"
                placeholder="ابحث برقم الفاتورة..."
                value={filters.invoice_number}
                onChange={(e) => setFilters({ ...filters, invoice_number: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="customer_name">اسم العميل</Label>
              <Input
                id="customer_name"
                placeholder="ابحث باسم أو كود العميل..."
                value={filters.customer_name}
                onChange={(e) => setFilters({ ...filters, customer_name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="status">الحالة</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="completed">مكتملة</SelectItem>
                  <SelectItem value="cancelled">ملغاة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="from_date">من تاريخ</Label>
              <Input
                id="from_date"
                type="date"
                value={filters.from_date}
                onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="to_date">إلى تاريخ</Label>
              <Input
                id="to_date"
                type="date"
                value={filters.to_date}
                onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
              />
            </div>

            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={handleReset} className="w-full">
                إعادة تعيين
              </Button>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            عدد النتائج: {filteredInvoices.length}
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>الفواتير</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري تحميل البيانات...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد فواتير
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">رقم الفاتورة</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">العميل</TableHead>
                    <TableHead className="text-right">الموظف</TableHead>
                    <TableHead className="text-right">المبلغ الكلي</TableHead>
                    <TableHead className="text-right">المدفوع</TableHead>
                    <TableHead className="text-right">المتبقي</TableHead>
                    <TableHead className="text-right">حالة الفاتورة</TableHead>
                    <TableHead className="text-right">حالة الدفع</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell>
                        {new Date(invoice.invoice_date).toLocaleDateString('en-GB')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{invoice.customer_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {invoice.customer_code}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{invoice.employee_name || '-'}</TableCell>
                      <TableCell>{invoice.total_amount.toFixed(2)} EGP</TableCell>
                      <TableCell>{invoice.paid_amount.toFixed(2)} EGP</TableCell>
                      <TableCell className="font-bold text-destructive">
                        {invoice.remaining_amount.toFixed(2)} EGP
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(invoice.remaining_amount)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewInvoice(invoice.id)}
                            title="عرض"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/invoice-edit/${invoice.id}`)}
                            title="تعديل"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(invoice.id)}
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه الفاتورة؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
