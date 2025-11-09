import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Search, Save, Receipt, X, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface InvoiceItem {
  id: string;
  product_id: string;
  product_name: string;
  warehouse_id: string;
  warehouse_name: string;
  quantity: number;
  available_quantity: number;
  unit_price: number;
  discount_percentage: number;
  total_price: number;
}

interface FormData {
  invoice_number: string;
  customer_id: string;
  customer_phone: string;
  sales_representative: string;
  invoice_date: string;
  subtotal: number;
  discount_percentage: number;
  discount_amount: number;
  total_amount: number;
  notes: string;
  payment_amount: number;
  change_amount: number;
}

export default function CashSalesInvoiceForm() {
  const navigate = useNavigate();
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedInvoiceId, setSavedInvoiceId] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, reset, getValues } = useForm<FormData>({
    defaultValues: {
      invoice_number: "",
      customer_id: "",
      customer_phone: "",
      sales_representative: "",
      invoice_date: new Date().toISOString().split('T')[0],
      subtotal: 0,
      discount_percentage: 0,
      discount_amount: 0,
      total_amount: 0,
      payment_amount: 0,
      change_amount: 0,
    }
  });

  const watchedPayment = watch("payment_amount");
  const watchedTotal = watch("total_amount");
  const watchedDiscountPercentage = watch("discount_percentage");

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [items]);

  useEffect(() => {
    const change = Math.max(0, watchedPayment - watchedTotal);
    setValue("change_amount", change);
  }, [watchedPayment, watchedTotal, setValue]);

  useEffect(() => {
    calculateTotals();
  }, [watchedDiscountPercentage]);

  const fetchInitialData = async () => {
    try {
      const [invoiceNumberRes, productsRes, warehousesRes, customersRes] = await Promise.all([
        supabase.rpc('generate_cash_invoice_number'),
        supabase.from("products").select("*"),
        supabase.from("warehouses").select("*"),
        supabase.from("customers").select("*")
      ]);

      if (invoiceNumberRes.data) {
        setValue("invoice_number", invoiceNumberRes.data);
      }
      if (productsRes.data) setProducts(productsRes.data);
      if (warehousesRes.data) setWarehouses(warehousesRes.data);
      if (customersRes.data) setCustomers(customersRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("خطأ في تحميل البيانات");
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const discountPercentage = watchedDiscountPercentage || 0;
    const discountAmount = subtotal * (discountPercentage / 100);
    const totalAmount = subtotal - discountAmount;

    setValue("subtotal", subtotal);
    setValue("discount_amount", discountAmount);
    setValue("total_amount", totalAmount);
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      product_id: "",
      product_name: "",
      warehouse_id: "",
      warehouse_name: "",
      quantity: 1,
      available_quantity: 0,
      unit_price: 0,
      discount_percentage: 0,
      total_price: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'product_id') {
          const product = products.find(p => p.id === value);
          if (product) {
            updatedItem.product_name = product.name;
            updatedItem.unit_price = product.sale_price || 0;
            // Set available quantity (this would be calculated from inventory)
            updatedItem.available_quantity = product.opening_balance || 0;
          }
        }
        
        if (field === 'warehouse_id') {
          const warehouse = warehouses.find(w => w.id === value);
          if (warehouse) {
            updatedItem.warehouse_name = warehouse.name;
          }
        }
        
        if (field === 'quantity' || field === 'unit_price' || field === 'discount_percentage') {
          const subtotal = updatedItem.quantity * updatedItem.unit_price;
          const discount = subtotal * (updatedItem.discount_percentage / 100);
          updatedItem.total_price = subtotal - discount;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const handleSave = async (andClose = false) => {
    const data = getValues();
    if (items.length === 0) {
      toast.error("يجب إضافة عنصر واحد على الأقل");
      return;
    }

    if (data.payment_amount < data.total_amount) {
      toast.error("المبلغ المدفوع أقل من إجمالي الفاتورة");
      return;
    }

    setIsLoading(true);
    try {
      // Create the invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('cash_sales_invoices')
        .insert({
          invoice_number: data.invoice_number,
          customer_id: data.customer_id || null,
          customer_phone: data.customer_phone || null,
          sales_representative: data.sales_representative || null,
          invoice_date: data.invoice_date,
          subtotal: data.subtotal,
          discount_percentage: data.discount_percentage,
          discount_amount: data.discount_amount,
          total_amount: data.total_amount,
          payment_amount: data.payment_amount,
          change_amount: data.change_amount,
          notes: data.notes,
          status: 'completed'
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;
      setSavedInvoiceId(invoice.id);

      // Create cash receipt for the treasury
      const { error: receiptError } = await supabase
        .from('cash_receipts')
        .insert({
          voucher_number: `CR-${data.invoice_number}`,
          date: data.invoice_date,
          received_from: data.customer_id ? `عميل - ${data.invoice_number}` : `عميل نقدي - ${data.invoice_number}`,
          amount: data.total_amount,
          purpose: `تحصيل فاتورة مبيعات نقدي ${data.invoice_number}`,
          description: data.notes || null,
          received_by: data.sales_representative || null
        });

      if (receiptError) throw receiptError;

      // Create invoice items
      const invoiceItems = items.map(item => ({
        invoice_id: invoice.id,
        product_id: item.product_id,
        warehouse_id: item.warehouse_id,
        quantity: item.quantity,
        available_quantity: item.available_quantity,
        unit_price: item.unit_price,
        discount_percentage: item.discount_percentage,
        total_price: item.total_price
      }));

      const { error: itemsError } = await supabase
        .from('cash_sales_invoice_items')
        .insert(invoiceItems);

      if (itemsError) throw itemsError;

      toast.success("تم حفظ فاتورة المبيعات النقدية بنجاح");
      
      if (andClose) {
        navigate('/invoices-management');
      } else {
        handleNew();
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error("خطأ في حفظ الفاتورة");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNew = async () => {
    reset();
    setItems([]);
    setSavedInvoiceId(null);
    setValue("invoice_date", new Date().toISOString().split('T')[0]);
    
    // Generate new invoice number
    try {
      const { data } = await supabase.rpc('generate_cash_invoice_number');
      if (data) {
        setValue("invoice_number", data);
      }
    } catch (error) {
      console.error("Error generating invoice number:", error);
    }
  };

  const handleSaveAndShowReport = async () => {
    const data = getValues();
    if (items.length === 0) {
      toast.error("يجب إضافة عنصر واحد على الأقل");
      return;
    }

    if (data.payment_amount < data.total_amount) {
      toast.error("المبلغ المدفوع أقل من إجمالي الفاتورة");
      return;
    }

    setIsLoading(true);
    try {
      // Create the invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('cash_sales_invoices')
        .insert({
          invoice_number: data.invoice_number,
          customer_id: data.customer_id || null,
          customer_phone: data.customer_phone || null,
          sales_representative: data.sales_representative || null,
          invoice_date: data.invoice_date,
          subtotal: data.subtotal,
          discount_percentage: data.discount_percentage,
          discount_amount: data.discount_amount,
          total_amount: data.total_amount,
          payment_amount: data.payment_amount,
          change_amount: data.change_amount,
          notes: data.notes,
          status: 'completed'
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create cash receipt for the treasury
      const { error: receiptError } = await supabase
        .from('cash_receipts')
        .insert({
          voucher_number: `CR-${data.invoice_number}`,
          date: data.invoice_date,
          received_from: data.customer_id ? `عميل - ${data.invoice_number}` : `عميل نقدي - ${data.invoice_number}`,
          amount: data.total_amount,
          purpose: `تحصيل فاتورة مبيعات نقدي ${data.invoice_number}`,
          description: data.notes || null,
          received_by: data.sales_representative || null
        });

      if (receiptError) throw receiptError;

      // Create invoice items
      const invoiceItems = items.map(item => ({
        invoice_id: invoice.id,
        product_id: item.product_id,
        warehouse_id: item.warehouse_id,
        quantity: item.quantity,
        available_quantity: item.available_quantity,
        unit_price: item.unit_price,
        discount_percentage: item.discount_percentage,
        total_price: item.total_price
      }));

      const { error: itemsError } = await supabase
        .from('cash_sales_invoice_items')
        .insert(invoiceItems);

      if (itemsError) throw itemsError;

      toast.success("تم حفظ فاتورة المبيعات النقدية بنجاح");
      navigate(`/cash-sales-invoice/report/${invoice.id}`);
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error("خطأ في حفظ الفاتورة");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };


  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">فاتورة مبيعات نقدي</h1>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleNew}>
            جديد
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>معلومات الفاتورة</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="invoice_number">رقم الفاتورة</Label>
              <Input
                {...register("invoice_number", { required: true })}
                readOnly
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="customer_id">العميل</Label>
              <Select
                value={watch("customer_id")}
                onValueChange={(value) => {
                  setValue("customer_id", value);
                  const customer = customers.find(c => c.id === value);
                  if (customer) {
                    setValue("customer_phone", customer.phone || customer.phone_number || "");
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر العميل (اختياري)" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.customer_code} - {customer.business_owner_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="customer_phone">رقم هاتف العميل</Label>
              <Input
                {...register("customer_phone")}
                placeholder="أدخل رقم هاتف العميل"
              />
            </div>

            <div>
              <Label htmlFor="sales_representative">اسم المندوب</Label>
              <Input
                {...register("sales_representative")}
                placeholder="أدخل اسم المندوب"
              />
            </div>

            <div>
              <Label htmlFor="invoice_date">تاريخ الفاتورة</Label>
              <Input
                type="date"
                {...register("invoice_date", { required: true })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>عناصر الفاتورة</CardTitle>
              <Button type="button" onClick={addItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                إضافة عنصر
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg">
                  <div className="col-span-2">
                    <Label>المنتج</Label>
                    <Select
                      value={item.product_id}
                      onValueChange={(value) => updateItem(item.id, 'product_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المنتج" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.product_code} - {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Label>المخزن</Label>
                    <Select
                      value={item.warehouse_id}
                      onValueChange={(value) => updateItem(item.id, 'warehouse_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المخزن" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-1">
                    <Label>الكمية</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      min="1"
                    />
                  </div>

                  <div className="col-span-1">
                    <Label>المتاح</Label>
                    <Input
                      type="number"
                      value={item.available_quantity}
                      readOnly
                      className="bg-muted"
                    />
                  </div>

                  <div className="col-span-1">
                    <Label>سعر الوحدة</Label>
                    <Input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                      step="0.01"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>نسبة الخصم %</Label>
                    <Input
                      type="number"
                      value={item.discount_percentage}
                      onChange={(e) => updateItem(item.id, 'discount_percentage', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>المجموع</Label>
                    <Input
                      type="number"
                      value={item.total_price.toFixed(2)}
                      readOnly
                      className="bg-muted"
                    />
                  </div>

                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>الدفع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="payment_amount">المبلغ المدفوع</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("payment_amount", { required: true, min: 0 })}
                />
              </div>

              <div>
                <Label htmlFor="change_amount">المبلغ المُسترد</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("change_amount")}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ملخص الفاتورة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span>{watch("subtotal")?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount_percentage">نسبة الخصم %</Label>
                  <Input
                    type="number"
                    {...register("discount_percentage")}
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label>مبلغ الخصم</Label>
                  <Input
                    type="number"
                    value={watch("discount_amount")?.toFixed(2) || "0.00"}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>الإجمالي:</span>
                <span>{watch("total_amount")?.toFixed(2) || "0.00"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ملاحظات</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              {...register("notes")}
              placeholder="أدخل أي ملاحظات إضافية..."
              rows={3}
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>الإجراءات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => handleSave(false)} 
                className="w-full"
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                حفظ وجديد
              </Button>
              <Button 
                onClick={() => handleSave(true)} 
                variant="outline" 
                className="w-full"
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                حفظ وإغلاق
              </Button>
              <Button 
                onClick={handleSaveAndShowReport} 
                variant="outline" 
                className="w-full"
                disabled={isLoading}
              >
                <Receipt className="h-4 w-4 mr-2" />
                حفظ وعرض التقرير
              </Button>
              <Button 
                onClick={handlePrint} 
                variant="secondary" 
                className="w-full"
              >
                <Printer className="h-4 w-4 mr-2" />
                طباعة
              </Button>
              {savedInvoiceId && (
                <Button 
                  onClick={() => navigate(`/cash-sales-invoice/report/${savedInvoiceId}`)} 
                  variant="outline" 
                  className="w-full"
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  عرض التقرير
                </Button>
              )}
              <Button 
                onClick={() => navigate('/invoices-management')} 
                variant="destructive" 
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                إلغاء وإغلاق
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}