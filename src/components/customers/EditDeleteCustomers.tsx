import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Edit, Trash2, RefreshCw, FileText, FileSpreadsheet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AddCustomerForm from './AddCustomerForm';

interface Customer {
  id: string;
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
  created_at: string;
  customer_types?: { name: string };
  countries?: { name: string };
  provinces?: { name: string };
}

const EditDeleteCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const filtered = customers.filter(customer =>
      customer.business_owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customer_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.institution_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customer_types?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          customer_types:customer_type_id(name),
          countries:country_id(name),
          provinces:province_id(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل بيانات العملاء",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف العميل بنجاح",
      });

      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حذف العميل",
        variant: "destructive",
      });
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const handleCustomerUpdated = () => {
    fetchCustomers();
    setSelectedCustomer(null);
  };

  const exportToPDF = () => {
    toast({
      title: "قريباً",
      description: "ميزة التصدير إلى PDF ستتوفر قريباً",
    });
  };

  const exportToExcel = () => {
    toast({
      title: "قريباً",
      description: "ميزة التصدير إلى Excel ستتوفر قريباً",
    });
  };

  if (selectedCustomer) {
    return (
      <div className="space-y-6">
        <AddCustomerForm
          onCustomerAdded={handleCustomerUpdated}
          initialData={selectedCustomer}
          isEdit={true}
          customerId={selectedCustomer.id}
        />
        <div className="flex justify-end">
          <Button onClick={() => setSelectedCustomer(null)} variant="outline">
            العودة للقائمة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex gap-2">
              <Button onClick={fetchCustomers} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 ml-2" />
                تحديث البيانات
              </Button>
              <Button onClick={exportToPDF} variant="outline" size="sm">
                <FileText className="h-4 w-4 ml-2" />
                تصدير PDF
              </Button>
              <Button onClick={exportToExcel} variant="outline" size="sm">
                <FileSpreadsheet className="h-4 w-4 ml-2" />
                تصدير Excel
              </Button>
            </div>
            
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="البحث في العملاء..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-4 pr-10 w-64 text-right"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">قائمة العملاء والموردين</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">جاري تحميل البيانات...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">كود العميل</TableHead>
                    <TableHead className="text-right">نوع العميل</TableHead>
                    <TableHead className="text-right">اسم صاحب النشاط</TableHead>
                    <TableHead className="text-right">اسم المؤسسة</TableHead>
                    <TableHead className="text-right">البلد</TableHead>
                    <TableHead className="text-right">المحافظة</TableHead>
                    <TableHead className="text-right">رقم الواتس</TableHead>
                    <TableHead className="text-right">رقم الهاتف</TableHead>
                    <TableHead className="text-right">الرصيد الافتتاحي</TableHead>
                    <TableHead className="text-right">الحد المالي</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="text-right font-medium">
                        {customer.customer_code}
                      </TableCell>
                      <TableCell className="text-right">
                        {customer.customer_types?.name || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {customer.business_owner_name}
                      </TableCell>
                      <TableCell className="text-right">
                        {customer.institution_name || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {customer.countries?.name || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {customer.provinces?.name || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {customer.whatsapp_number || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {customer.phone_number || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {customer.opening_balance || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        {customer.credit_limit || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            onClick={() => handleEditCustomer(customer)}
                            size="sm"
                            variant="outline"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-right">
                                  تأكيد الحذف
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-right">
                                  هل أنت متأكد من حذف العميل "{customer.business_owner_name}"؟
                                  هذا الإجراء لا يمكن التراجع عنه.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteCustomer(customer.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8">
                        لا توجد عملاء مطابقين للبحث
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EditDeleteCustomers;