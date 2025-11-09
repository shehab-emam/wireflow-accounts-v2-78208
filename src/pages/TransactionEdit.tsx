import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TransactionItem {
  id?: string;
  product_id: string;
  quantity: number;
  product_name?: string;
}

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
  name: string;
  product_code: string;
}

const TransactionEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [transactionDate, setTransactionDate] = useState('');
  const [transactionType, setTransactionType] = useState<'incoming' | 'outgoing'>('incoming');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<TransactionItem[]>([]);
  
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load warehouses, employees, products
      const [warehousesRes, employeesRes, productsRes] = await Promise.all([
        supabase.from('warehouses').select('*').order('name'),
        supabase.from('employees').select('*').order('name'),
        supabase.from('products').select('*').order('name'),
      ]);

      if (warehousesRes.data) setWarehouses(warehousesRes.data);
      if (employeesRes.data) setEmployees(employeesRes.data);
      if (productsRes.data) setProducts(productsRes.data);

      // Load transaction
      const { data: transData, error: transError } = await supabase
        .from('warehouse_transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (transError) throw transError;

      setTransactionDate(transData.transaction_date);
      setTransactionType(transData.transaction_type as 'incoming' | 'outgoing');
      setSelectedWarehouse(transData.warehouse_id);
      setSelectedEmployee(transData.created_by);
      setReferenceNumber(transData.reference_number || '');
      setNotes(transData.notes || '');

      // Load items
      const { data: itemsData, error: itemsError } = await supabase
        .from('warehouse_transaction_items')
        .select('*, products(name)')
        .eq('transaction_id', id);

      if (itemsError) throw itemsError;

      setItems(itemsData.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        product_name: item.products?.name,
      })));
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء تحميل البيانات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedWarehouse || !selectedEmployee || items.length === 0) {
      toast({
        title: 'خطأ',
        description: 'يجب ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);

      // Update transaction
      const { error: transError } = await supabase
        .from('warehouse_transactions')
        .update({
          transaction_date: transactionDate,
          transaction_type: transactionType,
          warehouse_id: selectedWarehouse,
          created_by: selectedEmployee,
          reference_number: referenceNumber,
          notes: notes,
        })
        .eq('id', id);

      if (transError) throw transError;

      // Delete old items
      const { error: deleteError } = await supabase
        .from('warehouse_transaction_items')
        .delete()
        .eq('transaction_id', id);

      if (deleteError) throw deleteError;

      // Insert new items
      const itemsToInsert = items.map((item) => ({
        transaction_id: id,
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('warehouse_transaction_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast({
        title: 'تم الحفظ بنجاح',
        description: 'تم تحديث المعاملة بنجاح',
      });

      navigate(-1);
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء الحفظ',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof TransactionItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  if (loading) {
    return <div className="container mx-auto p-6">جاري التحميل...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="ml-2 h-4 w-4" />
          رجوع
        </Button>
        <h1 className="text-2xl font-bold">تعديل المعاملة</h1>
        <div className="w-24" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تفاصيل المعاملة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>التاريخ</Label>
              <Input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>النوع</Label>
              <Select value={transactionType} onValueChange={(value: 'incoming' | 'outgoing') => setTransactionType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="incoming">وارد</SelectItem>
                  <SelectItem value="outgoing">صادر</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>المخزن</Label>
              <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((wh) => (
                    <SelectItem key={wh.id} value={wh.id}>
                      {wh.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الموظف</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>رقم المرجع</Label>
              <Input
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="اختياري"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>ملاحظات</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اختياري"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>الأصناف</span>
            <Button onClick={addItem} size="sm">
              إضافة صنف
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label>الصنف</Label>
                  <Select
                    value={item.product_id}
                    onValueChange={(value) => updateItem(index, 'product_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((prod) => (
                        <SelectItem key={prod.id} value={prod.id}>
                          {prod.product_code} - {prod.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-32 space-y-2">
                  <Label>الكمية</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeItem(index)}
                >
                  حذف
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>
          إلغاء
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="ml-2 h-4 w-4" />
          {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
        </Button>
      </div>
    </div>
  );
};

export default TransactionEdit;
