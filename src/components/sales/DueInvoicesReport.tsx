import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Printer, FileText, FileSpreadsheet, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface DueInvoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  customer_id: string;
  customer_name: string;
  customer_code: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  days_overdue: number;
}

export default function DueInvoicesReport() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<DueInvoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<DueInvoice[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    customer_id: 'all',
    from_date: '',
    to_date: '',
    min_amount: '',
    status: 'all' // all, overdue, current
  });

  useEffect(() => {
    fetchCustomers();
    fetchDueInvoices();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, invoices]);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('business_owner_name');

      if (error) throw error;
      if (data) setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('خطأ في تحميل العملاء');
    }
  };

  const fetchDueInvoices = async () => {
    setIsLoading(true);
    try {
      const { data: invoicesData, error } = await supabase
        .from('credit_sales_invoices')
        .select(`
          *,
          customer:customers(business_owner_name, customer_code)
        `)
        .gt('remaining_amount', 0)
        .order('invoice_date', { ascending: false });

      if (error) throw error;

      if (invoicesData) {
        const formattedInvoices: DueInvoice[] = invoicesData.map((inv: any) => {
          const invoiceDate = new Date(inv.invoice_date);
          const today = new Date();
          const diffTime = today.getTime() - invoiceDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          return {
            id: inv.id,
            invoice_number: inv.invoice_number,
            invoice_date: inv.invoice_date,
            customer_id: inv.customer_id,
            customer_name: inv.customer?.business_owner_name || '',
            customer_code: inv.customer?.customer_code || '',
            total_amount: inv.total_amount || 0,
            paid_amount: inv.paid_amount || 0,
            remaining_amount: inv.remaining_amount || 0,
            days_overdue: diffDays
          };
        });

        setInvoices(formattedInvoices);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('خطأ في تحميل الفواتير');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...invoices];

    // Filter by customer
    if (filters.customer_id && filters.customer_id !== 'all') {
      filtered = filtered.filter(inv => inv.customer_id === filters.customer_id);
    }

    // Filter by date range
    if (filters.from_date) {
      filtered = filtered.filter(inv => inv.invoice_date >= filters.from_date);
    }
    if (filters.to_date) {
      filtered = filtered.filter(inv => inv.invoice_date <= filters.to_date);
    }

    // Filter by minimum amount
    if (filters.min_amount) {
      const minAmount = parseFloat(filters.min_amount);
      filtered = filtered.filter(inv => inv.remaining_amount >= minAmount);
    }

    // Filter by status
    if (filters.status === 'overdue') {
      filtered = filtered.filter(inv => inv.days_overdue > 30);
    } else if (filters.status === 'current') {
      filtered = filtered.filter(inv => inv.days_overdue <= 30);
    }

    setFilteredInvoices(filtered);
  };

  const handleReset = () => {
    setFilters({
      customer_id: 'all',
      from_date: '',
      to_date: '',
      min_amount: '',
      status: 'all'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const getTotalDue = () => {
    return filteredInvoices.reduce((sum, inv) => sum + inv.remaining_amount, 0);
  };

  const getStatusBadge = (daysOverdue: number) => {
    if (daysOverdue > 30) {
      return <Badge variant="destructive">متأخر ({daysOverdue} يوم)</Badge>;
    } else if (daysOverdue > 15) {
      return <Badge variant="default" className="bg-yellow-500">قريب الاستحقاق ({daysOverdue} يوم)</Badge>;
    } else {
      return <Badge variant="default" className="bg-green-500">جاري ({daysOverdue} يوم)</Badge>;
    }
  };

  const handleViewInvoice = (invoiceId: string) => {
    navigate(`/credit-sales-invoice-report/${invoiceId}`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Add Arabic font support
    doc.text('Due Invoices Report - تقرير الفواتير المستحقة', 14, 15);
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 14, 22);
    doc.text(`Total Invoices: ${filteredInvoices.length}`, 14, 28);
    doc.text(`Total Due Amount: ${getTotalDue().toFixed(2)} EGP`, 14, 34);

    const tableData = filteredInvoices.map(inv => [
      inv.invoice_number,
      new Date(inv.invoice_date).toLocaleDateString('en-GB'),
      inv.customer_name,
      `${inv.total_amount.toFixed(2)} EGP`,
      `${inv.paid_amount.toFixed(2)} EGP`,
      `${inv.remaining_amount.toFixed(2)} EGP`,
      `${inv.days_overdue} days`
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Invoice #', 'Date', 'Customer', 'Total', 'Paid', 'Due', 'Overdue']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });

    doc.save(`due-invoices-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('تم تصدير التقرير إلى PDF');
  };

  const handleExportExcel = () => {
    const excelData = filteredInvoices.map(inv => ({
      'Invoice Number': inv.invoice_number,
      'Date': new Date(inv.invoice_date).toLocaleDateString('en-GB'),
      'Customer Code': inv.customer_code,
      'Customer Name': inv.customer_name,
      'Total Amount (EGP)': inv.total_amount.toFixed(2),
      'Paid Amount (EGP)': inv.paid_amount.toFixed(2),
      'Remaining Amount (EGP)': inv.remaining_amount.toFixed(2),
      'Days Overdue': inv.days_overdue
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Due Invoices');
    
    XLSX.writeFile(wb, `due-invoices-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('تم تصدير التقرير إلى Excel');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-3xl font-bold">تقرير الفواتير المستحقة</h1>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            طباعة
          </Button>
          <Button onClick={handleExportPDF} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            تصدير PDF
          </Button>
          <Button onClick={handleExportExcel} variant="outline">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            تصدير Excel
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>الفلاتر</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="customer">العميل</Label>
              <Select
                value={filters.customer_id}
                onValueChange={(value) => setFilters({ ...filters, customer_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="جميع العملاء" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع العملاء</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.customer_code} - {customer.business_owner_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="from_date">من تاريخ</Label>
              <Input
                type="date"
                value={filters.from_date}
                onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="to_date">إلى تاريخ</Label>
              <Input
                type="date"
                value={filters.to_date}
                onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="min_amount">الحد الأدنى للمبلغ</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={filters.min_amount}
                onChange={(e) => setFilters({ ...filters, min_amount: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="status">الحالة</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="current">جاري (أقل من 30 يوم)</SelectItem>
                  <SelectItem value="overdue">متأخر (أكثر من 30 يوم)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={handleReset} className="w-full">
                إعادة تعيين
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-muted-foreground">عدد الفواتير</p>
              <p className="text-2xl font-bold">{filteredInvoices.length}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">إجمالي المبالغ المستحقة</p>
              <p className="text-2xl font-bold text-destructive">{getTotalDue().toFixed(2)} EGP</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">متوسط المبلغ المستحق</p>
              <p className="text-2xl font-bold">
                {filteredInvoices.length > 0 
                  ? `${(getTotalDue() / filteredInvoices.length).toFixed(2)} EGP`
                  : '0.00 EGP'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>الفواتير المستحقة</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري تحميل البيانات...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد فواتير مستحقة
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">رقم الفاتورة</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">العميل</TableHead>
                    <TableHead className="text-right">المبلغ الكلي</TableHead>
                    <TableHead className="text-right">المدفوع</TableHead>
                    <TableHead className="text-right">المتبقي</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right print:hidden">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell>
                        {new Date(invoice.invoice_date).toLocaleDateString('ar-EG')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{invoice.customer_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {invoice.customer_code}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{invoice.total_amount.toFixed(2)} EGP</TableCell>
                      <TableCell>{invoice.paid_amount.toFixed(2)} EGP</TableCell>
                      <TableCell className="font-bold text-destructive">
                        {invoice.remaining_amount.toFixed(2)} EGP
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.days_overdue)}</TableCell>
                      <TableCell className="print:hidden">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewInvoice(invoice.id)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}