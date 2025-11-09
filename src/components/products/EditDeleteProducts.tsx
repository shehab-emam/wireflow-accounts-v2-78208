import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Search, Trash2, RefreshCw, FileDown, FileSpreadsheet, Edit } from 'lucide-react';
import AddProductForm from './AddProductForm';

interface Product {
  id: string;
  product_code: string;
  barcode: string;
  name: string;
  category_id: string;
  unit_id: string;
  sale_price: number;
  discount_percentage: number;
  opening_balance: number;
  purchase_limit: number;
  image_url?: string;
  product_categories?: { name: string };
  units_of_measure?: { name: string };
}

const EditDeleteProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories (name),
          units_of_measure (name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (error) {
      console.error('خطأ في تحميل المنتجات:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل المنتجات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
      
      toast({
        title: "تم الحذف",
        description: "تم حذف المنتج بنجاح",
      });
      
      fetchProducts();
      setSelectedProduct(null);
    } catch (error) {
      console.error('خطأ في حذف المنتج:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المنتج",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleProductUpdated = () => {
    fetchProducts();
    setSelectedProduct(null);
    toast({
      title: "تم التحديث",
      description: "تم تحديث بيانات المنتج بنجاح",
    });
  };

  const exportToPDF = () => {
    toast({
      title: "تصدير PDF",
      description: "سيتم إضافة هذه الميزة قريباً",
    });
  };

  const exportToExcel = () => {
    toast({
      title: "تصدير Excel",
      description: "سيتم إضافة هذه الميزة قريباً",
    });
  };

  return (
    <div className="space-y-6">
      {/* Edit Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="accounting-card">
          <CardHeader>
            <CardTitle>
              {selectedProduct ? 'تعديل المنتج' : 'اختر منتج للتعديل'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedProduct ? (
              <AddProductForm
                initialData={selectedProduct}
                isEdit={true}
                productId={selectedProduct.id}
                onProductAdded={handleProductUpdated}
              />
            ) : (
              <div className="text-center text-muted-foreground py-8">
                اختر منتج من الجدول لتعديله
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card className="accounting-card">
          <CardHeader>
            <CardTitle>عمليات المنتجات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  onClick={fetchProducts}
                  variant="outline"
                  className="flex-1"
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  تحديث البيانات
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={exportToPDF}
                  variant="outline"
                  className="flex-1"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  تصدير PDF
                </Button>
                
                <Button 
                  onClick={exportToExcel}
                  variant="outline"
                  className="flex-1"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  تصدير Excel
                </Button>
              </div>

              {selectedProduct && (
                <Button 
                  onClick={() => handleDeleteProduct(selectedProduct.id)}
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  حذف المنتج المحدد
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card className="accounting-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>قائمة المنتجات</CardTitle>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في المنتجات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>كود المنتج</TableHead>
                  <TableHead>الباركود</TableHead>
                  <TableHead>اسم المنتج</TableHead>
                  <TableHead>الفئة</TableHead>
                  <TableHead>وحدة القياس</TableHead>
                  <TableHead>سعر البيع</TableHead>
                  <TableHead>نسبة الخصم</TableHead>
                  <TableHead>الرصيد</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow 
                    key={product.id}
                    className={selectedProduct?.id === product.id ? 'bg-accent' : ''}
                  >
                    <TableCell className="font-medium">{product.product_code}</TableCell>
                    <TableCell>{product.barcode}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.product_categories?.name || '-'}</TableCell>
                    <TableCell>{product.units_of_measure?.name || '-'}</TableCell>
                    <TableCell>{product.sale_price.toFixed(2)}</TableCell>
                    <TableCell>{product.discount_percentage}%</TableCell>
                    <TableCell>{product.opening_balance}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredProducts.length === 0 && !isLoading && (
            <div className="text-center text-muted-foreground py-8">
              لا توجد منتجات
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EditDeleteProducts;