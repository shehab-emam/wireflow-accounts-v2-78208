import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { KPICard } from "@/components/dashboard/KPICard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { SalesChart } from "@/components/dashboard/SalesChart";
import ProductsDropdownMenu from "@/components/products/ProductsDropdownMenu";
import Customers from "@/pages/Customers";
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Package, 
  AlertTriangle,
  Wallet,
  FileText,
  Lock,
  Truck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const { user } = useAuth();

  const handleLanguageChange = (lang: 'ar' | 'en') => {
    setLanguage(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.className = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleMenuItemClick = (item: string) => {
    setActiveMenuItem(item);
  };

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
    ],
    en: [
      {
        title: 'Today Sales Total',
        value: '45,250 SAR',
        change: '+12.5% from yesterday',
        changeType: 'positive' as const,
        icon: DollarSign,
        gradient: 'primary' as const
      },
      {
        title: 'Total Purchases',
        value: '28,100 SAR',
        change: '+8.2% from yesterday',
        changeType: 'positive' as const,
        icon: ShoppingCart,
        gradient: 'success' as const
      },
      {
        title: 'Invoices Today',
        value: '127',
        change: '+15 invoices',
        changeType: 'positive' as const,
        icon: FileText
      },
      {
        title: 'New Customers',
        value: '8',
        change: 'This week',
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
    ],
    en: [
      { 
        currency: 'Egyptian Pound', 
        amount: '85,750', 
        code: 'EGP',
        icon: '💷',
        gradient: 'success' as const
      },
      { 
        currency: 'Saudi Riyal', 
        amount: '125,450', 
        code: 'SAR',
        icon: '💰',
        gradient: 'primary' as const
      },
      { 
        currency: 'US Dollar', 
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
    ],
    en: [
      { name: 'Electric Cable 2.5mm', stock: 5, minStock: 20 },
      { name: 'Copper Wire 4mm', stock: 8, minStock: 25 },
      { name: 'Electric Connector', stock: 12, minStock: 50 }
    ]
  };

  return (
    <div className={cn(
      "min-h-screen bg-background flex",
      language === 'ar' && "rtl"
    )}>
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 z-50 flex-shrink-0",
        language === 'ar' ? "right-0" : "left-0"
      )}>
        <Sidebar 
          language={language} 
          activeItem={activeMenuItem}
          onItemClick={handleMenuItemClick}
        />
      </div>

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col",
        language === 'ar' ? "mr-64" : "ml-64"
      )}>
        <Header 
          language={language}
          onLanguageChange={handleLanguageChange}
          isDarkMode={isDarkMode}
          onThemeToggle={handleThemeToggle}
        />

        <main className="flex-1 p-6 space-y-6">
          {/* Conditional Content Based on Active Menu Item */}
          {activeMenuItem === 'products' ? (
            <ProductsDropdownMenu />
          ) : activeMenuItem === 'customers' ? (
            <Customers />
          ) : activeMenuItem === 'purchase-orders' ? (
            <div>
              <button
                onClick={() => window.location.href = '/purchase-orders'}
                className="w-full p-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                أوامر التوريد للمخزن
              </button>
            </div>
          ) : (
            <>
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

              {/* Treasury Widgets - Separate for each currency */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {treasuryData[language].map((treasury, index) => (
                  <Card key={index} className={cn(
                    "accounting-card overflow-hidden",
                    treasury.gradient === 'primary' && "primary-gradient text-primary-foreground",
                    treasury.gradient === 'success' && "success-gradient text-success-foreground",
                    treasury.gradient === 'warning' && "bg-warning text-warning-foreground"
                  )}>
                    <CardContent className="p-6">
                      <div className={cn(
                        "flex items-center justify-between",
                        language === 'ar' && "flex-row-reverse"
                      )}>
                        <div className={cn(
                          "flex-1",
                          language === 'ar' && "text-right"
                        )}>
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
                    <CardTitle className={cn(
                      "flex items-center gap-2 text-lg font-semibold",
                      language === 'ar' && "flex-row-reverse text-right"
                    )}>
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      {language === 'ar' ? 'تنبيهات المخزون' : 'Stock Alerts'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {lowStockItems[language].map((item, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center justify-between p-3 bg-muted rounded-lg",
                          language === 'ar' && "flex-row-reverse"
                        )}
                      >
                        <div className={cn(language === 'ar' && "text-right")}>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {language === 'ar' ? 
                              `الحد الأدنى: ${item.minStock}` : 
                              `Min: ${item.minStock}`
                            }
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
                <CardTitle className={cn(
                  "flex items-center gap-2 text-lg font-semibold",
                  language === 'ar' && "flex-row-reverse text-right"
                )}>
                  <Package className="h-5 w-5 text-primary" />
                  {language === 'ar' ? 'إدارة الأصناف والمنتجات' : 'Product Management'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <button
                    onClick={() => window.location.href = '/products'}
                    className="w-full p-3 text-left bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors group"
                  >
                    <div className={cn(
                      "flex items-center justify-between",
                      language === 'ar' && "flex-row-reverse text-right"
                    )}>
                      <div>
                        <p className="font-medium text-primary">
                          {language === 'ar' ? 'إدارة الأصناف' : 'Manage Products'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar' ? 
                            'إضافة وتعديل وحذف الأصناف والإعدادات' : 
                            'Add, edit, delete products and settings'
                          }
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

            {/* Inventory Management Quick Access */}
            <Card className="accounting-card">
              <CardHeader>
                <CardTitle className={cn(
                  "flex items-center gap-2 text-lg font-semibold",
                  language === 'ar' && "flex-row-reverse text-right"
                )}>
                  <Truck className="h-5 w-5 text-primary" />
                  {language === 'ar' ? 'إدارة المخزون' : 'Inventory Management'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <button
                    onClick={() => window.location.href = '/purchase-orders'}
                    className="w-full p-3 text-left bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors group"
                  >
                    <div className={cn(
                      "flex items-center justify-between",
                      language === 'ar' && "flex-row-reverse text-right"
                    )}>
                      <div>
                        <p className="font-medium text-primary">
                          {language === 'ar' ? 'إضافة أمر التوريد' : 'Add Purchase Order'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar' ? 
                            'إنشاء أوامر توريد جديدة للمخزن' : 
                            'Create new purchase orders for inventory'
                          }
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
                    <div className={cn(
                      "flex items-center justify-between",
                      language === 'ar' && "flex-row-reverse text-right"
                    )}>
                      <div>
                        <p className="font-medium text-primary">
                          {language === 'ar' ? 'فاتورة مشتريات' : 'Purchase Invoice'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar' ? 
                            'إنشاء فاتورة مشتريات جديدة' : 
                            'Create new purchase invoice'
                          }
                        </p>
                      </div>
                      <div className="text-primary group-hover:translate-x-1 transition-transform">
                        →
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => window.location.href = '/purchase-return'}
                    className="w-full p-3 text-left bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors group"
                  >
                    <div className={cn(
                      "flex items-center justify-between",
                      language === 'ar' && "flex-row-reverse text-right"
                    )}>
                      <div>
                        <p className="font-medium text-primary">
                          {language === 'ar' ? 'مرتجع مشتريات' : 'Purchase Return'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar' ? 
                            'إنشاء مرتجع مشتريات جديد' : 
                            'Create new purchase return'
                          }
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
                    <div className={cn(
                      "flex items-center justify-between",
                      language === 'ar' && "flex-row-reverse text-right"
                    )}>
                      <div>
                        <p className="font-medium text-primary">
                          {language === 'ar' ? 'إضافة أمر المنصرف' : 'Add Dispatch Order'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar' ? 
                            'إنشاء أوامر منصرف من المخزن' : 
                            'Create new dispatch orders from inventory'
                          }
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
                <CardTitle className={cn(
                  "flex items-center gap-2 text-lg font-semibold",
                  language === 'ar' && "flex-row-reverse text-right"
                )}>
                  <FileText className="h-5 w-5 text-primary" />
                  {language === 'ar' ? 'إدارة المبيعات' : 'Sales Management'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <button
                    onClick={() => window.location.href = '/quotations'}
                    className="w-full p-3 text-left bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors group"
                  >
                    <div className={cn(
                      "flex items-center justify-between",
                      language === 'ar' && "flex-row-reverse text-right"
                    )}>
                      <div>
                        <p className="font-medium text-primary">
                          {language === 'ar' ? 'إنشاء عرض سعر' : 'Create Quotation'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar' ? 
                            'إنشاء عروض أسعار جديدة للعملاء' : 
                            'Create new price quotations for customers'
                          }
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
                    <div className={cn(
                      "flex items-center justify-between",
                      language === 'ar' && "flex-row-reverse text-right"
                    )}>
                      <div>
                        <p className="font-medium text-primary">
                          {language === 'ar' ? 'إدارة عروض الأسعار' : 'Manage Quotations'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar' ? 
                            'عرض وإدارة عروض الأسعار المسجلة' : 
                            'View and manage registered quotations'
                          }
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              </div>

              {/* Sales Chart */}
              <SalesChart language={language} />
            </>
          )}

          {/* Login Access Card - Only shown when not authenticated */}
          {!user && (
            <Card className="accounting-card border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className={cn(
                  "flex items-center gap-2 text-lg font-semibold text-primary",
                  language === 'ar' && "flex-row-reverse text-right"
                )}>
                  <Lock className="h-5 w-5" />
                  {language === 'ar' ? 'الوصول إلى نظام إدارة المنتجات' : 'Access Product Management System'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className={cn(
                    "text-muted-foreground",
                    language === 'ar' && "text-right"
                  )}>
                    {language === 'ar' ? 
                      'للوصول إلى البيانات الحساسة للمنتجات والأسعار، يرجى تسجيل الدخول:' :
                      'To access sensitive product and pricing data, please log in:'
                    }
                  </p>
                  
                  <div className={cn(
                    "bg-muted/50 p-4 rounded-lg space-y-2 text-sm",
                    language === 'ar' && "text-right"
                  )}>
                    <p className="font-medium text-foreground">
                      {language === 'ar' ? 'بيانات تجريبية للدخول:' : 'Demo Login Credentials:'}
                    </p>
                    <div className="space-y-1 text-muted-foreground">
                      <p>{language === 'ar' ? 'البريد الإلكتروني:' : 'Email:'} demo@example.com</p>
                      <p>{language === 'ar' ? 'كلمة المرور:' : 'Password:'} 123456</p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => window.location.href = '/auth'}
                    className="w-full"
                    size="lg"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <footer className={cn(
            "text-center py-4 text-sm text-muted-foreground border-t border-border",
            language === 'ar' && "text-right"
          )}>
            <p>
              {language === 'ar' ? 
                '© 2024 استوديو إي - نظام المحاسبة المتكامل - النسخة التجريبية' :
                '© 2024 E-Studio - Integrated Accounting System - Trial Version'
              }
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}