import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, TrendingUp, TrendingDown, BarChart3, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface WarehouseStats {
  id: string;
  name: string;
  type: string;
  opening: number;
  incoming: number;
  outgoing: number;
  balance: number;
}

export default function WarehouseDashboard() {
  const navigate = useNavigate();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState<WarehouseStats[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [dateFrom, dateTo]);

  const fetchDashboardData = async () => {
    try {
      const { data: warehouses, error: whError } = await supabase
        .from('warehouses')
        .select('*, warehouse_types(*)');

      if (whError) throw whError;

      const warehouseStats: WarehouseStats[] = [];

      for (const warehouse of warehouses || []) {
        // Get stock balance
        const { data: stockData } = await supabase
          .from('warehouse_stock')
          .select('quantity')
          .eq('warehouse_id', warehouse.id);

        const currentBalance = stockData?.reduce((sum, item) => sum + item.quantity, 0) || 0;

        // Get transactions in date range
        let query = supabase
          .from('warehouse_transactions')
          .select('*, warehouse_transaction_items(quantity)')
          .eq('warehouse_id', warehouse.id);

        if (dateFrom) {
          query = query.gte('transaction_date', dateFrom);
        }
        if (dateTo) {
          query = query.lte('transaction_date', dateTo);
        }

        const { data: transactions } = await query;

        let incoming = 0;
        let outgoing = 0;

        transactions?.forEach((trans: any) => {
          const total = trans.warehouse_transaction_items.reduce((sum: number, item: any) => sum + item.quantity, 0);
          if (trans.transaction_type === 'incoming') {
            incoming += total;
          } else {
            outgoing += total;
          }
        });

        const opening = currentBalance - incoming + outgoing;

        warehouseStats.push({
          id: warehouse.id,
          name: warehouse.name,
          type: warehouse.warehouse_types?.name_ar || 'غير محدد',
          opening,
          incoming,
          outgoing,
          balance: currentBalance
        });
      }

      setStats(warehouseStats);
    } catch (error: any) {
      toast.error('خطأ في تحميل البيانات: ' + error.message);
    }
  };

  const navigateToWarehouse = (warehouseType: string, action: string) => {
    navigate(`/warehouse/${warehouseType}/${action}`);
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <Card className="accounting-card">
        <CardHeader className="primary-gradient">
          <CardTitle className="text-white text-2xl flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            لوحة تحكم المخازن
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Date Filter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>من تاريخ</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label>إلى تاريخ</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {/* Quick Access Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { key: 'finished_products', name: 'مخزن المنتجات تامة الصنع', color: 'bg-blue-500' },
              { key: 'raw_materials', name: 'مخزن المواد الخام', color: 'bg-green-500' },
              { key: 'equipment_spare_parts', name: 'مخزن المعدات وقطع الغيار', color: 'bg-purple-500' }
            ].map((warehouse) => (
              <Card key={warehouse.key} className={`${warehouse.color} text-white hover:opacity-90 transition-opacity cursor-pointer`}>
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold mb-3">{warehouse.name}</h3>
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-white/20 hover:bg-white/30 text-white"
                      onClick={() => navigateToWarehouse(warehouse.key, 'incoming')}
                    >
                      إدخال <ArrowRight className="mr-2 h-4 w-4" />
                    </Button>
                    <Button 
                      className="w-full bg-white/20 hover:bg-white/30 text-white"
                      onClick={() => navigateToWarehouse(warehouse.key, 'outgoing')}
                    >
                      صرف <ArrowRight className="mr-2 h-4 w-4" />
                    </Button>
                    <Button 
                      className="w-full bg-white/20 hover:bg-white/30 text-white"
                      onClick={() => navigateToWarehouse(warehouse.key, 'item-card')}
                    >
                      بطاقة صنف <ArrowRight className="mr-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Warehouse Statistics */}
          <div className="grid grid-cols-1 gap-6">
            {stats.map((warehouse) => (
              <Card key={warehouse.id} className="accounting-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    {warehouse.name}
                    <span className="text-sm text-muted-foreground mr-2">({warehouse.type})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">رصيد افتتاحي</div>
                      <div className="text-2xl font-bold text-primary">{warehouse.opening}</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        إجمالي الوارد
                      </div>
                      <div className="text-2xl font-bold text-success">{warehouse.incoming}</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <TrendingDown className="h-4 w-4" />
                        إجمالي الصادر
                      </div>
                      <div className="text-2xl font-bold text-destructive">{warehouse.outgoing}</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">الرصيد الحالي</div>
                      <div className="text-2xl font-bold text-accent">{warehouse.balance}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}