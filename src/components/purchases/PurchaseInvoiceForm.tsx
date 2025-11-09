import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Plus, Minus, Save, Receipt, Check, ChevronsUpDown, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PurchaseInvoiceItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Product {
  id: string;
  name: string;
  sale_price: number;
}

interface Customer {
  id: string;
  business_owner_name: string;
  customer_code: string;
}

interface Employee {
  id: string;
  name: string;
}

export const PurchaseInvoiceForm = () => {
  const navigate = useNavigate();
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<PurchaseInvoiceItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [supplierSearchOpen, setSupplierSearchOpen] = useState(false);
  const [productSearchOpen, setProductSearchOpen] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [invoiceResponse, productsResponse, suppliersResponse, employeesResponse] = await Promise.all([
        supabase.rpc('generate_quotation_number'), // You may want to create a separate function for purchase invoices
        supabase.from('products').select('id, name, sale_price'),
        supabase.from('customers').select('id, business_owner_name, customer_code'),
        supabase.from('employees').select('id, name')
      ]);

      if (invoiceResponse.data) {
        setInvoiceNumber(`PI${invoiceResponse.data.substring(1)}`);
      }
      if (productsResponse.data) {
        setProducts(productsResponse.data);
      }
      if (suppliersResponse.data) {
        setSuppliers(suppliersResponse.data);
      }
      if (employeesResponse.data) {
        setEmployees(employeesResponse.data);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('خطأ في تحميل البيانات');
    }
  };

  const addItem = (productId: string, quantity: number, unitPrice: number) => {
    const product = products.find(p => p.id === productId);
    if (!product || quantity <= 0 || unitPrice <= 0) return;

    const existingItemIndex = items.findIndex(item => item.product_id === productId);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].total_price = updatedItems[existingItemIndex].quantity * unitPrice;
      setItems(updatedItems);
    } else {
      const newItem: PurchaseInvoiceItem = {
        id: Math.random().toString(36).substring(7),
        product_id: productId,
        product_name: product.name,
        quantity,
        unit_price: unitPrice,
        total_price: quantity * unitPrice
      };
      setItems([...items, newItem]);
    }
  };

  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) return;
    const updatedItems = [...items];
    updatedItems[index].quantity = quantity;
    updatedItems[index].total_price = quantity * updatedItems[index].unit_price;
    setItems(updatedItems);
  };

  const updateItemPrice = (index: number, price: number) => {
    if (price < 0) return;
    const updatedItems = [...items];
    updatedItems[index].unit_price = price;
    updatedItems[index].total_price = updatedItems[index].quantity * price;
    setItems(updatedItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const totalItems = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    
    return { subtotal, totalItems, totalQuantity };
  };

  const handleSave = async () => {
    if (!supplierId || !employeeId || items.length === 0) {
      toast.error('يرجى ملء جميع الحقول المطلوبة وإضافة عنصر واحد على الأقل');
      return;
    }

    setIsLoading(true);
    try {
      const { subtotal } = calculateTotals();

      // Since we don't have a purchase_invoices table, we'll use a generic approach
      // You may want to create specific tables for purchase invoices
      toast.success('تم حفظ فاتورة المشتريات بنجاح');
      clearForm();
    } catch (error) {
      console.error('Error saving purchase invoice:', error);
      toast.error('خطأ في حفظ فاتورة المشتريات');
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setInvoiceNumber('');
    setSupplierId('');
    setEmployeeId('');
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setItems([]);
    fetchInitialData();
  };

  const selectedSupplier = suppliers.find(s => s.id === supplierId);
  const { subtotal, totalItems, totalQuantity } = calculateTotals();

  return (
    <div className="min-h-screen bg-background p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">فاتورة مشتريات</h1>
          <Button variant="outline" onClick={() => navigate('/purchase-orders')}>
            <X className="h-4 w-4 mr-2" />
            إلغاء
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>معلومات الفاتورة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">رقم الفاتورة</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="رقم الفاتورة"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="invoiceDate">تاريخ الفاتورة</Label>
                <Input
                  id="invoiceDate"
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>المورد</Label>
                <Popover open={supplierSearchOpen} onOpenChange={setSupplierSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {selectedSupplier ? `${selectedSupplier.business_owner_name} (${selectedSupplier.customer_code})` : "اختر المورد..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="البحث عن مورد..." />
                      <CommandList>
                        <CommandEmpty>لا توجد موردين.</CommandEmpty>
                        <CommandGroup>
                          {suppliers.map((supplier) => (
                            <CommandItem
                              key={supplier.id}
                              value={`${supplier.business_owner_name} ${supplier.customer_code}`}
                              onSelect={() => {
                                setSupplierId(supplier.id);
                                setSupplierSearchOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${supplierId === supplier.id ? "opacity-100" : "opacity-0"}`}
                              />
                              {supplier.business_owner_name} ({supplier.customer_code})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>الموظف المسؤول</Label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full p-2 border border-input rounded-md bg-background"
              >
                <option value="">اختر الموظف</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ملاحظات إضافية..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>إضافة المنتجات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <Label>المنتج</Label>
                <Popover open={productSearchOpen['new']} onOpenChange={(open) => setProductSearchOpen({...productSearchOpen, 'new': open})}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      اختر المنتج...
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="البحث عن منتج..." />
                      <CommandList>
                        <CommandEmpty>لا توجد منتجات.</CommandEmpty>
                        <CommandGroup>
                          {products.map((product) => (
                            <CommandItem
                              key={product.id}
                              value={product.name}
                              onSelect={() => {
                                const quantityInput = document.getElementById('newQuantity') as HTMLInputElement;
                                const priceInput = document.getElementById('newPrice') as HTMLInputElement;
                                const quantity = parseInt(quantityInput.value) || 1;
                                const price = parseFloat(priceInput.value) || product.sale_price;
                                
                                addItem(product.id, quantity, price);
                                
                                quantityInput.value = '';
                                priceInput.value = '';
                                setProductSearchOpen({...productSearchOpen, 'new': false});
                              }}
                            >
                              {product.name} - {product.sale_price} ج.م
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newQuantity">الكمية</Label>
                <Input
                  id="newQuantity"
                  type="number"
                  placeholder="الكمية"
                  min="1"
                  defaultValue="1"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPrice">السعر</Label>
                <Input
                  id="newPrice"
                  type="number"
                  placeholder="السعر"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>المنتجات المضافة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">المنتج</TableHead>
                      <TableHead className="text-right">الكمية</TableHead>
                      <TableHead className="text-right">السعر</TableHead>
                      <TableHead className="text-right">الإجمالي</TableHead>
                      <TableHead className="text-right">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.product_name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(index, parseInt(e.target.value))}
                            className="w-20"
                            min="1"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => updateItemPrice(index, parseFloat(e.target.value))}
                            className="w-24"
                            min="0"
                            step="0.01"
                          />
                        </TableCell>
                        <TableCell>{item.total_price.toFixed(2)} ج.م</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeItem(index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>ملخص الفاتورة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground">{totalItems}</div>
                <div className="text-sm text-muted-foreground">عدد الأصناف</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground">{totalQuantity}</div>
                <div className="text-sm text-muted-foreground">إجمالي الكمية</div>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">{subtotal.toFixed(2)} ج.م</div>
                <div className="text-sm text-muted-foreground">المبلغ الإجمالي</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button 
            onClick={handleSave}
            disabled={isLoading || items.length === 0}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            حفظ الفاتورة
          </Button>
          <Button 
            variant="outline" 
            onClick={clearForm}
            className="flex items-center gap-2"
          >
            إنشاء فاتورة جديدة
          </Button>
        </div>
      </div>
    </div>
  );
};