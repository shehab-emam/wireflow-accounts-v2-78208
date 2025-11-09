import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Plus, Minus, FileText, Save, Printer, Receipt, Check, ChevronsUpDown, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QuotationItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_percentage: number;
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

interface QuotationFormProps {
  quotationId?: string;
}

export const QuotationForm = ({ quotationId }: QuotationFormProps) => {
  const navigate = useNavigate();
  const [quotationNumber, setQuotationNumber] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedQuotationId, setSavedQuotationId] = useState<string | null>(null);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [productSearchOpen, setProductSearchOpen] = useState<{ [key: string]: boolean }>({});
  const isEditMode = !!quotationId;

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (isEditMode && quotationId) {
      fetchQuotationData();
    }
  }, [quotationId, isEditMode, products]);

  const fetchInitialData = async () => {
    try {
      const [quotationResponse, productsResponse, customersResponse, employeesResponse] = await Promise.all([
        isEditMode ? Promise.resolve({ data: null }) : supabase.rpc('generate_quotation_number'),
        supabase.from('products').select('id, name, sale_price'),
        supabase.from('customers').select('id, business_owner_name, customer_code'),
        supabase.from('employees').select('id, name')
      ]);

      if (!isEditMode && quotationResponse.data) {
        setQuotationNumber(quotationResponse.data);
      }
      if (productsResponse.data) {
        setProducts(productsResponse.data);
      }
      if (customersResponse.data) {
        setCustomers(customersResponse.data);
      }
      if (employeesResponse.data) {
        setEmployees(employeesResponse.data);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('خطأ في تحميل البيانات');
    }
  };

  const fetchQuotationData = async () => {
    if (!quotationId) return;

    try {
      const { data: quotation, error: quotationError } = await supabase
        .from('quotations')
        .select(`
          *,
          quotation_items (
            id,
            product_id,
            quantity,
            unit_price,
            discount_percentage,
            total_price,
            product:products(name)
          )
        `)
        .eq('id', quotationId)
        .single();

      if (quotationError) throw quotationError;

      // Set quotation data
      setQuotationNumber(quotation.quotation_number);
      setCustomerId(quotation.customer_id || '');
      setEmployeeId(quotation.employee_id || '');
      setQuotationDate(quotation.quotation_date);
      setValidUntil(quotation.valid_until || '');
      setNotes(quotation.notes || '');
      setTermsAndConditions(quotation.terms_and_conditions || '');
      setSavedQuotationId(quotation.id);

      // Set items data
      const quotationItems = quotation.quotation_items.map((item: any) => ({
        id: crypto.randomUUID(), // Generate new ID for the form
        product_id: item.product_id,
        product_name: item.product?.name || '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percentage: item.discount_percentage,
        total_price: item.total_price
      }));

      setItems(quotationItems);
    } catch (error) {
      console.error('Error fetching quotation data:', error);
      toast.error('خطأ في تحميل بيانات عرض السعر');
    }
  };

  const addItem = () => {
    const newItem: QuotationItem = {
      id: crypto.randomUUID(),
      product_id: '',
      product_name: '',
      quantity: 1,
      unit_price: 0,
      discount_percentage: 0,
      total_price: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof QuotationItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'product_id') {
          const product = products.find(p => p.id === value);
          if (product) {
            updatedItem.product_name = product.name;
            updatedItem.unit_price = product.sale_price;
          }
        }
        
        // Calculate total price
        const discountAmount = (updatedItem.unit_price * updatedItem.discount_percentage) / 100;
        const priceAfterDiscount = updatedItem.unit_price - discountAmount;
        updatedItem.total_price = priceAfterDiscount * updatedItem.quantity;
        
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const discountAmount = 0; // Can be added later if needed
    const taxAmount = 0; // Can be added later if needed
    const totalAmount = subtotal - discountAmount + taxAmount;
    
    return { subtotal, discountAmount, taxAmount, totalAmount };
  };

  const handleSave = async (andClose = false) => {
    if (!customerId || items.length === 0) {
      toast.error('يرجى اختيار العميل وإضافة عناصر للعرض');
      return;
    }

    setIsLoading(true);
    try {
      const { subtotal, discountAmount, taxAmount, totalAmount } = calculateTotals();
      
      if (isEditMode && quotationId) {
        // Update existing quotation
        const { error: quotationError } = await supabase
          .from('quotations')
          .update({
            customer_id: customerId,
            employee_id: employeeId || null,
            quotation_date: quotationDate,
            valid_until: validUntil || null,
            subtotal,
            tax_amount: taxAmount,
            discount_amount: discountAmount,
            total_amount: totalAmount,
            notes,
            terms_and_conditions: termsAndConditions,
          })
          .eq('id', quotationId);

        if (quotationError) throw quotationError;

        // Delete existing items
        await supabase
          .from('quotation_items')
          .delete()
          .eq('quotation_id', quotationId);

        // Insert new items
        const quotationItems = items.map(item => ({
          quotation_id: quotationId,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percentage: item.discount_percentage,
          total_price: item.total_price
        }));

        const { error: itemsError } = await supabase
          .from('quotation_items')
          .insert(quotationItems);

        if (itemsError) throw itemsError;

        toast.success('تم تحديث عرض السعر بنجاح');
      } else {
        // Create new quotation
        const { data: quotation, error: quotationError } = await supabase
          .from('quotations')
          .insert({
            quotation_number: quotationNumber,
            customer_id: customerId,
            employee_id: employeeId || null,
            quotation_date: quotationDate,
            valid_until: validUntil || null,
            subtotal,
            tax_amount: taxAmount,
            discount_amount: discountAmount,
            total_amount: totalAmount,
            notes,
            terms_and_conditions: termsAndConditions,
            status: 'draft'
          })
          .select()
          .single();

        if (quotationError) throw quotationError;

        setSavedQuotationId(quotation.id);

        const quotationItems = items.map(item => ({
          quotation_id: quotation.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percentage: item.discount_percentage,
          total_price: item.total_price
        }));

        const { error: itemsError } = await supabase
          .from('quotation_items')
          .insert(quotationItems);

        if (itemsError) throw itemsError;

        toast.success('تم حفظ عرض السعر بنجاح');
      }
      
      if (andClose) {
        window.history.back();
      } else if (!isEditMode) {
        // Reset form for new quotation only if not in edit mode
        await fetchInitialData();
        setCustomerId('');
        setEmployeeId('');
        setQuotationDate(new Date().toISOString().split('T')[0]);
        setValidUntil('');
        setNotes('');
        setTermsAndConditions('');
        setItems([]);
        setSavedQuotationId(null);
      }
    } catch (error) {
      console.error('Error saving quotation:', error);
      toast.error('خطأ في حفظ عرض السعر');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndShowReport = async () => {
    if (!customerId || items.length === 0) {
      toast.error('يرجى اختيار العميل وإضافة عناصر للعرض');
      return;
    }

    setIsLoading(true);
    try {
      const { subtotal, discountAmount, taxAmount, totalAmount } = calculateTotals();
      
      if (isEditMode && quotationId) {
        // Update existing quotation
        await supabase
          .from('quotations')
          .update({
            customer_id: customerId,
            employee_id: employeeId || null,
            quotation_date: quotationDate,
            valid_until: validUntil || null,
            subtotal,
            tax_amount: taxAmount,
            discount_amount: discountAmount,
            total_amount: totalAmount,
            notes,
            terms_and_conditions: termsAndConditions,
          })
          .eq('id', quotationId);

        // Delete existing items
        await supabase
          .from('quotation_items')
          .delete()
          .eq('quotation_id', quotationId);

        // Insert new items
        const quotationItems = items.map(item => ({
          quotation_id: quotationId,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percentage: item.discount_percentage,
          total_price: item.total_price
        }));

        await supabase
          .from('quotation_items')
          .insert(quotationItems);

        toast.success('تم تحديث عرض السعر بنجاح');
        navigate(`/quotations/report/${quotationId}`);
      } else {
        // Create new quotation
        const { data: quotation, error: quotationError } = await supabase
          .from('quotations')
          .insert({
            quotation_number: quotationNumber,
            customer_id: customerId,
            employee_id: employeeId || null,
            quotation_date: quotationDate,
            valid_until: validUntil || null,
            subtotal,
            tax_amount: taxAmount,
            discount_amount: discountAmount,
            total_amount: totalAmount,
            notes,
            terms_and_conditions: termsAndConditions,
            status: 'draft'
          })
          .select()
          .single();

        if (quotationError) throw quotationError;

        const quotationItems = items.map(item => ({
          quotation_id: quotation.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percentage: item.discount_percentage,
          total_price: item.total_price
        }));

        await supabase
          .from('quotation_items')
          .insert(quotationItems);

        toast.success('تم حفظ عرض السعر بنجاح');
        navigate(`/quotations/report/${quotation.id}`);
      }
    } catch (error) {
      console.error('Error saving quotation:', error);
      toast.error('خطأ في حفظ عرض السعر');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseQuotation = async () => {
    if (!customerId || items.length === 0) {
      toast.error('يرجى اختيار العميل وإضافة عناصر للعرض');
      return;
    }

    setIsLoading(true);
    try {
      const { subtotal, discountAmount, taxAmount, totalAmount } = calculateTotals();
      
      if (isEditMode && quotationId) {
        // Update existing quotation to closed status
        await supabase
          .from('quotations')
          .update({
            customer_id: customerId,
            employee_id: employeeId || null,
            quotation_date: quotationDate,
            valid_until: validUntil || null,
            subtotal,
            tax_amount: taxAmount,
            discount_amount: discountAmount,
            total_amount: totalAmount,
            notes,
            terms_and_conditions: termsAndConditions,
            status: 'closed'
          })
          .eq('id', quotationId);

        // Delete existing items
        await supabase
          .from('quotation_items')
          .delete()
          .eq('quotation_id', quotationId);

        // Insert new items
        const quotationItems = items.map(item => ({
          quotation_id: quotationId,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percentage: item.discount_percentage,
          total_price: item.total_price
        }));

        await supabase
          .from('quotation_items')
          .insert(quotationItems);

        toast.success('تم إغلاق عرض السعر بنجاح');
      } else {
        // Create new quotation with closed status
        const { data: quotation, error: quotationError } = await supabase
          .from('quotations')
          .insert({
            quotation_number: quotationNumber,
            customer_id: customerId,
            employee_id: employeeId || null,
            quotation_date: quotationDate,
            valid_until: validUntil || null,
            subtotal,
            tax_amount: taxAmount,
            discount_amount: discountAmount,
            total_amount: totalAmount,
            notes,
            terms_and_conditions: termsAndConditions,
            status: 'closed'
          })
          .select()
          .single();

        if (quotationError) throw quotationError;

        const quotationItems = items.map(item => ({
          quotation_id: quotation.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percentage: item.discount_percentage,
          total_price: item.total_price
        }));

        await supabase
          .from('quotation_items')
          .insert(quotationItems);

        toast.success('تم إغلاق عرض السعر بنجاح');
      }
      
      window.history.back();
    } catch (error) {
      console.error('Error closing quotation:', error);
      toast.error('خطأ في إغلاق عرض السعر');
    } finally {
      setIsLoading(false);
    }
  };

  const { subtotal, totalAmount } = calculateTotals();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {isEditMode ? 'تعديل عرض سعر' : 'إنشاء عرض سعر'}
        </h1>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {quotationNumber}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                بيانات عرض السعر
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer">العميل</Label>
                <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={customerSearchOpen}
                      className="w-full justify-between"
                    >
                      {customerId
                        ? customers.find((customer) => customer.id === customerId)?.customer_code + " - " + customers.find((customer) => customer.id === customerId)?.business_owner_name
                        : "اختر العميل..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="ابحث عن العميل..." />
                      <CommandList>
                        <CommandEmpty>لا يوجد عملاء.</CommandEmpty>
                        <CommandGroup>
                          {customers.map((customer) => (
                            <CommandItem
                              key={customer.id}
                              value={customer.customer_code + " - " + customer.business_owner_name}
                              onSelect={() => {
                                setCustomerId(customer.id);
                                setCustomerSearchOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  customerId === customer.id ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              {customer.customer_code} - {customer.business_owner_name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="employee">الموظف المسؤول</Label>
                <Select value={employeeId} onValueChange={setEmployeeId}>
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

              <div>
                <Label htmlFor="quotationDate">تاريخ العرض</Label>
                <Input
                  id="quotationDate"
                  type="date"
                  value={quotationDate}
                  onChange={(e) => setQuotationDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="validUntil">صالح حتى</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>العناصر</CardTitle>
                <Button onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة عنصر
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المنتج</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>سعر الوحدة</TableHead>
                    <TableHead>خصم %</TableHead>
                    <TableHead>المجموع</TableHead>
                    <TableHead>إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Popover 
                          open={productSearchOpen[item.id] || false} 
                          onOpenChange={(open) => 
                            setProductSearchOpen(prev => ({ ...prev, [item.id]: open }))
                          }
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={productSearchOpen[item.id] || false}
                              className="w-48 justify-between"
                            >
                              {item.product_id
                                ? products.find((product) => product.id === item.product_id)?.name
                                : "اختر المنتج..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48 p-0">
                            <Command>
                              <CommandInput placeholder="ابحث عن المنتج..." />
                              <CommandList>
                                <CommandEmpty>لا يوجد منتجات.</CommandEmpty>
                                <CommandGroup>
                                  {products.map((product) => (
                                    <CommandItem
                                      key={product.id}
                                      value={product.name}
                                      onSelect={() => {
                                        updateItem(item.id, 'product_id', product.id);
                                        setProductSearchOpen(prev => ({ ...prev, [item.id]: false }));
                                      }}
                                    >
                                      <Check
                                        className={`mr-2 h-4 w-4 ${
                                          item.product_id === product.id ? "opacity-100" : "opacity-0"
                                        }`}
                                      />
                                      {product.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.discount_percentage}
                          onChange={(e) => updateItem(item.id, 'discount_percentage', parseFloat(e.target.value) || 0)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>{item.total_price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ملاحظات وشروط</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  placeholder="ملاحظات إضافية..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="terms">الشروط والأحكام</Label>
                <Textarea
                  id="terms"
                  placeholder="الشروط والأحكام..."
                  value={termsAndConditions}
                  onChange={(e) => setTermsAndConditions(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ملخص العرض</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-semibold">{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>المجموع الإجمالي:</span>
                <span>{totalAmount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الإجراءات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => handleSave(false)} 
                className="w-full"
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                حفظ وجديد
              </Button>
              <Button 
                onClick={() => handleSave(true)} 
                variant="outline" 
                className="w-full"
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                حفظ وإغلاق
              </Button>
              <Button 
                onClick={handleSaveAndShowReport} 
                variant="outline" 
                className="w-full"
                disabled={isLoading}
              >
                <Receipt className="h-4 w-4 mr-2" />
                حفظ وعرض التقرير
              </Button>
              <Button 
                onClick={handleCloseQuotation} 
                variant="secondary" 
                className="w-full"
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-2" />
                إغلاق عرض السعر
              </Button>
              {savedQuotationId && (
                <Button 
                  onClick={() => navigate(`/quotations/report/${savedQuotationId}`)} 
                  variant="outline" 
                  className="w-full"
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  عرض التقرير
                </Button>
              )}
              <Button 
                onClick={() => window.history.back()} 
                variant="destructive" 
                className="w-full"
              >
                إلغاء التسجيل
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};