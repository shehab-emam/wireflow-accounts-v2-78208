import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Save, Printer, FileDown, Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import IncomingProductsReport from './IncomingProductsReport';

interface WarehouseTransactionFormProps {
  transactionType: 'incoming' | 'outgoing';
  warehouseTypeFilter?: string;
}

export default function WarehouseTransactionForm({ 
  transactionType,
  warehouseTypeFilter 
}: WarehouseTransactionFormProps) {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  
  const [transactionNumber, setTransactionNumber] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [permitNumber, setPermitNumber] = useState('');
  const [description, setDescription] = useState('');
  
  const [items, setItems] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemStatementNumber, setItemStatementNumber] = useState('');
  const [itemStatementText, setItemStatementText] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedTransactionId, setSavedTransactionId] = useState<string | null>(null);
  const [savedTransactionData, setSavedTransactionData] = useState<any>(null);
  const [openProductCombo, setOpenProductCombo] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedWarehouse && products.length > 0) {
      fetchWarehouseProducts();
    } else {
      setFilteredProducts(products);
    }
  }, [selectedWarehouse, products]);

  const fetchInitialData = async () => {
    try {
      // Generate transaction number
      const { data: transNum, error: transError } = await supabase.rpc('generate_warehouse_transaction_number');
      if (transError) throw transError;
      setTransactionNumber(transNum);

      // Fetch warehouses
      let warehouseQuery = supabase.from('warehouses').select('*, warehouse_types(*)');
      if (warehouseTypeFilter) {
        warehouseQuery = warehouseQuery.eq('warehouse_types.name', warehouseTypeFilter);
      }
      const { data: warehousesData, error: warehousesError } = await warehouseQuery.order('name');
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

    } catch (error: any) {
      console.error('Error fetching initial data:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    }
  };

  const fetchWarehouseProducts = async () => {
    if (!selectedWarehouse) {
      setFilteredProducts(products);
      return;
    }

    try {
      // Fetch products that exist in the selected warehouse's stock
      const { data: stockData, error: stockError } = await supabase
        .from('warehouse_stock')
        .select('product_id')
        .eq('warehouse_id', selectedWarehouse)
        .gt('quantity', 0);

      if (stockError) throw stockError;

      // Filter products based on warehouse stock
      if (stockData && stockData.length > 0) {
        const productIdsInWarehouse = stockData.map(s => s.product_id);
        const filtered = products.filter(p => productIdsInWarehouse.includes(p.id));
        setFilteredProducts(filtered);
      } else {
        // If no stock, show all products for incoming transactions
        if (transactionType === 'incoming') {
          setFilteredProducts(products);
        } else {
          setFilteredProducts([]);
          toast.info('لا توجد أصناف متاحة في هذا المخزن');
        }
      }
    } catch (error: any) {
      console.error('Error fetching warehouse products:', error);
      setFilteredProducts(products);
    }
  };

  const addItem = () => {
    if (!selectedProductId) {
      toast.error('يرجى اختيار صنف');
      return;
    }

    if (itemQuantity <= 0) {
      toast.error('يرجى إدخال كمية صحيحة');
      return;
    }

    const selectedProduct = products.find(p => p.id === selectedProductId);
    if (!selectedProduct) return;

    const category = categories.find((c: any) => c.id === selectedProduct.category_id);
    const unit = units.find((u: any) => u.id === selectedProduct.unit_id);

    // Check if item already exists
    const existingItemIndex = items.findIndex(item => item.product_id === selectedProductId);
    
    if (existingItemIndex > -1) {
      // Update existing item
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += itemQuantity;
      setItems(updatedItems);
    } else {
      // Add new item
      const newItem = {
        product_id: selectedProduct.id,
        product_code: selectedProduct.product_code,
        product_name: selectedProduct.name,
        category_name: category?.name,
        unit_name: unit?.name,
        quantity: itemQuantity,
        statement_number: itemStatementNumber,
        statement_text: itemStatementText,
      };
      setItems([...items, newItem]);
    }

    // Reset selection
    setSelectedProductId('');
    setItemQuantity(1);
    setItemStatementNumber('');
    setItemStatementText('');
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };


  const calculateTotals = () => {
    return {
      totalItems: items.length,
      totalPieces: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  };

  const handleSave = async (saveAndNew?: boolean) => {
    if (!selectedWarehouse) {
      toast.error('الرجاء اختيار المخزن');
      return;
    }

    if (items.length === 0) {
      toast.error('الرجاء إضافة منتج واحد على الأقل');
      return;
    }

    setLoading(true);
    try {
      // Insert transaction
      const { data: transaction, error: transError } = await supabase
        .from('warehouse_transactions')
        .insert({
          transaction_number: transactionNumber,
          warehouse_id: selectedWarehouse,
          transaction_type: transactionType,
          transaction_date: transactionDate,
          reference_number: referenceNumber,
          notes: description,
          status: 'completed'
        })
        .select()
        .single();

      if (transError) throw transError;

      // Insert items
      const itemsToInsert = items.map(item => ({
        transaction_id: transaction.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: 0,
        notes: JSON.stringify({
          statement_number: item.statement_number || '',
          statement_text: item.statement_text || ''
        })
      }));

      const { error: itemsError } = await supabase
        .from('warehouse_transaction_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // Update stock
      for (const item of items) {
        const { data: currentStock } = await supabase
          .from('warehouse_stock')
          .select('*')
          .eq('warehouse_id', selectedWarehouse)
          .eq('product_id', item.product_id)
          .maybeSingle();

        const quantityChange = transactionType === 'incoming' 
          ? item.quantity 
          : -item.quantity;

        if (currentStock) {
          await supabase
            .from('warehouse_stock')
            .update({ 
              quantity: currentStock.quantity + quantityChange,
              last_updated: new Date().toISOString()
            })
            .eq('id', currentStock.id);
        } else {
          await supabase
            .from('warehouse_stock')
            .insert({
              warehouse_id: selectedWarehouse,
              product_id: item.product_id,
              quantity: quantityChange > 0 ? quantityChange : 0
            });
        }
      }

      toast.success(`تم حفظ ${transactionType === 'incoming' ? 'الإدخال' : 'الصرف'} رقم ${transactionNumber} بنجاح`);

      setSavedTransactionId(transaction.id);
      setSavedTransactionData({
        transaction,
        items: items,
        warehouseName: warehouses.find(w => w.id === selectedWarehouse)?.name,
        employeeName: employees.find(e => e.id === selectedEmployee)?.name
      });

      if (saveAndNew) {
        resetForm();
      }
    } catch (error: any) {
      console.error('Error saving transaction:', error);
      toast.error('خطأ في حفظ العملية: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = async () => {
    try {
      const { data: transNum, error } = await supabase.rpc('generate_warehouse_transaction_number');
      if (error) throw error;
      
      setTransactionNumber(transNum);
      setSelectedWarehouse('');
      setSelectedEmployee('');
      setReferenceNumber('');
      setPermitNumber('');
      setDescription('');
      setItems([]);
      setSelectedProductId('');
      setItemQuantity(1);
      setItemStatementNumber('');
      setItemStatementText('');
      setSavedTransactionId(null);
      setSavedTransactionData(null);
      setTransactionDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error generating new transaction number:', error);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Add Arabic font support
    doc.setLanguage('ar');
    doc.setR2L(true);
    
    // Title
    const title = transactionType === 'incoming' ? 'إدخال مخزني' : 'صرف مخزني';
    doc.setFontSize(18);
    doc.text(title, 105, 20, { align: 'center' });
    
    // Transaction details
    doc.setFontSize(12);
    doc.text(`رقم العملية: ${transactionNumber}`, 180, 40, { align: 'right' });
    doc.text(`التاريخ: ${transactionDate}`, 180, 50, { align: 'right' });
    doc.text(`رقم المرجع: ${referenceNumber || '-'}`, 180, 60, { align: 'right' });
    
    // Items table
    const tableData = items.map(item => [
      item.product_code,
      item.product_name,
      item.category_name || '-',
      item.unit_name || '-',
      item.quantity.toString()
    ]);
    
    (doc as any).autoTable({
      startY: 70,
      head: [['كود الصنف', 'اسم الصنف', 'نوع الصنف', 'وحدة القياس', 'الكمية']],
      body: tableData,
      styles: { font: 'helvetica', halign: 'right' },
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    // Totals
    const totals = calculateTotals();
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`عدد الأصناف: ${totals.totalItems}`, 180, finalY, { align: 'right' });
    doc.text(`عدد القطع: ${totals.totalPieces}`, 180, finalY + 10, { align: 'right' });
    
    doc.save(`${title}_${transactionNumber}.pdf`);
    toast.success('تم تصدير PDF بنجاح');
  };

  const handlePrint = () => {
    window.print();
  };

  const totals = calculateTotals();

  if (savedTransactionId && savedTransactionData && transactionType === 'incoming') {
    return <IncomingProductsReport transactionId={savedTransactionId} transactionData={savedTransactionData} />;
  }

  return (
    <div className="min-h-screen bg-background p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              {transactionType === 'incoming' ? 'أمر إدخال للمخزن' : 'أمر منصرف من المخزن'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              {/* Header Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transaction_number">
                    {transactionType === 'incoming' ? 'رقم أمر الإدخال' : 'رقم أمر المنصرف'}
                  </Label>
                  <Input
                    id="transaction_number"
                    value={transactionNumber}
                    className="bg-gray-100"
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="permit_number">رقم الإذن</Label>
                  <Input
                    id="permit_number"
                    value={permitNumber}
                    onChange={(e) => setPermitNumber(e.target.value)}
                    placeholder="اختياري"
                  />
                </div>

                <div className="space-y-2">
                  <Label>المخزن</Label>
                  <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
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
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
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

                <div className="space-y-2">
                  <Label htmlFor="transaction_date">التاريخ</Label>
                  <Input
                    id="transaction_date"
                    type="date"
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference_number">رقم المرجع</Label>
                  <Input
                    id="reference_number"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="اختياري"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">الشرح</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={`وصف ${transactionType === 'incoming' ? 'أمر الإدخال' : 'أمر المنصرف'}...`}
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
                  <div className="space-y-4">
                    {/* Add item form */}
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                      <div className="space-y-2">
                        <Label>كود الصنف</Label>
                        <Popover open={openProductCombo} onOpenChange={setOpenProductCombo}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openProductCombo}
                              className="w-full justify-between"
                            >
                              {selectedProductId
                                ? products.find((product) => product.id === selectedProductId)?.product_code
                                : "اختر كود الصنف"}
                              <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput placeholder="ابحث عن كود الصنف..." />
                              <CommandList>
                                <CommandEmpty>لا توجد منتجات</CommandEmpty>
                                <CommandGroup>
                                  {filteredProducts.map((product) => (
                                    <CommandItem
                                      key={product.id}
                                      value={product.product_code}
                                      onSelect={() => {
                                        setSelectedProductId(product.id);
                                        setOpenProductCombo(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "ml-2 h-4 w-4",
                                          selectedProductId === product.id ? "opacity-100" : "opacity-0"
                                        )}
                                       />
                                      {product.product_code} - {product.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label>اسم الصنف</Label>
                        <Input
                          value={selectedProductId ? filteredProducts.find(p => p.id === selectedProductId)?.name || products.find(p => p.id === selectedProductId)?.name || '' : ''}
                          readOnly
                          className="bg-gray-100"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>
                          {transactionType === 'incoming' ? 'عدد الوحدات المدخلة' : 'عدد الوحدات المنصرفة'}
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          value={itemQuantity}
                          onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="item_statement_number">رقم البيان</Label>
                        <Input
                          id="item_statement_number"
                          value={itemStatementNumber}
                          onChange={(e) => setItemStatementNumber(e.target.value)}
                          placeholder="رقم البيان"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="item_statement_text">شرح البيان</Label>
                        <Input
                          id="item_statement_text"
                          value={itemStatementText}
                          onChange={(e) => setItemStatementText(e.target.value)}
                          placeholder="شرح البيان"
                        />
                      </div>

                      <Button type="button" onClick={addItem} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        إضافة
                      </Button>
                    </div>
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
                          <TableHead className="text-right">رقم البيان</TableHead>
                          <TableHead className="text-right">شرح البيان</TableHead>
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
                            <TableCell>{item.statement_number || '-'}</TableCell>
                            <TableCell>{item.statement_text || '-'}</TableCell>
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
                  onClick={() => handleSave(true)}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  حفظ وجديد
                </Button>

                <Button
                  type="button"
                  onClick={() => handleSave(false)}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {transactionType === 'incoming' ? 'حفظ وعرض التقرير' : 'حفظ'}
                </Button>

                <Button
                  type="button"
                  onClick={handlePrint}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  طباعة
                </Button>

                <Button
                  type="button"
                  onClick={handleExportPDF}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FileDown className="h-4 w-4" />
                  تصدير PDF
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
