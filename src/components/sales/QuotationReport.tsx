import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QuotationData {
  id: string;
  quotation_number: string;
  quotation_date: string;
  valid_until: string | null;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  notes: string | null;
  terms_and_conditions: string | null;
  status: string;
  customer: {
    business_owner_name: string;
    customer_code: string;
    phone: string | null;
    email: string | null;
    address: string | null;
  } | null;
  employee: {
    name: string;
  } | null;
  quotation_items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    discount_percentage: number;
    total_price: number;
    product: {
      name: string;
      product_code: string;
    } | null;
  }>;
}

export const QuotationReport = () => {
  const { id } = useParams<{ id: string }>();
  const [quotation, setQuotation] = useState<QuotationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchQuotation();
    }
  }, [id]);

  const fetchQuotation = async () => {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          customer:customers(business_owner_name, customer_code, phone, email, address),
          employee:employees(name),
          quotation_items(
            id,
            quantity,
            unit_price,
            discount_percentage,
            total_price,
            product:products(name, product_code)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setQuotation(data as any);
    } catch (error) {
      console.error('Error fetching quotation:', error);
      toast.error('خطأ في تحميل عرض السعر');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-destructive">عرض السعر غير موجود</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Print controls - hidden in print */}
      <div className="print:hidden p-4 flex items-center justify-between bg-card border-b">
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          العودة
        </Button>
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          طباعة
        </Button>
      </div>

      {/* Invoice content */}
      <div className="max-w-4xl mx-auto p-8 bg-white text-black">
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-gray-800 pb-6">
          <h1 className="text-3xl font-bold mb-2">عرض سعر</h1>
          <div className="text-lg font-semibold">رقم العرض: {quotation.quotation_number}</div>
        </div>

        {/* Company and customer info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-3 border-b border-gray-400 pb-1">بيانات الشركة</h3>
            <div className="space-y-1 text-sm">
              <div>اسم الشركة: شركتك</div>
              <div>العنوان: عنوان الشركة</div>
              <div>الهاتف: رقم الهاتف</div>
              <div>البريد الإلكتروني: info@company.com</div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-3 border-b border-gray-400 pb-1">بيانات العميل</h3>
            <div className="space-y-1 text-sm">
              <div>كود العميل: {quotation.customer?.customer_code}</div>
              <div>اسم العميل: {quotation.customer?.business_owner_name}</div>
              {quotation.customer?.phone && <div>الهاتف: {quotation.customer.phone}</div>}
              {quotation.customer?.email && <div>البريد الإلكتروني: {quotation.customer.email}</div>}
              {quotation.customer?.address && <div>العنوان: {quotation.customer.address}</div>}
            </div>
          </div>
        </div>

        {/* Quotation details */}
        <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
          <div>
            <strong>تاريخ العرض:</strong><br />
            {new Date(quotation.quotation_date).toLocaleDateString('ar-SA')}
          </div>
          {quotation.valid_until && (
            <div>
              <strong>صالح حتى:</strong><br />
              {new Date(quotation.valid_until).toLocaleDateString('ar-SA')}
            </div>
          )}
          {quotation.employee && (
            <div>
              <strong>الموظف المسؤول:</strong><br />
              {quotation.employee.name}
            </div>
          )}
        </div>

        {/* Items table */}
        <div className="mb-8">
          <table className="w-full border-collapse border border-gray-400 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 p-2 text-right">الرقم</th>
                <th className="border border-gray-400 p-2 text-right">كود المنتج</th>
                <th className="border border-gray-400 p-2 text-right">اسم المنتج</th>
                <th className="border border-gray-400 p-2 text-center">الكمية</th>
                <th className="border border-gray-400 p-2 text-center">سعر الوحدة</th>
                <th className="border border-gray-400 p-2 text-center">خصم %</th>
                <th className="border border-gray-400 p-2 text-center">المجموع</th>
              </tr>
            </thead>
            <tbody>
              {quotation.quotation_items.map((item, index) => (
                <tr key={item.id}>
                  <td className="border border-gray-400 p-2 text-center">{index + 1}</td>
                  <td className="border border-gray-400 p-2">{item.product?.product_code}</td>
                  <td className="border border-gray-400 p-2">{item.product?.name}</td>
                  <td className="border border-gray-400 p-2 text-center">{item.quantity}</td>
                  <td className="border border-gray-400 p-2 text-center">{item.unit_price.toFixed(2)}</td>
                  <td className="border border-gray-400 p-2 text-center">{item.discount_percentage}%</td>
                  <td className="border border-gray-400 p-2 text-center font-semibold">{item.total_price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <table className="w-full border border-gray-400 text-sm">
              <tbody>
                <tr>
                  <td className="border-l border-gray-400 p-2 font-semibold bg-gray-50">المجموع الفرعي:</td>
                  <td className="p-2 text-center">{quotation.subtotal.toFixed(2)}</td>
                </tr>
                {quotation.discount_amount > 0 && (
                  <tr>
                    <td className="border-l border-gray-400 p-2 font-semibold bg-gray-50">إجمالي الخصم:</td>
                    <td className="p-2 text-center">-{quotation.discount_amount.toFixed(2)}</td>
                  </tr>
                )}
                {quotation.tax_amount > 0 && (
                  <tr>
                    <td className="border-l border-gray-400 p-2 font-semibold bg-gray-50">الضريبة:</td>
                    <td className="p-2 text-center">{quotation.tax_amount.toFixed(2)}</td>
                  </tr>
                )}
                <tr className="border-t-2 border-gray-800">
                  <td className="border-l border-gray-400 p-2 font-bold bg-gray-100">المجموع الإجمالي:</td>
                  <td className="p-2 text-center font-bold text-lg">{quotation.total_amount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes and terms */}
        {(quotation.notes || quotation.terms_and_conditions) && (
          <div className="space-y-4 text-sm">
            {quotation.notes && (
              <div>
                <h4 className="font-bold mb-2 border-b border-gray-400 pb-1">ملاحظات:</h4>
                <p className="whitespace-pre-wrap">{quotation.notes}</p>
              </div>
            )}
            {quotation.terms_and_conditions && (
              <div>
                <h4 className="font-bold mb-2 border-b border-gray-400 pb-1">الشروط والأحكام:</h4>
                <p className="whitespace-pre-wrap">{quotation.terms_and_conditions}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-400 text-center text-xs text-gray-600">
          <p>شكراً لتعاملكم معنا</p>
          <p className="mt-2">هذا عرض سعر غير ملزم وقابل للتعديل</p>
        </div>
      </div>
    </div>
  );
};