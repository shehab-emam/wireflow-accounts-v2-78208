import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Upload, RefreshCw } from 'lucide-react';

interface ProductFormData {
  code_prefix: string;
  product_code: string;
  barcode: string;
  name: string;
  category_id: string;
  unit_id: string;
  sale_price: number;
  discount_percentage: number;
  opening_balance: number;
  purchase_limit: number;
  reorder_level: number;
  image_url?: string;
}

interface Category {
  id: string;
  name: string;
}

interface Unit {
  id: string;
  name: string;
}

interface AddProductFormProps {
  onProductAdded?: () => void;
  initialData?: Partial<ProductFormData>;
  isEdit?: boolean;
  productId?: string;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ 
  onProductAdded, 
  initialData, 
  isEdit = false, 
  productId 
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingBarcode, setIsGeneratingBarcode] = useState(false);
  const [isFormEnabled, setIsFormEnabled] = useState(isEdit);
  const [productName, setProductName] = useState(initialData?.name || '');
  const { toast } = useToast();

  const form = useForm<ProductFormData>({
    defaultValues: {
      code_prefix: 'P',
      product_code: '',
      barcode: '',
      name: '',
      category_id: '',
      unit_id: '',
      sale_price: 0,
      discount_percentage: 0,
      opening_balance: 0,
      purchase_limit: 0,
      reorder_level: 0,
      image_url: '',
      ...initialData
    }
  });

  const handleNewForm = async () => {
    setIsFormEnabled(true);
    form.reset({
      code_prefix: 'P',
    });
    const newCode = await generateProductCode('P');
    form.setValue('product_code', newCode);
    generateBarcode();
    
    toast({
      title: "نموذج جديد",
      description: "تم تفعيل النموذج لإضافة منتج جديد",
    });
  };

  const handleClearData = () => {
    form.reset({
      product_code: '',
      barcode: '',
      name: '',
      category_id: '',
      unit_id: '',
      sale_price: 0,
      discount_percentage: 0,
      opening_balance: 0,
      purchase_limit: 0,
      reorder_level: 0,
      image_url: '',
    });
    setProductName('');
    
    toast({
      title: "تم مسح البيانات",
      description: "تم مسح جميع البيانات المدخلة",
    });
  };

  const handleCloseRegistration = () => {
    setIsFormEnabled(false);
    
    toast({
      title: "تم إغلاق التسجيل",
      description: "تم منع الكتابة في الخانات",
    });
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('id, name')
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
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setUnits(data || []);
    } catch (error) {
      console.error('خطأ في تحميل وحدات القياس:', error);
    }
  };

  const generateProductCode = async (prefix: string = 'P') => {
    try {
      const { data, error } = await supabase.rpc('generate_product_code');
      if (error) throw error;
      // Replace the prefix with the selected one
      return data.replace(/^[A-Z]/, prefix);
    } catch (error) {
      console.error('خطأ في توليد كود المنتج:', error);
      return `${prefix}${Date.now().toString().slice(-6)}`;
    }
  };

  const generateBarcode = async () => {
    setIsGeneratingBarcode(true);
    try {
      const { data, error } = await supabase.rpc('generate_barcode');
      if (error) throw error;
      form.setValue('barcode', data);
      toast({
        title: "تم إنشاء الباركود",
        description: "تم إنشاء باركود جديد بنجاح",
      });
    } catch (error) {
      console.error('خطأ في توليد الباركود:', error);
      const fallbackBarcode = `2${Date.now().toString().slice(-12)}`;
      form.setValue('barcode', fallbackBarcode);
    } finally {
      setIsGeneratingBarcode(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchUnits();
    // Only load initial data for edit mode
    // Product codes and barcodes are only generated when "New" button is pressed
  }, [isEdit, initialData]);

  const onSubmit = async (data: ProductFormData) => {
    // Validate required fields only for new products (not for editing)
    if (!isEdit && (!data.name || !data.category_id || !data.unit_id)) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء الحقول الإلزامية: اسم الصنف، تبعية الصنف، ووحدة القياس",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isEdit && productId) {
        console.log('Updating product with ID:', productId);
        console.log('Update data:', data);
        
        // Convert numeric fields to proper format and remove relations
        const updateData = {
          code_prefix: data.code_prefix,
          product_code: data.product_code,
          barcode: data.barcode,
          name: data.name,
          category_id: data.category_id,
          unit_id: data.unit_id,
          sale_price: data.sale_price ? Number(data.sale_price) : 0,
          discount_percentage: data.discount_percentage ? Number(data.discount_percentage) : 0,
          opening_balance: data.opening_balance ? Number(data.opening_balance) : 0,
          purchase_limit: data.purchase_limit ? Number(data.purchase_limit) : 0,
          reorder_level: data.reorder_level ? Number(data.reorder_level) : 0,
          image_url: data.image_url || '',
        };
        
        const { error } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', productId);
        
        if (error) {
          console.error('Supabase update error:', error);
          throw error;
        }
        
        toast({
          title: "تم تحديث المنتج",
          description: "تم تحديث بيانات المنتج بنجاح",
        });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([data]);
        
        if (error) throw error;
        
        toast({
          title: "تم إضافة المنتج",
          description: "تم إضافة المنتج الجديد بنجاح",
        });
      }

      onProductAdded?.();
    } catch (error) {
      console.error('خطأ في حفظ المنتج:', error);
      toast({
        title: "خطأ",
        description: `حدث خطأ أثناء حفظ المنتج: ${error.message || error}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndNew = async (data: ProductFormData) => {
    await onSubmit(data);
    if (!isEdit) {
      // Reset form for new product
      form.reset();
      const newCode = await generateProductCode();
      form.setValue('product_code', newCode);
      generateBarcode();
      
      toast({
        title: "جاهز للمنتج التالي",
        description: "تم إنشاء كود جديد لإضافة منتج آخر",
      });
    }
  };

  const handleNewProduct = async () => {
    form.reset();
    const newCode = await generateProductCode();
    form.setValue('product_code', newCode);
    generateBarcode();
    
    toast({
      title: "نموذج جديد",
      description: "تم إعداد نموذج جديد لإضافة منتج",
    });
  };

  return (
    <Card className="accounting-card">
      <CardHeader>
        <CardTitle className="text-foreground">
          {isEdit ? 'تعديل المنتج' : 'إضافة منتج جديد'}
        </CardTitle>
        {!isEdit && !isFormEnabled && (
          <div className="pt-4">
            <Button 
              onClick={handleNewForm}
              className="primary-gradient"
            >
              جديد
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Code Prefix with Description */}
              <FormField
                control={form.control}
                name="code_prefix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>بادئة كود الصنف</FormLabel>
                    <Select 
                      onValueChange={async (value) => {
                        field.onChange(value);
                        // Update product code with new prefix
                        const currentCode = form.getValues('product_code');
                        if (currentCode) {
                          const codeNumber = currentCode.replace(/^[A-Z]/, '');
                          form.setValue('product_code', `${value}${codeNumber}`);
                        } else {
                          const newCode = await generateProductCode(value);
                          form.setValue('product_code', newCode);
                        }
                      }} 
                      value={field.value} 
                      disabled={!isFormEnabled}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر البادئة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background border z-50">
                        <SelectItem value="P">P - أصناف</SelectItem>
                        <SelectItem value="M">M - خامات</SelectItem>
                        <SelectItem value="R">R - مستلزمات</SelectItem>
                        <SelectItem value="F">F - منتجات نهائية</SelectItem>
                        <SelectItem value="S">S - قطع غيار</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="text-xs text-muted-foreground mt-1 p-2 bg-muted/50 rounded">
                      {field.value === 'P' && '🔹 P: أصناف عامة'}
                      {field.value === 'M' && '🔹 M: خامات ومواد أولية'}
                      {field.value === 'R' && '🔹 R: مستلزمات وأدوات'}
                      {field.value === 'F' && '🔹 F: منتجات نهائية'}
                      {field.value === 'S' && '🔹 S: قطع غيار ومكونات'}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Product Code (Read-only) */}
              <FormField
                control={form.control}
                name="product_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كود الصنف الكامل</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        disabled 
                        className="bg-muted"
                        placeholder="سيتم إنشاؤه تلقائياً"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Barcode */}
              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الباركود</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input {...field} placeholder="الباركود" disabled={!isFormEnabled} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={generateBarcode}
                        disabled={isGeneratingBarcode || !isFormEnabled}
                      >
                        <RefreshCw className={`h-4 w-4 ${isGeneratingBarcode ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Product Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الصنف *</FormLabel>
                     <FormControl>
                       <Input 
                         {...field} 
                         placeholder="أدخل اسم الصنف" 
                         required 
                         disabled={!isFormEnabled}
                         onChange={(e) => {
                           field.onChange(e);
                           setProductName(e.target.value);
                         }}
                       />
                     </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تبعية الصنف *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!isFormEnabled}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الفئة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Unit of Measure */}
              <FormField
                control={form.control}
                name="unit_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وحدة القياس *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!isFormEnabled}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر وحدة القياس" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sale Price */}
              <FormField
                control={form.control}
                name="sale_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>سعر البيع</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        required
                        disabled={!isFormEnabled}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Discount Percentage */}
              <FormField
                control={form.control}
                name="discount_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نسبة الخصم (%)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="0.00"
                        disabled={!isFormEnabled}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Opening Balance */}
              <FormField
                control={form.control}
                name="opening_balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الرصيد الافتتاحي</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        placeholder="0"
                        required
                        disabled={!isFormEnabled}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Reorder Level */}
              <FormField
                control={form.control}
                name="reorder_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>حد الطلب</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        placeholder="0"
                        disabled={!isFormEnabled}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Product Image */}
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>صورة المنتج</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input {...field} placeholder="رابط صورة المنتج" disabled={!isFormEnabled} />
                      <Button type="button" variant="outline" size="icon" disabled={!isFormEnabled}>
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              {!isFormEnabled && !isEdit && (
                <Button 
                  onClick={handleNewForm}
                  className="primary-gradient"
                >
                  جديد
                </Button>
              )}
              
              {isFormEnabled && (
                <>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="primary-gradient"
                  >
                    {isLoading ? 'جاري الحفظ...' : (isEdit ? 'حفظ التعديل' : 'حفظ')}
                  </Button>
                  
                  {!isEdit && (
                    <>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => handleSaveAndNew(form.getValues())}
                        disabled={isLoading || !productName.trim()}
                      >
                        حفظ وجديد
                      </Button>
                      
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={handleClearData}
                        disabled={isLoading || !productName.trim()}
                      >
                        مسح البيانات
                      </Button>
                      
                      <Button 
                        type="button" 
                        variant="destructive"
                        onClick={handleCloseRegistration}
                        disabled={isLoading || !productName.trim()}
                      >
                        إغلاق التسجيل
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddProductForm;