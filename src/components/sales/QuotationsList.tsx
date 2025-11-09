import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Quotation {
  id: string;
  quotation_number: string;
  quotation_date: string;
  valid_until: string | null;
  total_amount: number;
  status: string;
  customer: {
    business_owner_name: string;
    customer_code: string;
  } | null;
  employee: {
    name: string;
  } | null;
}

export const QuotationsList = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [filteredQuotations, setFilteredQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter states
  const [dateFilter, setDateFilter] = useState('');
  const [numberFilter, setNumberFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');

  useEffect(() => {
    fetchQuotations();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [quotations, dateFilter, numberFilter, customerFilter]);

  const fetchQuotations = async () => {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          id,
          quotation_number,
          quotation_date,
          valid_until,
          total_amount,
          status,
          customer:customers(business_owner_name, customer_code),
          employee:employees(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotations(data as any);
    } catch (error) {
      console.error('Error fetching quotations:', error);
      toast.error('خطأ في تحميل عروض الأسعار');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...quotations];

    if (dateFilter) {
      filtered = filtered.filter(q => 
        q.quotation_date.includes(dateFilter)
      );
    }

    if (numberFilter) {
      filtered = filtered.filter(q => 
        q.quotation_number.toLowerCase().includes(numberFilter.toLowerCase())
      );
    }

    if (customerFilter) {
      filtered = filtered.filter(q => 
        q.customer?.business_owner_name.toLowerCase().includes(customerFilter.toLowerCase()) ||
        q.customer?.customer_code.toLowerCase().includes(customerFilter.toLowerCase())
      );
    }

    setFilteredQuotations(filtered);
  };

  const clearFilters = () => {
    setDateFilter('');
    setNumberFilter('');
    setCustomerFilter('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف عرض السعر؟')) return;

    try {
      // Delete quotation items first
      await supabase
        .from('quotation_items')
        .delete()
        .eq('quotation_id', id);

      // Delete quotation
      const { error } = await supabase
        .from('quotations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('تم حذف عرض السعر بنجاح');
      fetchQuotations();
    } catch (error) {
      console.error('Error deleting quotation:', error);
      toast.error('خطأ في حذف عرض السعر');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      draft: { label: 'مسودة', variant: 'secondary' as const },
      sent: { label: 'مرسل', variant: 'default' as const },
      approved: { label: 'موافق عليه', variant: 'default' as const },
      rejected: { label: 'مرفوض', variant: 'destructive' as const },
      expired: { label: 'منتهي الصلاحية', variant: 'destructive' as const }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
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
        <h1 className="text-3xl font-bold">إدارة عروض الأسعار</h1>
        <Button onClick={() => navigate('/quotations')}>
          <Plus className="h-4 w-4 mr-2" />
          عرض سعر جديد
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
              <Label htmlFor="dateFilter">البحث بالتاريخ</Label>
              <Input
                id="dateFilter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="numberFilter">رقم عرض السعر</Label>
              <Input
                id="numberFilter"
                placeholder="ابحث برقم العرض..."
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
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={clearFilters}>
              مسح الفلاتر
            </Button>
            <div className="text-sm text-muted-foreground flex items-center">
              عدد النتائج: {filteredQuotations.length}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotations Table */}
      <Card>
        <CardHeader>
          <CardTitle>عروض الأسعار</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredQuotations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد عروض أسعار مطابقة للفلاتر المحددة
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم العرض</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>تاريخ العرض</TableHead>
                  <TableHead>صالح حتى</TableHead>
                  <TableHead>المبلغ الإجمالي</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الموظف</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotations.map((quotation) => (
                  <TableRow key={quotation.id}>
                    <TableCell className="font-medium">
                      {quotation.quotation_number}
                    </TableCell>
                    <TableCell>
                      {quotation.customer ? (
                        <div>
                          <div className="font-medium">{quotation.customer.business_owner_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {quotation.customer.customer_code}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">غير محدد</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(quotation.quotation_date).toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell>
                      {quotation.valid_until 
                        ? new Date(quotation.valid_until).toLocaleDateString('ar-SA')
                        : 'غير محدد'
                      }
                    </TableCell>
                    <TableCell className="font-semibold">
                      {quotation.total_amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(quotation.status)}
                    </TableCell>
                    <TableCell>
                      {quotation.employee?.name || 'غير محدد'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/quotations/report/${quotation.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/quotations/edit/${quotation.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(quotation.id)}
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