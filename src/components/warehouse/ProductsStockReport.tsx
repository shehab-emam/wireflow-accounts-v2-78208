import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Printer, RefreshCw } from "lucide-react";

interface ProductStock {
  id: string;
  product_code: string;
  name: string;
  opening_balance: number;
  total_incoming: number;
  total_outgoing: number;
  current_stock: number;
  reorder_level: number;
}

const ProductsStockReport: React.FC = () => {
  const [products, setProducts] = useState<ProductStock[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProductsStock = async () => {
    setLoading(true);
    try {
      // Fetch all products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, product_code, name, opening_balance, reorder_level')
        .order('product_code');

      if (productsError) throw productsError;

      // Fetch all warehouse transactions with their items
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('warehouse_transactions')
        .select('id, transaction_type');

      if (transactionsError) throw transactionsError;

      // Fetch all transaction items
      const { data: itemsData, error: itemsError } = await supabase
        .from('warehouse_transaction_items')
        .select('transaction_id, product_id, quantity');

      if (itemsError) throw itemsError;

      // Calculate stock for each product
      const stockData: ProductStock[] = (productsData || []).map(product => {
        // Filter items for this product
        const productItems = itemsData?.filter(item => item.product_id === product.id) || [];
        
        let totalIncoming = 0;
        let totalOutgoing = 0;

        productItems.forEach(item => {
          const transaction = transactionsData?.find(t => t.id === item.transaction_id);
          if (transaction) {
            if (transaction.transaction_type === 'incoming') {
              totalIncoming += item.quantity;
            } else if (transaction.transaction_type === 'outgoing') {
              totalOutgoing += item.quantity;
            }
          }
        });
        
        const currentStock = product.opening_balance + totalIncoming - totalOutgoing;

        return {
          id: product.id,
          product_code: product.product_code,
          name: product.name,
          opening_balance: product.opening_balance,
          total_incoming: totalIncoming,
          total_outgoing: totalOutgoing,
          current_stock: currentStock,
          reorder_level: product.reorder_level || 0,
        };
      });

      setProducts(stockData);
      toast({
        title: "تم تحديث البيانات بنجاح",
        description: `تم تحميل ${stockData.length} صنف`,
      });
    } catch (error) {
      console.error('Error fetching products stock:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات الأصناف",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsStock();
  }, []);

  const handlePrint = () => {
    const printContent = document.getElementById('print-report');
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const currentDate = new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>تقرير حركة الأصناف</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 40px;
              background: white;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #333;
              padding-bottom: 20px;
            }
            .header h1 {
              font-size: 28px;
              color: #333;
              margin-bottom: 10px;
            }
            .header .date {
              font-size: 14px;
              color: #666;
              margin-top: 8px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: center;
            }
            th {
              background-color: #f8f9fa;
              font-weight: bold;
              color: #333;
              font-size: 14px;
            }
            td {
              font-size: 13px;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .alert {
              color: #dc3545;
              font-weight: bold;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 2px solid #eee;
              padding-top: 15px;
            }
            @media print {
              body {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>تقرير حركة الأصناف</h1>
            <div class="date">تاريخ الطباعة: ${currentDate}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>كود المنتج</th>
                <th>اسم المنتج</th>
                <th>رصيد أول المدة</th>
                <th>إجمالي الوارد</th>
                <th>إجمالي المنصرف</th>
                <th>إجمالي الرصيد</th>
                <th>حد الطلب</th>
              </tr>
            </thead>
            <tbody>
              ${products.map(product => `
                <tr>
                  <td>${product.product_code}</td>
                  <td>${product.name}</td>
                  <td>${product.opening_balance}</td>
                  <td>${product.total_incoming}</td>
                  <td>${product.total_outgoing}</td>
                  <td class="${product.current_stock <= product.reorder_level ? 'alert' : ''}">${product.current_stock}</td>
                  <td>${product.reorder_level}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>مصنع الأسلاك - نظام محاسبي</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handlePrintLowStock = () => {
    const lowStockProducts = products.filter(p => p.current_stock <= p.reorder_level);
    
    if (lowStockProducts.length === 0) {
      toast({
        title: "لا توجد نواقص",
        description: "جميع الأصناف فوق حد الطلب",
      });
      return;
    }

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const currentDate = new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>تقرير النواقص</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 40px;
              background: white;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #dc3545;
              padding-bottom: 20px;
            }
            .header h1 {
              font-size: 28px;
              color: #dc3545;
              margin-bottom: 10px;
            }
            .header .date {
              font-size: 14px;
              color: #666;
              margin-top: 8px;
            }
            .summary {
              background-color: #fff3cd;
              border: 2px solid #ffc107;
              padding: 15px;
              margin-bottom: 20px;
              border-radius: 8px;
              text-align: center;
            }
            .summary h2 {
              font-size: 18px;
              color: #856404;
              margin-bottom: 5px;
            }
            .summary p {
              font-size: 16px;
              color: #856404;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: center;
            }
            th {
              background-color: #f8d7da;
              font-weight: bold;
              color: #721c24;
              font-size: 14px;
            }
            td {
              font-size: 13px;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .alert {
              color: #dc3545;
              font-weight: bold;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 2px solid #eee;
              padding-top: 15px;
            }
            @media print {
              body {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>تقرير النواقص</h1>
            <div class="date">تاريخ الطباعة: ${currentDate}</div>
          </div>
          <div class="summary">
            <h2>إجمالي الأصناف الناقصة</h2>
            <p>${lowStockProducts.length} صنف</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>كود المنتج</th>
                <th>اسم المنتج</th>
                <th>رصيد أول المدة</th>
                <th>إجمالي الوارد</th>
                <th>إجمالي المنصرف</th>
                <th>إجمالي الرصيد</th>
                <th>حد الطلب</th>
                <th>النقص</th>
              </tr>
            </thead>
            <tbody>
              ${lowStockProducts.map(product => `
                <tr>
                  <td>${product.product_code}</td>
                  <td>${product.name}</td>
                  <td>${product.opening_balance}</td>
                  <td>${product.total_incoming}</td>
                  <td>${product.total_outgoing}</td>
                  <td class="alert">${product.current_stock}</td>
                  <td>${product.reorder_level}</td>
                  <td class="alert">${product.reorder_level - product.current_stock}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>مصنع الأسلاك - نظام محاسبي</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">تقرير حركة الأصناف</CardTitle>
          <div className="flex gap-2">
            <Button onClick={fetchProductsStock} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
              تحديث البيانات
            </Button>
            <Button onClick={handlePrint} disabled={loading}>
              <Printer className="h-4 w-4 ml-2" />
              طباعة التقرير
            </Button>
            <Button onClick={handlePrintLowStock} disabled={loading} variant="destructive">
              <Printer className="h-4 w-4 ml-2" />
              طباعة النواقص
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div id="print-report">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">كود المنتج</TableHead>
                <TableHead className="text-right">اسم المنتج</TableHead>
                <TableHead className="text-right">رصيد أول المدة</TableHead>
                <TableHead className="text-right">إجمالي الوارد</TableHead>
                <TableHead className="text-right">إجمالي المنصرف</TableHead>
                <TableHead className="text-right">إجمالي الرصيد</TableHead>
                <TableHead className="text-right">حد الطلب</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    لا توجد أصناف
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.product_code}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.opening_balance}</TableCell>
                    <TableCell>{product.total_incoming}</TableCell>
                    <TableCell>{product.total_outgoing}</TableCell>
                    <TableCell 
                      className={product.current_stock <= product.reorder_level ? 'text-destructive font-bold' : ''}
                    >
                      {product.current_stock}
                    </TableCell>
                    <TableCell>{product.reorder_level}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductsStockReport;
