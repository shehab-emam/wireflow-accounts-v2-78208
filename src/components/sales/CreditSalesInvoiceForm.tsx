import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Search, CheckCircle2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

interface CustomerInvoice {
  id: string;
  invoice_number: string;
  total_amount: number;
  invoice_date: string;
}

export default function CreditSalesInvoiceForm() {
  const navigate = useNavigate();
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [isCustomerConfirmed, setIsCustomerConfirmed] = useState(false);
  const [customerBalance, setCustomerBalance] = useState(0);
  const [customerInvoices, setCustomerInvoices] = useState<CustomerInvoice[]>([]);
  
  const [formData, setFormData] = useState({
    employee_id: "",
    invoice_date: new Date().toISOString().split('T')[0],
    notes: "",
  });

  const [totals, setTotals] = useState({
    subtotal: 0,
    total_amount: 0,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [items]);

  const fetchInitialData = async () => {
    try {
      const [customersRes, employeesRes, productsRes, warehousesRes] = await Promise.all([
        supabase.from("customers").select("*"),
        supabase.from("employees").select("*"),
        supabase.from("products").select("*"),
        supabase.from("warehouses").select("*")
      ]);

      if (customersRes.data) setCustomers(customersRes.data);
      if (employeesRes.data) setEmployees(employeesRes.data);
      if (productsRes.data) setProducts(productsRes.data);
      if (warehousesRes.data) setWarehouses(warehousesRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("خطأ في تحميل البيانات");
    }
  };

  const fetchCustomerData = async (customerId: string) => {
    try {
      // Fetch customer previous balance
      const { data: invoicesData } = await supabase
        .from("credit_sales_invoices")
        .select("total_amount, paid_amount")
        .eq("customer_id", customerId)
        .eq("status", "completed");

      let balance = 0;
      if (invoicesData) {
        invoicesData.forEach(invoice => {
          balance += (invoice.total_amount || 0) - (invoice.paid_amount || 0);
        });
      }
      setCustomerBalance(balance);

      // Fetch last 3 invoices
      const { data: lastInvoices } = await supabase
        .from("credit_sales_invoices")
        .select("id, invoice_number, total_amount, invoice_date")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false })
        .limit(3);

      if (lastInvoices) {
        setCustomerInvoices(lastInvoices);
      }
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
  };

  const handleConfirmCustomer = () => {
    if (!selectedCustomerId) {
      toast.error("يرجى اختيار العميل أولاً");
      return;
    }
    setIsCustomerConfirmed(true);
    fetchCustomerData(selectedCustomerId);
    toast.success("تم تأكيد اختيار العميل");
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const total_amount = subtotal;

    setTotals({
      subtotal,
      total_amount,
    });
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

  const updateItem = async (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'product_id') {
          const product = products.find(p => p.id === value);
          if (product) {
            updatedItem.product_name = product.name;
            updatedItem.unit_price = product.sale_price || 0;
          }
        }

        if (field === 'warehouse_id') {
          const warehouse = warehouses.find(w => w.id === value);
          if (warehouse) {
            updatedItem.warehouse_name = warehouse.name;
          }
          
          // Fetch available quantity
          if (updatedItem.product_id && value) {
            fetchAvailableQuantity(updatedItem.product_id, value).then(qty => {
              setItems(prevItems => prevItems.map(prevItem => 
                prevItem.id === id ? { ...prevItem, available_quantity: qty } : prevItem
              ));
            });
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

  const fetchAvailableQuantity = async (productId: string, warehouseId: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from("warehouse_stock")
        .select("quantity")
        .eq("product_id", productId)
        .eq("warehouse_id", warehouseId)
        .single();

      if (error || !data) return 0;
      return data.quantity || 0;
    } catch (error) {
      return 0;
    }
  };

  const handleSave = async () => {
    if (!isCustomerConfirmed) {
      toast.error("يجب تأكيد اختيار العميل أولاً");
      return;
    }

    if (items.length === 0) {
      toast.error("يجب إضافة عنصر واحد على الأقل");
      return;
    }

    if (!formData.employee_id) {
      toast.error("يجب اختيار الموظف");
      return;
    }

    setIsLoading(true);
    try {
      // Generate invoice number
      const { data: invoiceNumberData, error: numberError } = await supabase
        .rpc('generate_credit_invoice_number');

      if (numberError) throw numberError;

      const invoiceNumber = invoiceNumberData;

      // Insert invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from("credit_sales_invoices")
        .insert({
          invoice_number: invoiceNumber,
          customer_id: selectedCustomerId,
          employee_id: formData.employee_id,
          invoice_date: formData.invoice_date,
          subtotal: totals.subtotal,
          total_amount: totals.total_amount,
          paid_amount: 0,
          remaining_amount: totals.total_amount,
          notes: formData.notes,
          status: 'completed'
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Insert invoice items
      const itemsToInsert = items.map(item => ({
        invoice_id: invoiceData.id,
        product_id: item.product_id,
        warehouse_id: item.warehouse_id,
        quantity: item.quantity,
        available_quantity: item.available_quantity,
        unit_price: item.unit_price,
        discount_percentage: item.discount_percentage,
        total_price: item.total_price
      }));

      const { error: itemsError } = await supabase
        .from("credit_sales_invoice_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast.success("تم حفظ فاتورة المبيعات الآجلة بنجاح");
      return invoiceData.id;
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error("خطأ في حفظ الفاتورة");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndView = async () => {
    const invoiceId = await handleSave();
    if (invoiceId) {
      navigate(`/credit-sales-invoice-report/${invoiceId}`);
    }
  };

  const handleNew = () => {
    setFormData({
      employee_id: "",
      invoice_date: new Date().toISOString().split('T')[0],
      notes: "",
    });
    setItems([]);
    setSelectedCustomerId("");
    setIsCustomerConfirmed(false);
    setCustomerBalance(0);
    setCustomerInvoices([]);
  };

  const handleViewInvoiceReport = (invoiceId: string) => {
    window.open(`/credit-sales-invoice-report/${invoiceId}`, '_blank');
  };

  const filteredCustomers = customers.filter(customer =>
    customer.business_owner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customer_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">فاتورة مبيعات آجلة</h1>
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
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="customer_id">العميل</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث عن عميل..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 mb-2"
                  disabled={isCustomerConfirmed}
                />
              </div>
              <Select 
                value={selectedCustomerId} 
                onValueChange={handleCustomerSelect}
                disabled={isCustomerConfirmed}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر العميل" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCustomers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.customer_code} - {customer.business_owner_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCustomerId && !isCustomerConfirmed && (
                <Button 
                  type="button" 
                  onClick={handleConfirmCustomer}
                  className="w-full mt-2"
                  variant="default"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  تأكيد اختيار العميل
                </Button>
              )}
            </div>

            <div>
              <Label htmlFor="employee_id">الموظف</Label>
              <Select 
                value={formData.employee_id}
                onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الموظف" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="invoice_date">تاريخ الفاتورة</Label>
              <Input
                type="date"
                value={formData.invoice_date}
                onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
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

                  <div className="col-span-2">
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

                  <div className="col-span-1">
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

        <Card>
          <CardHeader>
            <CardTitle>ملخص الفاتورة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isCustomerConfirmed && (
              <>
                <div className="flex justify-between text-muted-foreground">
                  <span>الرصيد السابق للعميل:</span>
                  <span className="font-semibold">{customerBalance.toFixed(2)}</span>
                </div>
                <Separator />
              </>
            )}
            <div className="flex justify-between">
              <span>المجموع الفرعي:</span>
              <span>{totals.subtotal.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>الإجمالي:</span>
              <span>{totals.total_amount.toFixed(2)}</span>
            </div>
            {isCustomerConfirmed && (
              <div className="flex justify-between text-muted-foreground">
                <span>إجمالي المديونية (شامل هذه الفاتورة):</span>
                <span className="font-semibold">{(customerBalance + totals.total_amount).toFixed(2)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {isCustomerConfirmed && customerInvoices.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>آخر 3 فواتير للعميل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {customerInvoices.map((invoice) => (
                  <div 
                    key={invoice.id}
                    className="flex justify-between items-center p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleViewInvoiceReport(invoice.id)}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{invoice.invoice_number}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        {new Date(invoice.invoice_date).toLocaleDateString('ar-EG')}
                      </span>
                      <span className="font-semibold">{invoice.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>ملاحظات</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="أدخل أي ملاحظات إضافية..."
              rows={3}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleNew}>
            جديد
          </Button>
          <Button 
            type="button" 
            onClick={handleSaveAndView}
            disabled={isLoading}
          >
            {isLoading ? "جاري الحفظ..." : "حفظ وعرض التقرير"}
          </Button>
        </div>
      </div>
    </div>
  );
}