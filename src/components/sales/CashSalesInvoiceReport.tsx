import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Printer, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InvoiceData {
  id: string;
  invoice_number: string;
  customer_phone: string;
  sales_representative: string;
  invoice_date: string;
  subtotal: number;
  discount_percentage: number;
  discount_amount: number;
  total_amount: number;
  payment_amount: number;
  change_amount: number;
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

export default function CashSalesInvoiceReport() {
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
        .from('cash_sales_invoices')
        .select(`
          *,
          cash_sales_invoice_items (
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
        .single();

      if (error) throw error;

      const formattedInvoice: InvoiceData = {
        ...invoiceData,
        items: invoiceData.cash_sales_invoice_items.map((item: any) => ({
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/cash-sales-invoice')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة
          </Button>
          <h1 className="text-2xl font-bold">تقرير فاتورة المبيعات النقدية</h1>
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
          <div className="text-center space-y-2">
            <CardTitle className="text-2xl">فاتورة مبيعات نقدية</CardTitle>
            <p className="text-muted-foreground">رقم الفاتورة: {invoice.invoice_number}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invoice Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <strong>رقم الفاتورة:</strong>
              <p>{invoice.invoice_number}</p>
            </div>
            <div>
              <strong>تاريخ الفاتورة:</strong>
              <p>{new Date(invoice.invoice_date).toLocaleDateString('ar-EG')}</p>
            </div>
            <div>
              <strong>الحالة:</strong>
              <p>{invoice.status === 'completed' ? 'مكتملة' : 'مسودة'}</p>
            </div>
          </div>

          {(invoice.customer_phone || invoice.sales_representative) && (
            <>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {invoice.customer_phone && (
                  <div>
                    <strong>رقم هاتف العميل:</strong>
                    <p>{invoice.customer_phone}</p>
                  </div>
                )}
                {invoice.sales_representative && (
                  <div>
                    <strong>اسم المندوب:</strong>
                    <p>{invoice.sales_representative}</p>
                  </div>
                )}
              </div>
            </>
          )}

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

          {/* Summary */}
          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-2">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span>{invoice.subtotal.toFixed(2)}</span>
              </div>
              {invoice.discount_percentage > 0 && (
                <>
                  <div className="flex justify-between">
                    <span>نسبة الخصم:</span>
                    <span>{invoice.discount_percentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>مبلغ الخصم:</span>
                    <span>{invoice.discount_amount.toFixed(2)}</span>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>الإجمالي:</span>
                <span>{invoice.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>المبلغ المدفوع:</span>
                <span>{invoice.payment_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>المبلغ المُسترد:</span>
                <span>{invoice.change_amount.toFixed(2)}</span>
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