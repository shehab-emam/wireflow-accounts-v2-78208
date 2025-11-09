import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface CustomerCode {
  id: string;
  current_code: number;
  prefix: string;
}

const CustomerSettings: React.FC = () => {
  const [customerTypes, setCustomerTypes] = useState<CustomerType[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [customerCodes, setCustomerCodes] = useState<CustomerCode[]>([]);
  
  const [newTypeName, setNewTypeName] = useState('');
  const [newCountryName, setNewCountryName] = useState('');
  const [newProvinceName, setNewProvinceName] = useState('');
  const [selectedCountryForProvince, setSelectedCountryForProvince] = useState('');
  const [newCodePrefix, setNewCodePrefix] = useState('');
  const [newCodeNumber, setNewCodeNumber] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [typesResult, countriesResult, provincesResult, codesResult] = await Promise.all([
        supabase.from('customer_types').select('*').order('name'),
        supabase.from('countries').select('*').order('name'),
        supabase.from('provinces').select('*, countries(name)').order('name'),
        supabase.from('customer_codes').select('*').order('created_at')
      ]);

      if (typesResult.data) setCustomerTypes(typesResult.data);
      if (countriesResult.data) setCountries(countriesResult.data);
      if (provincesResult.data) setProvinces(provincesResult.data);
      if (codesResult.data) setCustomerCodes(codesResult.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل البيانات",
        variant: "destructive",
      });
    }
  };

  // Customer Types Functions
  const addCustomerType = async () => {
    if (!newTypeName.trim()) return;

    try {
      const { error } = await supabase
        .from('customer_types')
        .insert([{ name: newTypeName.trim() }]);

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم إضافة نوع العميل بنجاح",
      });

      setNewTypeName('');
      fetchAllData();
    } catch (error) {
      console.error('Error adding customer type:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في إضافة نوع العميل",
        variant: "destructive",
      });
    }
  };

  const deleteCustomerType = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customer_types')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف نوع العميل بنجاح",
      });

      fetchAllData();
    } catch (error) {
      console.error('Error deleting customer type:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حذف نوع العميل",
        variant: "destructive",
      });
    }
  };

  // Countries Functions
  const addCountry = async () => {
    if (!newCountryName.trim()) return;

    try {
      const { error } = await supabase
        .from('countries')
        .insert([{ name: newCountryName.trim() }]);

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم إضافة البلد بنجاح",
      });

      setNewCountryName('');
      fetchAllData();
    } catch (error) {
      console.error('Error adding country:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في إضافة البلد",
        variant: "destructive",
      });
    }
  };

  const deleteCountry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('countries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف البلد بنجاح",
      });

      fetchAllData();
    } catch (error) {
      console.error('Error deleting country:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حذف البلد",
        variant: "destructive",
      });
    }
  };

  // Provinces Functions
  const addProvince = async () => {
    if (!newProvinceName.trim() || !selectedCountryForProvince) return;

    try {
      const { error } = await supabase
        .from('provinces')
        .insert([{ 
          name: newProvinceName.trim(),
          country_id: selectedCountryForProvince
        }]);

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم إضافة المحافظة بنجاح",
      });

      setNewProvinceName('');
      setSelectedCountryForProvince('');
      fetchAllData();
    } catch (error) {
      console.error('Error adding province:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في إضافة المحافظة",
        variant: "destructive",
      });
    }
  };

  const deleteProvince = async (id: string) => {
    try {
      const { error } = await supabase
        .from('provinces')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف المحافظة بنجاح",
      });

      fetchAllData();
    } catch (error) {
      console.error('Error deleting province:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حذف المحافظة",
        variant: "destructive",
      });
    }
  };

  // Customer Codes Functions
  const addCustomerCode = async () => {
    if (!newCodePrefix.trim() || !newCodeNumber) return;

    try {
      const { error } = await supabase
        .from('customer_codes')
        .insert([{ 
          prefix: newCodePrefix.trim(),
          current_code: parseInt(newCodeNumber)
        }]);

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم إضافة رقم كود العميل بنجاح",
      });

      setNewCodePrefix('');
      setNewCodeNumber('');
      fetchAllData();
    } catch (error) {
      console.error('Error adding customer code:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في إضافة رقم كود العميل",
        variant: "destructive",
      });
    }
  };

  const deleteCustomerCode = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customer_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف رقم كود العميل بنجاح",
      });

      fetchAllData();
    } catch (error) {
      console.error('Error deleting customer code:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حذف رقم كود العميل",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Customer Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">أنواع العملاء</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={addCustomerType} size="sm">
              <Plus className="h-4 w-4 ml-2" />
              إضافة
            </Button>
            <Input
              placeholder="اسم نوع العميل"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              className="text-right"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="text-right">{type.name}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-right">تأكيد الحذف</AlertDialogTitle>
                          <AlertDialogDescription className="text-right">
                            هل أنت متأكد من حذف "{type.name}"؟
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteCustomerType(type.id)}>
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Countries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">البلدان</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={addCountry} size="sm">
              <Plus className="h-4 w-4 ml-2" />
              إضافة
            </Button>
            <Input
              placeholder="اسم البلد"
              value={newCountryName}
              onChange={(e) => setNewCountryName(e.target.value)}
              className="text-right"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {countries.map((country) => (
                <TableRow key={country.id}>
                  <TableCell className="text-right">{country.name}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-right">تأكيد الحذف</AlertDialogTitle>
                          <AlertDialogDescription className="text-right">
                            هل أنت متأكد من حذف "{country.name}"؟
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteCountry(country.id)}>
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Provinces */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">المحافظات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={addProvince} size="sm">
              <Plus className="h-4 w-4 ml-2" />
              إضافة
            </Button>
            <Input
              placeholder="اسم المحافظة"
              value={newProvinceName}
              onChange={(e) => setNewProvinceName(e.target.value)}
              className="text-right"
            />
            <Select value={selectedCountryForProvince} onValueChange={setSelectedCountryForProvince}>
              <SelectTrigger className="text-right">
                <SelectValue placeholder="اختر البلد" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">البلد</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {provinces.map((province) => (
                <TableRow key={province.id}>
                  <TableCell className="text-right">{province.name}</TableCell>
                  <TableCell className="text-right">
                    {countries.find(c => c.id === province.country_id)?.name || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-right">تأكيد الحذف</AlertDialogTitle>
                          <AlertDialogDescription className="text-right">
                            هل أنت متأكد من حذف "{province.name}"؟
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteProvince(province.id)}>
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Customer Codes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">أرقام أكواد العملاء</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={addCustomerCode} size="sm">
              <Plus className="h-4 w-4 ml-2" />
              إضافة
            </Button>
            <Input
              placeholder="البادئة (مثل: C)"
              value={newCodePrefix}
              onChange={(e) => setNewCodePrefix(e.target.value)}
              className="text-right"
            />
            <Input
              type="number"
              placeholder="الرقم الحالي"
              value={newCodeNumber}
              onChange={(e) => setNewCodeNumber(e.target.value)}
              className="text-right"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">البادئة</TableHead>
                <TableHead className="text-right">الرقم الحالي</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerCodes.map((code) => (
                <TableRow key={code.id}>
                  <TableCell className="text-right">{code.prefix}</TableCell>
                  <TableCell className="text-right">{code.current_code}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-right">تأكيد الحذف</AlertDialogTitle>
                          <AlertDialogDescription className="text-right">
                            هل أنت متأكد من حذف كود "{code.prefix}{code.current_code}"؟
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteCustomerCode(code.id)}>
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerSettings;