import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, Save, FileText, X, Printer } from 'lucide-react';

// Data interfaces
interface Warehouse {
  id: string;
  name: string;
  location?: string;
}

interface Employee {
  id: string;
  name: string;
  position?: string;
}

interface Product {
  id: string;
  name: string;
  product_code: string;
  barcode?: string;
  category_id?: string;
  unit_id?: string;
}

interface Category {
  id: string;
  name: string;
}

interface Unit {
  id: string;
  name: string;
}

interface DispatchOrderItem {
  product_id: string;
  product_code: string;
  product_name: string;
  category_name?: string;
  unit_name?: string;
  quantity: number;
}

interface DispatchOrderFormData {
  order_number: string;
  permit_number?: string;
  warehouse_id?: string;
  employee_id?: string;
  description?: string;
}

const DispatchOrderForm: React.FC = () => {
  const { toast } = useToast();
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<DispatchOrderFormData>();

  // State for form data
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [items, setItems] = useState<DispatchOrderItem[]>([]);
  
  // State for adding items
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Generate order number
        const { data: orderNumber, error: orderError } = await supabase.rpc('generate_dispatch_order_number');
        if (orderError) throw orderError;
        setValue('order_number', orderNumber);

        // Fetch warehouses
        const { data: warehousesData, error: warehousesError } = await supabase
          .from('warehouses')
          .select('*')
          .order('name');
        if (warehousesError) throw warehousesError;
        setWarehouses(warehousesData || []);

        // Fetch employees
        const { data: employeesData, error: employeesError } = await supabase
          .from('employees')
          .select('*')
          .order('name');
        if (employeesError) throw employeesError;
        setEmployees(employeesData || []);

        // Fetch products with related data
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            product_categories(name),
            units_of_measure(name)
          `)
          .order('product_code');
        if (productsError) throw productsError;
        setProducts(productsData || []);

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('product_categories')
          .select('*')
          .order('name');
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Fetch units
        const { data: unitsData, error: unitsError } = await supabase
          .from('units_of_measure')
          .select('*')
          .order('name');
        if (unitsError) throw unitsError;
        setUnits(unitsData || []);

      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast({
          title: "خطأ",
          description: "حدث خطأ في تحميل البيانات",
          variant: "destructive",
        });
      }
    };

    fetchInitialData();
  }, [setValue, toast]);

  // Add item to the list
  const addItem = () => {
    if (!selectedProductId) {
      toast({
        title: "تحذير",
        description: "يرجى اختيار صنف",
        variant: "destructive",
      });
      return;
    }

    if (itemQuantity <= 0) {
      toast({
        title: "تحذير", 
        description: "يرجى إدخال كمية صحيحة",
        variant: "destructive",
      });
      return;
    }

    const selectedProduct = products.find(p => p.id === selectedProductId);
    if (!selectedProduct) return;

    const category = categories.find(c => c.id === selectedProduct.category_id);
    const unit = units.find(u => u.id === selectedProduct.unit_id);

    // Check if item already exists
    const existingItemIndex = items.findIndex(item => item.product_id === selectedProductId);
    
    if (existingItemIndex > -1) {
      // Update existing item
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += itemQuantity;
      setItems(updatedItems);
    } else {
      // Add new item
      const newItem: DispatchOrderItem = {
        product_id: selectedProduct.id,
        product_code: selectedProduct.product_code,
        product_name: selectedProduct.name,
        category_name: category?.name,
        unit_name: unit?.name,
        quantity: itemQuantity,
      };
      setItems([...items, newItem]);
    }

    // Reset selection
    setSelectedProductId('');
    setItemQuantity(1);
  };

  // Remove item from the list
  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  // Calculate totals
  const calculateTotals = () => {
    return {
      totalItems: items.length,
      totalPieces: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  };

  // Submit form
  const onSubmit = async (data: DispatchOrderFormData, saveAndNew?: boolean) => {
    if (items.length === 0) {
      toast({
        title: "تحذير",
        description: "يرجى إضافة أصناف للأمر",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const totals = calculateTotals();

      // Insert dispatch order
      const { data: dispatchOrder, error: orderError } = await supabase
        .from('dispatch_orders')
        .insert({
          order_number: data.order_number,
          permit_number: data.permit_number,
          warehouse_id: data.warehouse_id,
          employee_id: data.employee_id,
          description: data.description,
          total_items: totals.totalItems,
          total_pieces: totals.totalPieces,
          status: 'completed',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert dispatch order items
      const orderItems = items.map(item => ({
        dispatch_order_id: dispatchOrder.id,
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('dispatch_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: "نجح الحفظ",
        description: `تم حفظ أمر المنصرف رقم ${data.order_number} بنجاح`,
      });

      if (saveAndNew) {
        clearForm();
      } else {
        // Navigate back or show success
        window.history.back();
      }
    } catch (error) {
      console.error('Error saving dispatch order:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حفظ الأمر",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Clear form
  const clearForm = async () => {
    try {
      // Generate new order number
      const { data: orderNumber, error } = await supabase.rpc('generate_dispatch_order_number');
      if (error) throw error;
      
      reset();
      setValue('order_number', orderNumber);
      setItems([]);
      setSelectedProductId('');
      setItemQuantity(1);
    } catch (error) {
      console.error('Error generating new order number:', error);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-background p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">أمر منصرف من المخزن</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-6">
              {/* Header Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order_number">رقم أمر المنصرف</Label>
                  <Input
                    id="order_number"
                    {...register('order_number', { required: 'رقم الأمر مطلوب' })}
                    className="bg-gray-100"
                    readOnly
                  />
                  {errors.order_number && (
                    <p className="text-sm text-destructive">{errors.order_number.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="permit_number">رقم الإذن</Label>
                  <Input
                    id="permit_number"
                    {...register('permit_number')}
                    placeholder="اختياري"
                  />
                </div>

                <div className="space-y-2">
                  <Label>المخزن</Label>
                  <Select onValueChange={(value) => setValue('warehouse_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المخزن" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                          {warehouse.location && ` - ${warehouse.location}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>الموظف</Label>
                  <Select onValueChange={(value) => setValue('employee_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الموظف" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                          {employee.position && ` - ${employee.position}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">الشرح</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="وصف أمر المنصرف..."
                    className="resize-none"
                  />
                </div>
              </div>

              {/* Add Items Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">إضافة الأصناف</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2">
                      <Label>كود الصنف</Label>
                      <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الصنف" />
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

                    <div className="space-y-2">
                      <Label>اسم الصنف</Label>
                      <Input
                        value={selectedProductId ? products.find(p => p.id === selectedProductId)?.name || '' : ''}
                        readOnly
                        className="bg-gray-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>عدد الوحدات المنصرفة</Label>
                      <Input
                        type="number"
                        min="1"
                        value={itemQuantity}
                        onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <Button type="button" onClick={addItem} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      إضافة
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Items Table */}
              {items.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">الأصناف المضافة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">كود الصنف</TableHead>
                          <TableHead className="text-right">اسم الصنف</TableHead>
                          <TableHead className="text-right">نوع الصنف</TableHead>
                          <TableHead className="text-right">وحدة القياس</TableHead>
                          <TableHead className="text-right">الكمية</TableHead>
                          <TableHead className="text-right">إجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.product_code}</TableCell>
                            <TableCell>{item.product_name}</TableCell>
                            <TableCell>{item.category_name || '-'}</TableCell>
                            <TableCell>{item.unit_name || '-'}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeItem(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Summary */}
              {items.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4 text-lg font-semibold">
                      <div className="text-right">
                        عدد الأصناف المذكورة: <span className="text-primary">{totals.totalItems}</span>
                      </div>
                      <div className="text-right">
                        عدد القطع المذكورة: <span className="text-primary">{totals.totalPieces}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center flex-wrap">
                <Button
                  type="button"
                  onClick={() => onSubmit(watch(), true)}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  حفظ وجديد
                </Button>

                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  حفظ وإغلاق
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={clearForm}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  إلغاء التسجيل
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.print()}
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  طباعة البيان
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DispatchOrderForm;