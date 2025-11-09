import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
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

interface InvoiceFormData {
  customer_id: string;
  employee_id: string;
  invoice_date: string;
  due_date: string;
  invoice_type: 'cash' | 'credit';
  status: string;
  notes: string;
  items: InvoiceItem[];
}

export const InvoiceEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<InvoiceFormData>({
    customer_id: '',
    employee_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    invoice_type: 'cash',
    status: 'unpaid',
    notes: '',
    items: []
  });

  useEffect(() => {
    fetchInitialData();
    if (id) {
      fetchInvoice(id);
    }
  }, [id]);

  const fetchInitialData = async () => {
    try {
      // TODO: Replace with actual API calls when database is ready
      // Mock data for now
      setCustomers([
        { id: '1', business_owner_name: 'أحمد محمد', customer_code: 'C000001' },
        { id: '2', business_owner_name: 'سارة أحمد', customer_code: 'C000002' }
      ]);
      
      setEmployees([
        { id: '1', name: 'محمد أحمد' },
        { id: '2', name: 'فاطمة محمد' }
      ]);
      
      setProducts([
        { id: '1', name: 'منتج أ', sale_price: 500 },
        { id: '2', name: 'منتج ب', sale_price: 300 }
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('خطأ في تحميل البيانات');
    }
  };

  const fetchInvoice = async (invoiceId: string) => {
    try {
      // TODO: Replace with actual API call when database is ready
      // Mock data for now
      const mockData: InvoiceFormData = {
        customer_id: '1',
        employee_id: '1',
        invoice_date: '2024-01-15',
        due_date: '2024-02-15',
        invoice_type: 'cash',
        status: 'paid',
        notes: 'فاتورة تم دفعها بالكامل نقداً',
        items: [
          {
            id: '1',
            product_name: 'منتج أ',
            quantity: 2,
            unit_price: 500.00,
            discount_percentage: 0,
            total_price: 1000.00
          }
        ]
      };
      
      setFormData(mockData);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast.error('خطأ في تحميل الفاتورة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof InvoiceFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      product_name: '',
      quantity: 1,
      unit_price: 0,
      discount_percentage: 0,
      total_price: 0
    };
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const updateItem = (itemId: string, field: keyof InvoiceItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalculate total price
          if (field === 'quantity' || field === 'unit_price' || field === 'discount_percentage') {
            const subtotal = updatedItem.quantity * updatedItem.unit_price;
            const discountAmount = subtotal * (updatedItem.discount_percentage / 100);
            updatedItem.total_price = subtotal - discountAmount;
          }
          
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => total + item.total_price, 0);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement actual save logic when database is ready
      toast.success('تم حفظ الفاتورة بنجاح');
      navigate('/invoices/manage');
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('خطأ في حفظ الفاتورة');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/invoices/manage')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة للقائمة
        </Button>
        <h1 className="text-3xl font-bold">
          {id ? 'تعديل الفاتورة' : 'فاتورة جديدة'}
        </h1>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'جاري الحفظ...' : 'حفظ'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل الفاتورة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer">العميل</Label>
                <Select 
                  value={formData.customer_id} 
                  onValueChange={(value) => handleInputChange('customer_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.business_owner_name} - {customer.customer_code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="employee">الموظف</Label>
                <Select 
                  value={formData.employee_id} 
                  onValueChange={(value) => handleInputChange('employee_id', value)}
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice_date">تاريخ الفاتورة</Label>
                <Input
                  id="invoice_date"
                  type="date"
                  value={formData.invoice_date}
                  onChange={(e) => handleInputChange('invoice_date', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="due_date">تاريخ الاستحقاق</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => handleInputChange('due_date', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice_type">نوع الفاتورة</Label>
                <Select 
                  value={formData.invoice_type} 
                  onValueChange={(value: 'cash' | 'credit') => handleInputChange('invoice_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقدي</SelectItem>
                    <SelectItem value="credit">آجل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status">الحالة</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">مدفوعة</SelectItem>
                    <SelectItem value="partial">مدفوعة جزئياً</SelectItem>
                    <SelectItem value="unpaid">غير مدفوعة</SelectItem>
                    <SelectItem value="cancelled">ملغاة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                placeholder="أدخل أي ملاحظات..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>ملخص الفاتورة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-lg">
              <div className="flex justify-between">
                <span>عدد الأصناف:</span>
                <span>{formData.items.length}</span>
              </div>
              <div className="flex justify-between">
                <span>إجمالي الكمية:</span>
                <span>{formData.items.reduce((total, item) => total + item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between font-bold text-xl pt-2 border-t">
                <span>المبلغ الإجمالي:</span>
                <span>{calculateTotal().toFixed(2)} ريال</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>أصناف الفاتورة</CardTitle>
            <Button onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              إضافة صنف
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {formData.items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد أصناف. اضغط "إضافة صنف" لبدء إضافة الأصناف.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الصنف</TableHead>
                  <TableHead>الكمية</TableHead>
                  <TableHead>سعر الوحدة</TableHead>
                  <TableHead>نسبة الخصم %</TableHead>
                  <TableHead>الإجمالي</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Select 
                        value={item.product_name} 
                        onValueChange={(value) => updateItem(item.id, 'product_name', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الصنف" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.name}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discount_percentage}
                        onChange={(e) => updateItem(item.id, 'discount_percentage', parseFloat(e.target.value) || 0)}
                      />
                    </TableCell>
                    <TableCell className="font-semibold">
                      {item.total_price.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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