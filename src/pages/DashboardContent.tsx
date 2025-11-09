import { KPICard } from "@/components/dashboard/KPICard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { 
  DollarSign, 
  ShoppingCart, 
  AlertTriangle,
  FileText,
  Users,
  Package,
  Truck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardContent() {
  const language = 'ar';

  const handleQuickAction = (action: string) => {
    console.log(`Quick action: ${action}`);
  };

  const kpiData = {
    ar: [
      {
        title: 'إجمالي المبيعات اليوم',
        value: '45,250 ر.س',
        change: '+12.5% من أمس',
        changeType: 'positive' as const,
        icon: DollarSign,
        gradient: 'primary' as const
      },
      {
        title: 'إجمالي المشتريات',
        value: '28,100 ر.س',
        change: '+8.2% من أمس',
        changeType: 'positive' as const,
        icon: ShoppingCart,
        gradient: 'success' as const
      },
      {
        title: 'عدد الفواتير اليوم',
        value: '127',
        change: '+15 فاتورة',
        changeType: 'positive' as const,
        icon: FileText
      },
      {
        title: 'العملاء الجدد',
        value: '8',
        change: 'هذا الأسبوع',
        changeType: 'neutral' as const,
        icon: Users
      }
    ]
  };

  const treasuryData = {
    ar: [
      { 
        currency: 'جنيه مصري', 
        amount: '85,750', 
        code: 'EGP',
        icon: '💷',
        gradient: 'success' as const
      },
      { 
        currency: 'ريال سعودي', 
        amount: '125,450', 
        code: 'SAR',
        icon: '💰',
        gradient: 'primary' as const
      },
      { 
        currency: 'دولار أمريكي', 
        amount: '12,500', 
        code: 'USD',
        icon: '💵',
        gradient: 'warning' as const
      }
    ]
  };

  const lowStockItems = {
    ar: [
      { name: 'كابل كهربائي 2.5 مم', stock: 5, minStock: 20 },
      { name: 'سلك نحاسي 4 مم', stock: 8, minStock: 25 },
      { name: 'موصل كهربائي', stock: 12, minStock: 50 }
    ]
  };

  return (
    <main className="p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData[language].map((kpi, index) => (
          <KPICard
            key={index}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            changeType={kpi.changeType}
            icon={kpi.icon}
            gradient={kpi.gradient}
            language={language}
          />
        ))}
      </div>

      {/* Treasury Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {treasuryData[language].map((treasury, index) => (
          <Card key={index} className={cn(
            "accounting-card overflow-hidden",
            treasury.gradient === 'primary' && "primary-gradient text-primary-foreground",
            treasury.gradient === 'success' && "success-gradient text-success-foreground",
            treasury.gradient === 'warning' && "bg-warning text-warning-foreground"
          )}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-row-reverse">
                <div className="flex-1 text-right">
                  <p className="text-sm font-medium opacity-90">
                    {treasury.currency}
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {treasury.amount}
                  </p>
                  <p className="text-sm mt-1 opacity-75">
                    {treasury.code}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg flex items-center justify-center text-2xl bg-white/20">
                  {treasury.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <Card className="accounting-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold flex-row-reverse text-right">
              <AlertTriangle className="h-5 w-5 text-warning" />
              تنبيهات المخزون
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStockItems[language].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted rounded-lg flex-row-reverse"
              >
                <div className="text-right">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    الحد الأدنى: {item.minStock}
                  </p>
                </div>
                <Badge variant="destructive">
                  {item.stock}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <QuickActions 
          language={language}
          onActionClick={handleQuickAction}
        />
      </div>

      {/* Product Management Quick Access */}
      <Card className="accounting-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold flex-row-reverse text-right">
            <Package className="h-5 w-5 text-primary" />
            إدارة الأصناف والمنتجات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <button
            onClick={() => window.location.href = '/products'}
            className="w-full p-3 text-left bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors group"
          >
            <div className="flex items-center justify-between flex-row-reverse text-right">
              <div>
                <p className="font-medium text-primary">إدارة الأصناف</p>
                <p className="text-sm text-muted-foreground">
                  إضافة وتعديل وحذف الأصناف والإعدادات
                </p>
              </div>
              <div className="text-primary group-hover:translate-x-1 transition-transform">
                →
              </div>
            </div>
          </button>
        </CardContent>
      </Card>

      {/* Inventory Management Quick Access */}
      <Card className="accounting-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold flex-row-reverse text-right">
            <Truck className="h-5 w-5 text-primary" />
            إدارة المخزون
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/purchase-orders'}
              className="w-full p-3 text-left bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors group"
            >
              <div className="flex items-center justify-between flex-row-reverse text-right">
                <div>
                  <p className="font-medium text-primary">إضافة أمر التوريد</p>
                  <p className="text-sm text-muted-foreground">
                    إنشاء أوامر توريد جديدة للمخزن
                  </p>
                </div>
                <div className="text-primary group-hover:translate-x-1 transition-transform">
                  →
                </div>
              </div>
            </button>
            
            <button
              onClick={() => window.location.href = '/purchase-invoice'}
              className="w-full p-3 text-left bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors group"
            >
              <div className="flex items-center justify-between flex-row-reverse text-right">
                <div>
                  <p className="font-medium text-primary">فاتورة مشتريات</p>
                  <p className="text-sm text-muted-foreground">
                    إنشاء فاتورة مشتريات جديدة
                  </p>
                </div>
                <div className="text-primary group-hover:translate-x-1 transition-transform">
                  →
                </div>
              </div>
            </button>
            
            <button
              onClick={() => window.location.href = '/dispatch-orders'}
              className="w-full p-3 text-left bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors group"
            >
              <div className="flex items-center justify-between flex-row-reverse text-right">
                <div>
                  <p className="font-medium text-primary">إضافة أمر المنصرف</p>
                  <p className="text-sm text-muted-foreground">
                    إنشاء أوامر منصرف من المخزن
                  </p>
                </div>
                <div className="text-primary group-hover:translate-x-1 transition-transform">
                  →
                </div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Sales Management Quick Access */}
      <Card className="accounting-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold flex-row-reverse text-right">
            <FileText className="h-5 w-5 text-primary" />
            إدارة المبيعات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/quotations'}
              className="w-full p-3 text-left bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors group"
            >
              <div className="flex items-center justify-between flex-row-reverse text-right">
                <div>
                  <p className="font-medium text-primary">إنشاء عرض سعر</p>
                  <p className="text-sm text-muted-foreground">
                    إنشاء عروض أسعار جديدة للعملاء
                  </p>
                </div>
                <div className="text-primary group-hover:translate-x-1 transition-transform">
                  →
                </div>
              </div>
            </button>
            
            <button
              onClick={() => window.location.href = '/quotations/manage'}
              className="w-full p-3 text-left bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors group"
            >
              <div className="flex items-center justify-between flex-row-reverse text-right">
                <div>
                  <p className="font-medium text-primary">إدارة عروض الأسعار</p>
                  <p className="text-sm text-muted-foreground">
                    عرض وإدارة عروض الأسعار المسجلة
                  </p>
                </div>
                <div className="text-primary group-hover:translate-x-1 transition-transform">
                  →
                </div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Sales Chart */}
      <SalesChart language={language} />
    </main>
  );
}
