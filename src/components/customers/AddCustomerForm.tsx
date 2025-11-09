import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CustomerFormData {
  customer_code: string;
  customer_type_id: string;
  business_owner_name: string;
  institution_name: string;
  address: string;
  location_link: string;
  country_id: string;
  province_id: string;
  whatsapp_number: string;
  phone_number: string;
  opening_balance: number;
  credit_limit: number;
}

interface CustomerType {
  id: string;
  name: string;
}

interface Country {
  id: string;
  name: string;
}

interface Province {
  id: string;
  name: string;
  country_id: string;
}

interface AddCustomerFormProps {
  onCustomerAdded?: () => void;
  initialData?: Partial<CustomerFormData>;
  isEdit?: boolean;
  customerId?: string;
}

const AddCustomerForm: React.FC<AddCustomerFormProps> = ({
  onCustomerAdded,
  initialData,
  isEdit = false,
  customerId
}) => {
  const [customerTypes, setCustomerTypes] = useState<CustomerType[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [filteredProvinces, setFilteredProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormEnabled, setIsFormEnabled] = useState(false);
  const { toast } = useToast();

  const form = useForm<CustomerFormData>({
    defaultValues: {
      customer_code: '',
      customer_type_id: '',
      business_owner_name: '',
      institution_name: '',
      address: '',
      location_link: '',
      country_id: '',
      province_id: '',
      whatsapp_number: '',
      phone_number: '',
      opening_balance: 0,
      credit_limit: 0,
      ...initialData
    }
  });

  const selectedCountryId = form.watch('country_id');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (isEdit && initialData) {
      setIsFormEnabled(true);
      form.reset(initialData);
    }
  }, [isEdit, initialData]);

  useEffect(() => {
    if (selectedCountryId) {
      const filtered = provinces.filter(province => province.country_id === selectedCountryId);
      setFilteredProvinces(filtered);
      if (!filtered.find(p => p.id === form.getValues('province_id'))) {
        form.setValue('province_id', '');
      }
    } else {
      setFilteredProvinces([]);
    }
  }, [selectedCountryId, provinces]);

  const fetchData = async () => {
    try {
      const [typesResult, countriesResult, provincesResult] = await Promise.all([
        supabase.from('customer_types').select('*').order('name'),
        supabase.from('countries').select('*').order('name'),
        supabase.from('provinces').select('*').order('name')
      ]);

      if (typesResult.data) setCustomerTypes(typesResult.data);
      if (countriesResult.data) setCountries(countriesResult.data);
      if (provincesResult.data) setProvinces(provincesResult.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل البيانات",
        variant: "destructive",
      });
    }
  };

  const generateCustomerCode = async () => {
    try {
      const { data, error } = await supabase.rpc('generate_customer_code');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating customer code:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في إنشاء كود العميل",
        variant: "destructive",
      });
      return null;
    }
  };

  const onSubmit = async (data: CustomerFormData) => {
    if (!isFormEnabled) return;

    setLoading(true);
    try {
      let customerCode = data.customer_code;
      if (!isEdit) {
        customerCode = await generateCustomerCode();
        if (!customerCode) {
          setLoading(false);
          return;
        }
      }

      const customerData = {
        ...data,
        customer_code: customerCode,
        opening_balance: Number(data.opening_balance),
        credit_limit: Number(data.credit_limit)
      };

      if (isEdit && customerId) {
        const { error } = await supabase
          .from('customers')
          .update(customerData)
          .eq('id', customerId);

        if (error) throw error;

        toast({
          title: "تم التحديث",
          description: "تم تحديث بيانات العميل بنجاح",
        });
      } else {
        const { error } = await supabase
          .from('customers')
          .insert([customerData]);

        if (error) throw error;

        toast({
          title: "تم الحفظ",
          description: "تم حفظ بيانات العميل بنجاح",
        });
      }

      if (onCustomerAdded) {
        onCustomerAdded();
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حفظ البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndNew = async () => {
    if (!isFormEnabled) return;
    
    const formData = form.getValues();
    await onSubmit(formData);
    handleNewForm();
  };

  const handleNewForm = async () => {
    form.reset({
      customer_code: '',
      customer_type_id: '',
      business_owner_name: '',
      institution_name: '',
      address: '',
      location_link: '',
      country_id: '',
      province_id: '',
      whatsapp_number: '',
      phone_number: '',
      opening_balance: 0,
      credit_limit: 0
    });
    setIsFormEnabled(true);
    
    const newCode = await generateCustomerCode();
    if (newCode) {
      form.setValue('customer_code', newCode);
    }
  };

  const handleClearData = () => {
    form.reset({
      customer_code: form.getValues('customer_code'),
      customer_type_id: '',
      business_owner_name: '',
      institution_name: '',
      address: '',
      location_link: '',
      country_id: '',
      province_id: '',
      whatsapp_number: '',
      phone_number: '',
      opening_balance: 0,
      credit_limit: 0
    });
  };

  const handleCloseRegistration = () => {
    setIsFormEnabled(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-right">
          {isEdit ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="customer_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right">كود العميل</FormLabel>
                    <FormControl>
                      <Input {...field} disabled className="text-right" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_type_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right">نوع العميل</FormLabel>
                    <Select
                      disabled={!isFormEnabled}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="text-right">
                          <SelectValue placeholder="اختر نوع العميل" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customerTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="business_owner_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right">اسم صاحب النشاط</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isFormEnabled}
                        className="text-right"
                        placeholder="اسم صاحب النشاط"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="institution_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right">اسم المؤسسة أو المحل</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isFormEnabled}
                        className="text-right"
                        placeholder="اسم المؤسسة أو المحل"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right">البلد</FormLabel>
                    <Select
                      disabled={!isFormEnabled}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="text-right">
                          <SelectValue placeholder="اختر البلد" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.id} value={country.id}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="province_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right">المحافظة</FormLabel>
                    <Select
                      disabled={!isFormEnabled || !selectedCountryId}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="text-right">
                          <SelectValue placeholder="اختر المحافظة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredProvinces.map((province) => (
                          <SelectItem key={province.id} value={province.id}>
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsapp_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right">رقم الواتس</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isFormEnabled}
                        className="text-right"
                        placeholder="رقم الواتس"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right">رقم الهاتف</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isFormEnabled}
                        className="text-right"
                        placeholder="رقم الهاتف"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="opening_balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right">الرصيد الافتتاحي</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        disabled={!isFormEnabled}
                        className="text-right"
                        placeholder="0.00"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="credit_limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right">الحد المالي المسموح</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        disabled={!isFormEnabled}
                        className="text-right"
                        placeholder="0.00"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location_link"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-right">رابط الموقع (جوجل ماب)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isFormEnabled}
                        className="text-right"
                        placeholder="رابط جوجل ماب"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-3">
                    <FormLabel className="text-right">العنوان</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={!isFormEnabled}
                        className="text-right"
                        placeholder="العنوان التفصيلي"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2 justify-end mt-6">
              {!isEdit && (
                <Button
                  type="button"
                  onClick={handleNewForm}
                  disabled={isFormEnabled}
                  variant="outline"
                >
                  جديد
                </Button>
              )}
              
              <Button
                type="submit"
                disabled={!isFormEnabled || loading}
              >
                {loading ? 'جاري الحفظ...' : 'حفظ'}
              </Button>

              {!isEdit && (
                <Button
                  type="button"
                  onClick={handleSaveAndNew}
                  disabled={!isFormEnabled || loading}
                  variant="secondary"
                >
                  حفظ وجديد
                </Button>
              )}

              <Button
                type="button"
                onClick={handleClearData}
                disabled={!isFormEnabled}
                variant="outline"
              >
                مسح البيانات
              </Button>

              <Button
                type="button"
                onClick={handleCloseRegistration}
                disabled={!isFormEnabled}
                variant="destructive"
              >
                إغلاق التسجيل
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddCustomerForm;