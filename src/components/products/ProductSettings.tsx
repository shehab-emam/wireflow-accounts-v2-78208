import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, RefreshCw } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface Unit {
  id: string;
  name: string;
}

interface ProductCode {
  id: string;
  current_code: number;
  prefix: string;
  description?: string;
}

interface Warehouse {
  id: string;
  name: string;
  location?: string;
  description?: string;
  warehouse_type_id?: string;
}

const ProductSettings: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [productCodes, setProductCodes] = useState<ProductCode[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [newCodePrefix, setNewCodePrefix] = useState('P');
  const [newCodeDescription, setNewCodeDescription] = useState('أصناف عامة');
  const [newWarehouseName, setNewWarehouseName] = useState('');
  const [newWarehouseLocation, setNewWarehouseLocation] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const prefixOptions = [
    { value: 'P', label: 'P - أصناف', description: 'أصناف عامة' },
    { value: 'M', label: 'M - خامات', description: 'خامات ومواد أولية' },
    { value: 'R', label: 'R - مستلزمات', description: 'مستلزمات وأدوات' },
    { value: 'F', label: 'F - منتجات نهائية', description: 'منتجات نهائية' },
    { value: 'S', label: 'S - قطع غيار', description: 'قطع غيار ومكونات' },
  ];

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('خطأ في تحميل الفئات:', error);
    }
  };

  const fetchUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('units_of_measure')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setUnits(data || []);
    } catch (error) {
      console.error('خطأ في تحميل وحدات القياس:', error);
    }
  };

  const fetchProductCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('product_codes')
        .select('*')
        .order('created_at');
      
      if (error) throw error;
      setProductCodes(data || []);
    } catch (error) {
      console.error('خطأ في تحميل أكواد المنتجات:', error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setWarehouses(data || []);
    } catch (error) {
      console.error('خطأ في تحميل المخازن:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchUnits();
    fetchProductCodes();
    fetchWarehouses();
  }, []);

  const addCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم الفئة",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('product_categories')
        .insert([{ name: newCategoryName.trim() }]);
      
      if (error) throw error;
      
      setNewCategoryName('');
      fetchCategories();
      toast({
        title: "تم الإضافة",
        description: "تم إضافة الفئة بنجاح",
      });
    } catch (error) {
      console.error('خطأ في إضافة الفئة:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الفئة",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفئة؟')) return;

    try {
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      fetchCategories();
      toast({
        title: "تم الحذف",
        description: "تم حذف الفئة بنجاح",
      });
    } catch (error) {
      console.error('خطأ في حذف الفئة:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف الفئة",
        variant: "destructive",
      });
    }
  };

  const addUnit = async () => {
    if (!newUnitName.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم وحدة القياس",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('units_of_measure')
        .insert([{ name: newUnitName.trim() }]);
      
      if (error) throw error;
      
      setNewUnitName('');
      fetchUnits();
      toast({
        title: "تم الإضافة",
        description: "تم إضافة وحدة القياس بنجاح",
      });
    } catch (error) {
      console.error('خطأ في إضافة وحدة القياس:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة وحدة القياس",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUnit = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف وحدة القياس هذه؟')) return;

    try {
      const { error } = await supabase
        .from('units_of_measure')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      fetchUnits();
      toast({
        title: "تم الحذف",
        description: "تم حذف وحدة القياس بنجاح",
      });
    } catch (error) {
      console.error('خطأ في حذف وحدة القياس:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف وحدة القياس",
        variant: "destructive",
      });
    }
  };

  const addProductCode = async () => {
    if (!newCodePrefix.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار بادئة الكود",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('product_codes')
        .insert([{ 
          prefix: newCodePrefix.trim(), 
          current_code: 1 
        }]);
      
      if (error) throw error;
      
      setNewCodePrefix('P');
      setNewCodeDescription('أصناف عامة');
      fetchProductCodes();
      toast({
        title: "تم الإضافة",
        description: "تم إضافة نظام الكود بنجاح",
      });
    } catch (error) {
      console.error('خطأ في إضافة نظام الكود:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة نظام الكود",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProductCode = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف نظام الكود هذا؟')) return;

    try {
      const { error } = await supabase
        .from('product_codes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      fetchProductCodes();
      toast({
        title: "تم الحذف",
        description: "تم حذف نظام الكود بنجاح",
      });
    } catch (error) {
      console.error('خطأ في حذف نظام الكود:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف نظام الكود",
        variant: "destructive",
      });
    }
  };

  const addWarehouse = async () => {
    if (!newWarehouseName.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم المخزن",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('warehouses')
        .insert([{ 
          name: newWarehouseName.trim(),
          location: newWarehouseLocation.trim() || null
        }]);
      
      if (error) throw error;
      
      setNewWarehouseName('');
      setNewWarehouseLocation('');
      fetchWarehouses();
      toast({
        title: "تم الإضافة",
        description: "تم إضافة المخزن بنجاح",
      });
    } catch (error) {
      console.error('خطأ في إضافة المخزن:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة المخزن",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWarehouse = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المخزن؟')) return;

    try {
      const { error } = await supabase
        .from('warehouses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      fetchWarehouses();
      toast({
        title: "تم الحذف",
        description: "تم حذف المخزن بنجاح",
      });
    } catch (error) {
      console.error('خطأ في حذف المخزن:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المخزن",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Product Categories */}
        <Card className="accounting-card">
          <CardHeader>
            <CardTitle>تبعية الأصناف</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="اسم الفئة الجديدة"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCategory()}
              />
              <Button 
                onClick={addCategory}
                size="icon"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-2 border rounded">
                  <span>{category.name}</span>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => deleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Units of Measure */}
        <Card className="accounting-card">
          <CardHeader>
            <CardTitle>وحدات القياس</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="اسم وحدة القياس الجديدة"
                value={newUnitName}
                onChange={(e) => setNewUnitName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addUnit()}
              />
              <Button 
                onClick={addUnit}
                size="icon"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {units.map((unit) => (
                <div key={unit.id} className="flex items-center justify-between p-2 border rounded">
                  <span>{unit.name}</span>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => deleteUnit(unit.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Product Codes */}
        <Card className="accounting-card">
          <CardHeader>
            <CardTitle>أنظمة أكواد الأصناف</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">بادئة الكود</label>
                <Select value={newCodePrefix} onValueChange={(value) => {
                  setNewCodePrefix(value);
                  const option = prefixOptions.find(opt => opt.value === value);
                  setNewCodeDescription(option?.description || '');
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر البادئة" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    {prefixOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
                🔹 {newCodeDescription}
              </div>
              
              <Button 
                onClick={addProductCode}
                className="w-full"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة نظام كود جديد
              </Button>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {productCodes.map((code) => (
                <div key={code.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{code.prefix}</div>
                    <div className="text-sm text-muted-foreground">
                      الكود الحالي: {code.current_code}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {prefixOptions.find(opt => opt.value === code.prefix)?.description || ''}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => deleteProductCode(code.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Warehouses */}
        <Card className="accounting-card">
          <CardHeader>
            <CardTitle>المخازن</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="اسم المخزن"
                value={newWarehouseName}
                onChange={(e) => setNewWarehouseName(e.target.value)}
              />
              <Input
                placeholder="الموقع (اختياري)"
                value={newWarehouseLocation}
                onChange={(e) => setNewWarehouseLocation(e.target.value)}
              />
              <Button 
                onClick={addWarehouse}
                className="w-full"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة مخزن
              </Button>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {warehouses.map((warehouse) => (
                <div key={warehouse.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1">
                    <div className="font-medium">{warehouse.name}</div>
                    {warehouse.location && (
                      <div className="text-sm text-muted-foreground">
                        {warehouse.location}
                      </div>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => deleteWarehouse(warehouse.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button 
          onClick={() => {
            fetchCategories();
            fetchUnits();
            fetchProductCodes();
            fetchWarehouses();
          }}
          variant="outline"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          تحديث جميع البيانات
        </Button>
      </div>
    </div>
  );
};

export default ProductSettings;