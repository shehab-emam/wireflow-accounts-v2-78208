import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Package, Plus, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductFormData {
  name: string;
  code: string;
  category: string;
  description: string;
  unit: string;
  purchasePrice: string;
  sellingPrice: string;
  minStock: string;
  currentStock: string;
}

interface ProductsManagementProps {
  language: 'ar' | 'en';
}

export function ProductsManagement({ language }: ProductsManagementProps) {
  const { toast } = useToast();
  const form = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      code: '',
      category: '',
      description: '',
      unit: '',
      purchasePrice: '',
      sellingPrice: '',
      minStock: '',
      currentStock: ''
    }
  });

  const handleSave = (data: ProductFormData) => {
    console.log('Saving product:', data);
    toast({
      title: language === 'ar' ? "تم الحفظ بنجاح" : "Saved Successfully",
      description: language === 'ar' ? "تم حفظ الصنف بنجاح" : "Product saved successfully",
    });
  };

  const handleNew = () => {
    form.reset();
    toast({
      title: language === 'ar' ? "نموذج جديد" : "New Form",
      description: language === 'ar' ? "تم إنشاء نموذج جديد" : "New form created",
    });
  };

  const labels = {
    ar: {
      title: 'إدارة الأصناف',
      addProduct: 'إضافة صنف جديد',
      productName: 'اسم الصنف',
      productCode: 'كود الصنف',
      category: 'الفئة',
      description: 'الوصف',
      unit: 'الوحدة',
      purchasePrice: 'سعر الشراء',
      sellingPrice: 'سعر البيع',
      minStock: 'الحد الأدنى للمخزون',
      currentStock: 'المخزون الحالي',
      save: 'حفظ',
      new: 'جديد',
      placeholders: {
        productName: 'أدخل اسم الصنف',
        productCode: 'أدخل كود الصنف',
        category: 'أدخل الفئة',
        description: 'أدخل وصف الصنف',
        unit: 'مثال: قطعة، كيلو، متر',
        purchasePrice: '0.00',
        sellingPrice: '0.00',
        minStock: '0',
        currentStock: '0'
      }
    },
    en: {
      title: 'Products Management',
      addProduct: 'Add New Product',
      productName: 'Product Name',
      productCode: 'Product Code',
      category: 'Category',
      description: 'Description',
      unit: 'Unit',
      purchasePrice: 'Purchase Price',
      sellingPrice: 'Selling Price',
      minStock: 'Minimum Stock',
      currentStock: 'Current Stock',
      save: 'Save',
      new: 'New',
      placeholders: {
        productName: 'Enter product name',
        productCode: 'Enter product code',
        category: 'Enter category',
        description: 'Enter product description',
        unit: 'e.g: piece, kg, meter',
        purchasePrice: '0.00',
        sellingPrice: '0.00',
        minStock: '0',
        currentStock: '0'
      }
    }
  };

  const t = labels[language];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between",
        language === 'ar' && "flex-row-reverse"
      )}>
        <div className={cn(
          "flex items-center gap-3",
          language === 'ar' && "flex-row-reverse"
        )}>
          <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">{t.title}</h1>
        </div>
      </div>

      {/* Add Product Form */}
      <Card className="accounting-card">
        <CardHeader>
          <CardTitle className={cn(
            "flex items-center gap-2",
            language === 'ar' && "flex-row-reverse text-right"
          )}>
            <Plus className="h-5 w-5 text-primary" />
            {t.addProduct}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: language === 'ar' ? "اسم الصنف مطلوب" : "Product name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={language === 'ar' ? "text-right" : ""}>{t.productName}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t.placeholders.productName} 
                          className={language === 'ar' ? "text-right" : ""}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  rules={{ required: language === 'ar' ? "كود الصنف مطلوب" : "Product code is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={language === 'ar' ? "text-right" : ""}>{t.productCode}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t.placeholders.productCode} 
                          className={language === 'ar' ? "text-right" : ""}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={language === 'ar' ? "text-right" : ""}>{t.category}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t.placeholders.category} 
                          className={language === 'ar' ? "text-right" : ""}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={language === 'ar' ? "text-right" : ""}>{t.unit}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t.placeholders.unit} 
                          className={language === 'ar' ? "text-right" : ""}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={language === 'ar' ? "text-right" : ""}>{t.description}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t.placeholders.description} 
                        className={cn(
                          "min-h-[100px]",
                          language === 'ar' && "text-right"
                        )}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Pricing and Stock */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField
                  control={form.control}
                  name="purchasePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={language === 'ar' ? "text-right" : ""}>{t.purchasePrice}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder={t.placeholders.purchasePrice} 
                          className={language === 'ar' ? "text-right" : ""}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sellingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={language === 'ar' ? "text-right" : ""}>{t.sellingPrice}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder={t.placeholders.sellingPrice} 
                          className={language === 'ar' ? "text-right" : ""}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={language === 'ar' ? "text-right" : ""}>{t.minStock}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder={t.placeholders.minStock} 
                          className={language === 'ar' ? "text-right" : ""}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currentStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={language === 'ar' ? "text-right" : ""}>{t.currentStock}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder={t.placeholders.currentStock} 
                          className={language === 'ar' ? "text-right" : ""}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Action Buttons */}
              <div className={cn(
                "flex gap-4 pt-6",
                language === 'ar' && "flex-row-reverse"
              )}>
                <Button type="submit" className="min-w-[120px]">
                  <Save className="h-4 w-4 mr-2" />
                  {t.save}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleNew}
                  className="min-w-[120px]"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {t.new}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}