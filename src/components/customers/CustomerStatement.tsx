import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileText, Printer, Download, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Customer {
  id: string;
  customer_code: string;
  business_owner_name: string;
  institution_name: string | null;
  phone: string | null;
  address: string | null;
  opening_balance: number;
  credit_limit: number;
}

interface Transaction {
  id: string;
  date: string;
  type: 'invoice_cash' | 'invoice_credit' | 'payment_cash' | 'payment_check';
  reference_number: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export const CustomerStatement = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('business_owner_name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('خطأ في تحميل العملاء');
    }
  };

  const handleCustomerChange = async (customerId: string) => {
    setSelectedCustomerId(customerId);
    const customer = customers.find(c => c.id === customerId);
    setSelectedCustomer(customer || null);
  };

  const fetchCustomerStatement = async () => {
    if (!selectedCustomerId) {
      toast.error('الرجاء اختيار العميل');
      return;
    }

    setIsLoading(true);
    try {
      const transactionsList: Transaction[] = [];
      let runningBalance = selectedCustomer?.opening_balance || 0;

      // Fetch cash sales invoices
      const { data: cashInvoices, error: cashError } = await supabase
        .from('cash_sales_invoices')
        .select('*')
        .eq('customer_id', selectedCustomerId)
        .order('invoice_date');

      if (cashError) throw cashError;

      // Fetch credit sales invoices
      const { data: creditInvoices, error: creditError } = await supabase
        .from('credit_sales_invoices')
        .select('*')
        .eq('customer_id', selectedCustomerId)
        .order('invoice_date');

      if (creditError) throw creditError;

      // Fetch cash receipts
      const { data: cashReceipts, error: receiptError } = await supabase
        .from('cash_receipts')
        .select('*')
        .eq('customer_id', selectedCustomerId)
        .order('date');

      if (receiptError) throw receiptError;

      // Fetch check receipts
      const { data: checkReceipts, error: checkError } = await supabase
        .from('check_receipts')
        .select('*')
        .order('date');

      if (checkError) throw checkError;

      // Process cash invoices
      cashInvoices?.forEach(invoice => {
        runningBalance += invoice.total_amount || 0;
        transactionsList.push({
          id: invoice.id,
          date: invoice.invoice_date,
          type: 'invoice_cash',
          reference_number: invoice.invoice_number,
          description: 'فاتورة مبيعات نقدي',
          debit: invoice.total_amount || 0,
          credit: 0,
          balance: runningBalance
        });
      });

      // Process credit invoices
      creditInvoices?.forEach(invoice => {
        runningBalance += invoice.total_amount || 0;
        transactionsList.push({
          id: invoice.id,
          date: invoice.invoice_date,
          type: 'invoice_credit',
          reference_number: invoice.invoice_number,
          description: 'فاتورة مبيعات آجلة',
          debit: invoice.total_amount || 0,
          credit: 0,
          balance: runningBalance
        });
      });

      // Process cash receipts
      cashReceipts?.forEach(receipt => {
        runningBalance -= receipt.amount || 0;
        transactionsList.push({
          id: receipt.id,
          date: receipt.date,
          type: 'payment_cash',
          reference_number: receipt.voucher_number,
          description: `إيصال قبض نقدي - ${receipt.purpose || ''}`,
          debit: 0,
          credit: receipt.amount || 0,
          balance: runningBalance
        });
      });

      // Process check receipts
      checkReceipts?.forEach(receipt => {
        runningBalance -= receipt.amount || 0;
        transactionsList.push({
          id: receipt.id,
          date: receipt.date,
          type: 'payment_check',
          reference_number: receipt.voucher_number,
          description: `إيصال قبض شيك - ${receipt.purpose || ''}`,
          debit: 0,
          credit: receipt.amount || 0,
          balance: runningBalance
        });
      });

      // Sort by date
      transactionsList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Recalculate balances with opening balance
      let balance = selectedCustomer?.opening_balance || 0;
      transactionsList.forEach(transaction => {
        balance += transaction.debit - transaction.credit;
        transaction.balance = balance;
      });

      // Apply date filters if provided
      let filteredTransactions = transactionsList;
      if (dateFrom) {
        filteredTransactions = filteredTransactions.filter(t => t.date >= dateFrom);
      }
      if (dateTo) {
        filteredTransactions = filteredTransactions.filter(t => t.date <= dateTo);
      }

      setTransactions(filteredTransactions);
    } catch (error) {
      console.error('Error fetching statement:', error);
      toast.error('خطأ في تحميل كشف الحساب');
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalDebit = () => {
    return transactions.reduce((sum, t) => sum + t.debit, 0);
  };

  const getTotalCredit = () => {
    return transactions.reduce((sum, t) => sum + t.credit, 0);
  };

  const getCurrentBalance = () => {
    return (selectedCustomer?.opening_balance || 0) + getTotalDebit() - getTotalCredit();
  };

  const getTypeLabel = (type: string) => {
    const typeMap = {
      invoice_cash: 'فاتورة نقدي',
      invoice_credit: 'فاتورة آجلة',
      payment_cash: 'دفعة نقدية',
      payment_check: 'دفعة شيك'
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const getTypeBadge = (type: string) => {
    const variantMap = {
      invoice_cash: 'default',
      invoice_credit: 'secondary',
      payment_cash: 'default',
      payment_check: 'secondary'
    };
    return (
      <Badge variant={variantMap[type as keyof typeof variantMap] as any}>
        {getTypeLabel(type)}
      </Badge>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">كشف حساب العميل</h1>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            طباعة
          </Button>
          <Button onClick={() => toast.info('قريباً')} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            تصدير PDF
          </Button>
        </div>
      </div>

      {/* Customer Selection */}
      <Card>
        <CardHeader>
          <CardTitle>اختيار العميل</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="customer">العميل *</Label>
              <Select value={selectedCustomerId} onValueChange={handleCustomerChange}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر العميل" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.business_owner_name} - {customer.customer_code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dateFrom">من تاريخ</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">إلى تاريخ</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchCustomerStatement} disabled={isLoading} className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                {isLoading ? 'جاري التحميل...' : 'عرض الكشف'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      {selectedCustomer && (
        <Card>
          <CardHeader>
            <CardTitle>بيانات العميل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-muted-foreground">كود العميل</Label>
                <p className="font-semibold">{selectedCustomer.customer_code}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">اسم صاحب العمل</Label>
                <p className="font-semibold">{selectedCustomer.business_owner_name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">اسم المؤسسة</Label>
                <p className="font-semibold">{selectedCustomer.institution_name || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">رقم الهاتف</Label>
                <p className="font-semibold">{selectedCustomer.phone || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">العنوان</Label>
                <p className="font-semibold">{selectedCustomer.address || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">الرصيد الافتتاحي</Label>
                <p className="font-semibold text-lg">{selectedCustomer.opening_balance.toFixed(2)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">حد الائتمان</Label>
                <p className="font-semibold text-lg">{selectedCustomer.credit_limit.toFixed(2)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">الرصيد الحالي</Label>
                <p className={`font-bold text-xl ${getCurrentBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {getCurrentBalance().toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions Table */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>حركات الحساب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">رقم المرجع</TableHead>
                    <TableHead className="text-right">البيان</TableHead>
                    <TableHead className="text-right">مدين</TableHead>
                    <TableHead className="text-right">دائن</TableHead>
                    <TableHead className="text-right">الرصيد</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Opening Balance Row */}
                  <TableRow className="bg-muted/50">
                    <TableCell colSpan={4} className="font-bold text-right">
                      الرصيد الافتتاحي
                    </TableCell>
                    <TableCell className="font-bold">-</TableCell>
                    <TableCell className="font-bold">-</TableCell>
                    <TableCell className="font-bold text-lg">
                      {selectedCustomer?.opening_balance.toFixed(2)}
                    </TableCell>
                  </TableRow>

                  {/* Transaction Rows */}
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(transaction.type)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.reference_number}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className="font-semibold text-red-600">
                        {transaction.debit > 0 ? transaction.debit.toFixed(2) : '-'}
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {transaction.credit > 0 ? transaction.credit.toFixed(2) : '-'}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {transaction.balance.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Totals Row */}
                  <TableRow className="bg-muted font-bold">
                    <TableCell colSpan={4} className="text-right">
                      الإجمالي
                    </TableCell>
                    <TableCell className="text-red-600 text-lg">
                      {getTotalDebit().toFixed(2)}
                    </TableCell>
                    <TableCell className="text-green-600 text-lg">
                      {getTotalCredit().toFixed(2)}
                    </TableCell>
                    <TableCell className={`text-lg ${getCurrentBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {getCurrentBalance().toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <Separator className="my-6" />

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">الرصيد الافتتاحي</p>
                    <p className="text-2xl font-bold mt-2">
                      {selectedCustomer?.opening_balance.toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
                    <p className="text-2xl font-bold text-red-600 mt-2">
                      {getTotalDebit().toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">إجمالي المدفوعات</p>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                      {getTotalCredit().toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">الرصيد الحالي</p>
                    <p className={`text-2xl font-bold mt-2 ${getCurrentBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {getCurrentBalance().toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {transactions.length === 0 && selectedCustomer && !isLoading && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد حركات لهذا العميل</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};