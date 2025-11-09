import React, { useState, useEffect } from 'react';
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

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: string;
  invoice_type: 'cash' | 'credit';
  customer: {
    business_owner_name: string;
    customer_code: string;
  } | null;
  employee: {
    name: string;
  } | null;
}

export const InvoicesManagement = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter states
  const [dateFilter, setDateFilter] = useState('');
  const [numberFilter, setNumberFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // For now, we'll create mock data since we don't have invoice tables yet
    fetchInvoices();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [invoices, dateFilter, numberFilter, customerFilter, typeFilter, statusFilter]);

  const fetchInvoices = async () => {
    try {
      // TODO: Replace with actual invoice data when tables are created
      // For now, using mock data
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          invoice_number: 'INV-000001',
          invoice_date: '2024-01-15',
          due_date: '2024-02-15',
          total_amount: 1500.00,
          paid_amount: 1500.00,
          remaining_amount: 0,
          status: 'paid',
          invoice_type: 'cash',
          customer: {
            business_owner_name: 'أحمد محمد',
            customer_code: 'C000001'
          },
          employee: {
            name: 'محمد أحمد'
          }
        },
        {
          id: '2',
          invoice_number: 'INV-000002',
          invoice_date: '2024-01-16',
          due_date: '2024-02-16',
          total_amount: 2500.00,
          paid_amount: 1000.00,
          remaining_amount: 1500.00,
          status: 'partial',
          invoice_type: 'credit',
          customer: {
            business_owner_name: 'سارة أحمد',
            customer_code: 'C000002'
          },
          employee: {
            name: 'فاطمة محمد'
          }
        }
      ];
      
      setInvoices(mockInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('خطأ في تحميل الفواتير');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...invoices];

    if (dateFilter) {
      filtered = filtered.filter(inv => 
        inv.invoice_date.includes(dateFilter)
      );
    }

    if (numberFilter) {
      filtered = filtered.filter(inv => 
        inv.invoice_number.toLowerCase().includes(numberFilter.toLowerCase())
      );
    }

    if (customerFilter) {
      filtered = filtered.filter(inv => 
        inv.customer?.business_owner_name.toLowerCase().includes(customerFilter.toLowerCase()) ||
        inv.customer?.customer_code.toLowerCase().includes(customerFilter.toLowerCase())
      );
    }

    if (typeFilter && typeFilter !== 'all') {
      filtered = filtered.filter(inv => inv.invoice_type === typeFilter);
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(inv => inv.status === statusFilter);
    }

    setFilteredInvoices(filtered);
  };

  const clearFilters = () => {
    setDateFilter('');
    setNumberFilter('');
    setCustomerFilter('');
    setTypeFilter('all');
    setStatusFilter('all');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف الفاتورة؟')) return;

    try {
      // TODO: Implement actual deletion when database tables are ready
      toast.success('تم حذف الفاتورة بنجاح');
      fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('خطأ في حذف الفاتورة');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      paid: { label: 'مدفوعة', variant: 'default' as const },
      partial: { label: 'مدفوعة جزئياً', variant: 'secondary' as const },
      unpaid: { label: 'غير مدفوعة', variant: 'destructive' as const },
      cancelled: { label: 'ملغاة', variant: 'destructive' as const }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeMap = {
      cash: { label: 'نقدي', variant: 'default' as const },
      credit: { label: 'آجل', variant: 'secondary' as const }
    };

    const typeInfo = typeMap[type as keyof typeof typeMap] || { label: type, variant: 'secondary' as const };
    return <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة الفواتير</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/cash-sales-invoice')}>
            <Plus className="h-4 w-4 mr-2" />
            فاتورة نقدي
          </Button>
          <Button onClick={() => navigate('/credit-sales-invoice')}>
            <Plus className="h-4 w-4 mr-2" />
            فاتورة آجل
          </Button>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="dateFilter">البحث بالتاريخ</Label>
              <Input
                id="dateFilter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="numberFilter">رقم الفاتورة</Label>
              <Input
                id="numberFilter"
                placeholder="ابحث برقم الفاتورة..."
                value={numberFilter}
                onChange={(e) => setNumberFilter(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="customerFilter">اسم العميل</Label>
              <Input
                id="customerFilter"
                placeholder="ابحث باسم العميل..."
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="typeFilter">نوع الفاتورة</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="cash">نقدي</SelectItem>
                  <SelectItem value="credit">آجل</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="statusFilter">الحالة</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="paid">مدفوعة</SelectItem>
                  <SelectItem value="partial">مدفوعة جزئياً</SelectItem>
                  <SelectItem value="unpaid">غير مدفوعة</SelectItem>
                  <SelectItem value="cancelled">ملغاة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={clearFilters}>
              مسح الفلاتر
            </Button>
            <div className="text-sm text-muted-foreground flex items-center">
              عدد النتائج: {filteredInvoices.length}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>الفواتير</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد فواتير مطابقة للفلاتر المحددة
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الفاتورة</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>تاريخ الفاتورة</TableHead>
                  <TableHead>تاريخ الاستحقاق</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>المبلغ الإجمالي</TableHead>
                  <TableHead>المبلغ المدفوع</TableHead>
                  <TableHead>المبلغ المتبقي</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الموظف</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoice_number}
                    </TableCell>
                    <TableCell>
                      {invoice.customer ? (
                        <div>
                          <div className="font-medium">{invoice.customer.business_owner_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {invoice.customer.customer_code}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">غير محدد</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.invoice_date).toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell>
                      {invoice.due_date 
                        ? new Date(invoice.due_date).toLocaleDateString('ar-SA')
                        : 'غير محدد'
                      }
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(invoice.invoice_type)}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {invoice.total_amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {invoice.paid_amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="font-semibold text-red-600">
                      {invoice.remaining_amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(invoice.status)}
                    </TableCell>
                    <TableCell>
                      {invoice.employee?.name || 'غير محدد'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/invoices/view/${invoice.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/invoices/edit/${invoice.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            window.print();
                          }}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(invoice.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};