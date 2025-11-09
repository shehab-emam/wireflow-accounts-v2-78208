import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Printer, Edit, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InvoiceItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_percentage: number;
  total_price: number;
}

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
  notes?: string;
  customer: {
    business_owner_name: string;
    customer_code: string;
    phone?: string;
    email?: string;
    address?: string;
  } | null;
  employee: {
    name: string;
  } | null;
  items: InvoiceItem[];
}

export const InvoiceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchInvoice(id);
    }
  }, [id]);

  const fetchInvoice = async (invoiceId: string) => {
    try {
      // TODO: Replace with actual API call when database is ready
      // Mock data for now
      const mockInvoice: Invoice = {
        id: invoiceId,
        invoice_number: 'INV-000001',
        invoice_date: '2024-01-15',
        due_date: '2024-02-15',
        total_amount: 1500.00,
        paid_amount: 1500.00,
        remaining_amount: 0,
        status: 'paid',
        invoice_type: 'cash',
        notes: 'فاتورة تم دفعها بالكامل نقداً',
        customer: {
          business_owner_name: 'أحمد محمد',
          customer_code: 'C000001',
          phone: '123456789',
          email: 'ahmed@example.com',
          address: 'الرياض، المملكة العربية السعودية'
        },
        employee: {
          name: 'محمد أحمد'
        },
        items: [
          {
            id: '1',
            product_name: 'منتج أ',
            quantity: 2,
            unit_price: 500.00,
            discount_percentage: 0,
            total_price: 1000.00
          },
          {
            id: '2',
            product_name: 'منتج ب',
            quantity: 1,
            unit_price: 500.00,
            discount_percentage: 0,
            total_price: 500.00
          }
        ]
      };
      
      setInvoice(mockInvoice);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast.error('خطأ في تحميل الفاتورة');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
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

  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">الفاتورة غير موجودة</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <Button variant="outline" onClick={() => navigate('/invoices/manage')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة للقائمة
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/invoices/edit/${invoice.id}`)}>
            <Edit className="h-4 w-4 mr-2" />
            تعديل
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            طباعة
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            تحميل PDF
          </Button>
        </div>
      </div>

      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">الفاتورة {invoice.invoice_number}</CardTitle>
            <div className="flex gap-2">
              {getTypeBadge(invoice.invoice_type)}
              {getStatusBadge(invoice.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company and Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">معلومات الشركة</h3>
              <div className="space-y-1 text-sm">
                <p className="font-medium">مصنع الأسلاك</p>
                <p>الرياض، المملكة العربية السعودية</p>
                <p>الهاتف: +966 11 123 4567</p>
                <p>البريد الإلكتروني: info@wirefactory.com</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-3">معلومات العميل</h3>
              {invoice.customer ? (
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{invoice.customer.business_owner_name}</p>
                  <p>رمز العميل: {invoice.customer.customer_code}</p>
                  {invoice.customer.phone && <p>الهاتف: {invoice.customer.phone}</p>}
                  {invoice.customer.email && <p>البريد الإلكتروني: {invoice.customer.email}</p>}
                  {invoice.customer.address && <p>العنوان: {invoice.customer.address}</p>}
                </div>
              ) : (
                <p className="text-muted-foreground">غير محدد</p>
              )}
            </div>
          </div>

          {/* Invoice Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">تاريخ الفاتورة</p>
              <p className="font-medium">{new Date(invoice.invoice_date).toLocaleDateString('ar-SA')}</p>
            </div>
            {invoice.due_date && (
              <div>
                <p className="text-sm text-muted-foreground">تاريخ الاستحقاق</p>
                <p className="font-medium">{new Date(invoice.due_date).toLocaleDateString('ar-SA')}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">الموظف المسؤول</p>
              <p className="font-medium">{invoice.employee?.name || 'غير محدد'}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="pt-4 border-t">
            <h3 className="font-semibold text-lg mb-3">أصناف الفاتورة</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الصنف</TableHead>
                  <TableHead>الكمية</TableHead>
                  <TableHead>سعر الوحدة</TableHead>
                  <TableHead>نسبة الخصم</TableHead>
                  <TableHead>الإجمالي</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.product_name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.unit_price.toFixed(2)}</TableCell>
                    <TableCell>{item.discount_percentage}%</TableCell>
                    <TableCell className="font-semibold">{item.total_price.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totals */}
          <div className="flex justify-end pt-4 border-t">
            <div className="w-full max-w-sm space-y-2">
              <div className="flex justify-between">
                <span>المبلغ الإجمالي:</span>
                <span className="font-semibold">{invoice.total_amount.toFixed(2)} ريال</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>المبلغ المدفوع:</span>
                <span className="font-semibold">{invoice.paid_amount.toFixed(2)} ريال</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>المبلغ المتبقي:</span>
                <span className="font-semibold">{invoice.remaining_amount.toFixed(2)} ريال</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="pt-4 border-t">
              <h3 className="font-semibold text-lg mb-2">ملاحظات</h3>
              <p className="text-sm text-muted-foreground">{invoice.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};