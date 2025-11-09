import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Printer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

interface InvoiceData {
  id: string;
  invoice_number: string;
  customer: {
    business_owner_name: string;
    customer_code: string;
    phone_number: string;
    address: string;
    email: string;
  };
  employee: {
    name: string;
  };
  invoice_date: string;
  subtotal: number;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  notes: string;
  status: string;
  created_at: string;
  items: Array<{
    id: string;
    product_name: string;
    warehouse_name: string;
    quantity: number;
    available_quantity: number;
    unit_price: number;
    discount_percentage: number;
    total_price: number;
  }>;
}

export default function CreditSalesInvoiceReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchInvoiceData();
    }
  }, [id]);

  const fetchInvoiceData = async () => {
    try {
      const { data: invoiceData, error } = await supabase
        .from('credit_sales_invoices')
        .select(`
          *,
          customer:customers(business_owner_name, customer_code, phone_number, address, email),
          employee:employees(name),
          credit_sales_invoice_items (
            id,
            quantity,
            available_quantity,
            unit_price,
            discount_percentage,
            total_price,
            product:products(name),
            warehouse:warehouses(name)
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      const formattedInvoice: InvoiceData = {
        ...invoiceData,
        customer: invoiceData.customer,
        employee: invoiceData.employee,
        items: invoiceData.credit_sales_invoice_items.map((item: any) => ({
          id: item.id,
          product_name: item.product?.name || '',
          warehouse_name: item.warehouse?.name || '',
          quantity: item.quantity,
          available_quantity: item.available_quantity,
          unit_price: item.unit_price,
          discount_percentage: item.discount_percentage,
          total_price: item.total_price
        }))
      };

      setInvoice(formattedInvoice);
    } catch (error) {
      console.error('Error fetching invoice data:', error);
      toast.error('خطأ في تحميل بيانات الفاتورة');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">جاري تحميل بيانات الفاتورة...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-red-500">لم يتم العثور على الفاتورة</div>
      </div>
    );
  }

  const qrData = `اسم العميل: ${invoice.customer.business_owner_name}
كود العميل: ${invoice.customer.customer_code}
العنوان: ${invoice.customer.address || 'غير محدد'}
رقم الهاتف: ${invoice.customer.phone_number || 'غير محدد'}`;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/credit-sales-invoice')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة
          </Button>
          <h1 className="text-2xl font-bold">تقرير فاتورة المبيعات الآجلة</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            طباعة
          </Button>
        </div>
      </div>

      <Card className="print:shadow-none print:border-none">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-2xl">فاتورة مبيعات آجلة</CardTitle>
              <p className="text-muted-foreground">رقم الفاتورة: {invoice.invoice_number}</p>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg mb-2">بيانات المصنع</div>
              <p className="text-sm">اسم المصنع</p>
              <p className="text-sm text-muted-foreground">العنوان</p>
              <p className="text-sm text-muted-foreground">رقم الهاتف</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invoice and Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">معلومات الفاتورة</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">رقم الفاتورة:</span>
                  <span className="font-medium">{invoice.invoice_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">تاريخ الفاتورة:</span>
                  <span>{new Date(invoice.invoice_date).toLocaleDateString('ar-EG')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الحالة:</span>
                  <span>{invoice.status === 'completed' ? 'مكتملة' : 'مسودة'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الموظف:</span>
                  <span>{invoice.employee.name}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">بيانات العميل</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">اسم العميل:</span>
                  <span className="font-medium">{invoice.customer.business_owner_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">كود العميل:</span>
                  <span>{invoice.customer.customer_code}</span>
                </div>
                {invoice.customer.phone_number && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">رقم الهاتف:</span>
                    <span>{invoice.customer.phone_number}</span>
                  </div>
                )}
                {invoice.customer.address && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">العنوان:</span>
                    <span>{invoice.customer.address}</span>
                  </div>
                )}
                {invoice.customer.email && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">البريد الإلكتروني:</span>
                    <span>{invoice.customer.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Items Table */}
          <div>
            <h3 className="text-lg font-semibold mb-4">عناصر الفاتورة</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-2 text-right">المنتج</th>
                    <th className="border border-border p-2 text-right">المخزن</th>
                    <th className="border border-border p-2 text-center">الكمية</th>
                    <th className="border border-border p-2 text-center">المتاح</th>
                    <th className="border border-border p-2 text-center">سعر الوحدة</th>
                    <th className="border border-border p-2 text-center">خصم %</th>
                    <th className="border border-border p-2 text-center">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="border border-border p-2">{item.product_name}</td>
                      <td className="border border-border p-2">{item.warehouse_name}</td>
                      <td className="border border-border p-2 text-center">{item.quantity}</td>
                      <td className="border border-border p-2 text-center">{item.available_quantity}</td>
                      <td className="border border-border p-2 text-center">{item.unit_price.toFixed(2)}</td>
                      <td className="border border-border p-2 text-center">{item.discount_percentage}%</td>
                      <td className="border border-border p-2 text-center">{item.total_price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Separator />

          {/* Summary and QR Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex justify-center items-center">
              <div className="text-center">
                <p className="text-sm font-semibold mb-2">بيانات العميل - QR Code</p>
                <QRCodeSVG value={qrData} size={150} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span>{invoice.subtotal.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>الإجمالي:</span>
                <span>{invoice.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>المبلغ المدفوع:</span>
                <span>{invoice.paid_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-destructive font-semibold">
                <span>المبلغ المتبقي:</span>
                <span>{invoice.remaining_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <>
              <Separator />
              <div>
                <strong>ملاحظات:</strong>
                <p className="mt-2 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            </>
          )}

          <Separator />

          <div className="text-center text-sm text-muted-foreground">
            <p>تاريخ الإنشاء: {new Date(invoice.created_at).toLocaleString('ar-EG')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}