import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Save, X, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Warehouse {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  name: string;
}

interface Product {
  id: string;
  product_code: string;
  name: string;
  category_id: string;
  unit_id: string;
}

interface Category {
  id: string;
  name: string;
}

interface Unit {
  id: string;
  name: string;
}

interface PurchaseOrderItem {
  id?: string;
  product_id: string;
  product_code: string;
  product_name: string;
  category_name: string;
  unit_name: string;
  quantity: number;
}

interface PurchaseOrderFormData {
  order_number: string;
  permit_number: string;
  warehouse_id: string;
  employee_id: string;
  description: string;
}

const PurchaseOrderForm: React.FC = () => {
  const { register, handleSubmit, reset, setValue, watch } = useForm<PurchaseOrderFormData>();
  const { toast } = useToast();
  
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [itemQuantity, setItemQuantity] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
    generateOrderNumber();
  }, []);

  const loadInitialData = async () => {
    try {
      const [warehousesRes, employeesRes, productsRes, categoriesRes, unitsRes] = await Promise.all([
        supabase.from('warehouses').select('*').order('name'),
        supabase.from('employees').select('*').order('name'),
        supabase.from('products').select('*').order('name'),
        supabase.from('product_categories').select('*').order('name'),
        supabase.from('units_of_measure').select('*').order('name')
      ]);

      if (warehousesRes.data) setWarehouses(warehousesRes.data);
      if (employeesRes.data) setEmployees(employeesRes.data);
      if (productsRes.data) setProducts(productsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (unitsRes.data) setUnits(unitsRes.data);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل البيانات",
        variant: "destructive",
      });
    }
  };

  const generateOrderNumber = async () => {
    try {
      const { data, error } = await supabase.rpc('generate_purchase_order_number');
      if (error) throw error;
      setValue('order_number', data);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في توليد رقم الأمر",
        variant: "destructive",
      });
    }
  };

  const addItem = () => {
    if (!selectedProductId || itemQuantity <= 0) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار منتج وإدخال كمية صحيحة",
        variant: "destructive",
      });
      return;
    }

    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    const category = categories.find(c => c.id === product.category_id);
    const unit = units.find(u => u.id === product.unit_id);

    const newItem: PurchaseOrderItem = {
      product_id: selectedProductId,
      product_code: product.product_code,
      product_name: product.name,
      category_name: category?.name || '',
      unit_name: unit?.name || '',
      quantity: itemQuantity,
    };

    setItems([...items, newItem]);
    setSelectedProductId('');
    setItemQuantity(0);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const totalItems = items.length;
    const totalPieces = items.reduce((sum, item) => sum + item.quantity, 0);
    return { totalItems, totalPieces };
  };

  const onSubmit = async (data: PurchaseOrderFormData, saveAndNew = false) => {
    if (items.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إضافة أصناف إلى الأمر",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { totalItems, totalPieces } = calculateTotals();
      
      const { data: order, error: orderError } = await supabase
        .from('purchase_orders')
        .insert([{
          ...data,
          total_items: totalItems,
          total_pieces: totalPieces,
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        purchase_order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('purchase_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: "تم الحفظ",
        description: "تم حفظ أمر التوريد بنجاح",
      });

      if (saveAndNew) {
        reset();
        setItems([]);
        generateOrderNumber();
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في حفظ أمر التوريد",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    reset();
    setItems([]);
    generateOrderNumber();
  };

  const { totalItems, totalPieces } = calculateTotals();

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-right">أمر توريد إلى المخزن</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            {/* Header Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order_number">رقم أمر التوريد</Label>
                <Input
                  id="order_number"
                  {...register('order_number')}
                  readOnly
                  className="bg-muted"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="permit_number">رقم الإذن</Label>
                <Input
                  id="permit_number"
                  {...register('permit_number')}
                  placeholder="أدخل رقم الإذن"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warehouse_id">اسم المخزن</Label>
                <Select onValueChange={(value) => setValue('warehouse_id', value)}>
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

              <div className="space-y-2">
                <Label htmlFor="employee_id">اسم الموظف</Label>
                <Select onValueChange={(value) => setValue('employee_id', value)}>
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

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">الشرح</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="أدخل الشرح"
                  rows={2}
                />
              </div>
            </div>

            {/* Item Addition Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">إضافة صنف</CardTitle>
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
                    <Label>عدد الوحدات</Label>
                    <Input
                      type="number"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(Number(e.target.value))}
                      placeholder="الكمية"
                      min="1"
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-2"
                  >
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
                        <TableHead className="text-right">عدد الوحدات</TableHead>
                        <TableHead className="text-right">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.product_code}</TableCell>
                          <TableCell>{item.product_name}</TableCell>
                          <TableCell>{item.category_name}</TableCell>
                          <TableCell>{item.unit_name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            <Button
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
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-lg font-semibold">
                  <div className="text-right">
                    عدد الأصناف المذكورة: <span className="text-primary">{totalItems}</span>
                  </div>
                  <div className="text-right">
                    عدد القطع المذكورة: <span className="text-primary">{totalPieces}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                type="button"
                onClick={handleSubmit((data) => onSubmit(data, true))}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                حفظ وجديد
              </Button>

              <Button
                type="button"
                onClick={handleSubmit((data) => onSubmit(data, false))}
                disabled={loading}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                حفظ وإغلاق
              </Button>

              <Button
                type="button"
                onClick={clearForm}
                variant="outline"
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                إلغاء التسجيل
              </Button>

              <Button
                type="button"
                onClick={() => window.print()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                طباعة البيان
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseOrderForm;