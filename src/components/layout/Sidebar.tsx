import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  Truck, 
  Warehouse, 
  CreditCard, 
  Wallet, 
  FileText, 
  Settings,
  Calculator,
  TrendingUp,
  Receipt,
  RotateCcw,
  PlusCircle,
  ListOrdered,
  ChevronDown,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  language: 'ar' | 'en';
  activeItem: string;
  onItemClick: (item: string) => void;
}

interface SubMenuItem {
  id: string;
  label: string;
  path: string;
  icon: any;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  path?: string;
  subItems?: SubMenuItem[];
}

const menuItems = {
  ar: [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, path: '/' },
    { id: 'products', label: 'إدارة الأصناف', icon: Package, path: '/products' },
    { 
      id: 'customers', 
      label: 'العملاء والموردين', 
      icon: Users,
      subItems: [
        { id: 'customers-manage', label: 'إدارة العملاء', path: '/customers', icon: Users },
        { id: 'customer-statement', label: 'كشف حساب عميل', path: '/customer-statement', icon: FileText }
      ]
    },
    { 
      id: 'sales', 
      label: 'المبيعات', 
      icon: ShoppingCart,
      subItems: [
        { id: 'quotations', label: 'إنشاء عرض سعر', path: '/quotations', icon: PlusCircle },
        { id: 'quotations-manage', label: 'إدارة عروض الأسعار', path: '/quotations/manage', icon: ListOrdered },
        { id: 'invoices-manage', label: 'إدارة الفواتير', path: '/invoices/manage', icon: ListOrdered },
        { id: 'cash-sales-invoice', label: 'فاتورة مبيعات نقدي', path: '/cash-sales-invoice', icon: Receipt },
        { id: 'credit-sales-invoice', label: 'فاتورة مبيعات آجلة', path: '/credit-sales-invoice', icon: Receipt },
        { id: 'credit-sales-invoices-management', label: 'إدارة فواتير المبيعات الآجلة', path: '/credit-sales-invoices-management', icon: ListOrdered },
        { id: 'due-invoices-report', label: 'تقرير الفواتير المستحقة', path: '/due-invoices-report', icon: FileText },
        { id: 'sales-return', label: 'مرتجع مبيعات', path: '/sales-return', icon: RotateCcw }
      ]
    },
    { 
      id: 'purchases', 
      label: 'المشتريات', 
      icon: Truck,
      subItems: [
        { id: 'purchase-orders', label: 'أمر التوريد', path: '/purchase-orders', icon: PlusCircle },
        { id: 'purchase-invoice', label: 'فاتورة مشتريات', path: '/purchase-invoice', icon: Receipt },
        { id: 'purchase-return', label: 'مرتجع مشتريات', path: '/purchase-return', icon: RotateCcw }
      ]
    },
    { 
      id: 'warehouses', 
      label: 'إدارة المخازن', 
      icon: Warehouse,
      subItems: [
        { id: 'warehouse-dashboard', label: 'لوحة تحكم المخازن', path: '/warehouse/dashboard', icon: LayoutDashboard },
        { id: 'products-stock-report', label: 'تقرير حركة الأصناف', path: '/warehouse/products-stock-report', icon: FileText },
        { id: 'finished-products-manage', label: 'إدارة مخزن المنتجات التامة', path: '/warehouse/finished-products/manage', icon: Package },
        { id: 'finished-products-in', label: 'إدخال منتجات تامة', path: '/warehouse/finished_products/incoming', icon: PlusCircle },
        { id: 'finished-products-out', label: 'صرف منتجات تامة', path: '/warehouse/finished_products/outgoing', icon: Receipt },
        { id: 'finished-products-card', label: 'بطاقة صنف - منتجات', path: '/warehouse/finished_products/item-card', icon: FileText },
        { id: 'raw-materials-in', label: 'إدخال مواد خام', path: '/warehouse/raw_materials/incoming', icon: PlusCircle },
        { id: 'raw-materials-out', label: 'صرف مواد خام', path: '/warehouse/raw_materials/outgoing', icon: Receipt },
        { id: 'raw-materials-card', label: 'بطاقة صنف - مواد خام', path: '/warehouse/raw_materials/item-card', icon: FileText },
        { id: 'equipment-in', label: 'إدخال معدات وقطع غيار', path: '/warehouse/equipment_spare_parts/incoming', icon: PlusCircle },
        { id: 'equipment-out', label: 'صرف معدات وقطع غيار', path: '/warehouse/equipment_spare_parts/outgoing', icon: Receipt },
        { id: 'equipment-card', label: 'بطاقة صنف - معدات', path: '/warehouse/equipment_spare_parts/item-card', icon: FileText }
      ]
    },
    { id: 'inventory', label: 'أوامر التوريد', icon: Truck, path: '/dispatch-orders' },
    { id: 'pos', label: 'نقطة البيع', icon: CreditCard },
    { 
      id: 'treasury', 
      label: 'إدارة الخزنة', 
      icon: Wallet,
      subItems: [
        { id: 'treasury-management', label: 'الإدارة المالية', path: '/treasury/management', icon: Wallet },
        { id: 'cash-disbursement', label: 'إذن صرف نقدية', path: '/treasury/cash-disbursement', icon: Receipt },
        { id: 'cash-receipt', label: 'إذن استلام نقدية', path: '/treasury/cash-receipt', icon: Receipt },
        { id: 'check-receipt', label: 'إذن استلام شيك', path: '/treasury/check-receipt', icon: Receipt },
        { id: 'check-disbursement', label: 'إذن صرف شيك', path: '/treasury/check-disbursement', icon: Receipt },
        { id: 'expenses-disbursement', label: 'إذن صرف مصروفات عمومية', path: '/treasury/expenses-disbursement', icon: Receipt },
        { id: 'custody-disbursement', label: 'إذن صرف عهدة من الخزنة', path: '/treasury/custody-disbursement', icon: Receipt },
        { id: 'custody-settlement', label: 'إذن تصفية عهدة ورد المبلغ المتبقي', path: '/treasury/custody-settlement', icon: Receipt },
        { id: 'cash-receipts-report', label: 'تقرير إذونات الاستلام النقدية', path: '/treasury/cash-receipts-report', icon: FileText },
        { id: 'cash-disbursements-report', label: 'تقرير إذونات الصرف النقدية', path: '/treasury/cash-disbursements-report', icon: FileText },
        { id: 'check-receipts-report', label: 'تقرير إذونات الاستلام بشيك', path: '/treasury/check-receipts-report', icon: FileText },
        { id: 'expenses-report', label: 'تقرير المصروفات', path: '/treasury/expenses-disbursements-report', icon: FileText },
        { id: 'custody-report', label: 'تقرير العهد', path: '/treasury/custody-disbursements-report', icon: FileText }
      ]
    },
    { id: 'reports', label: 'التقارير', icon: FileText },
    { id: 'analytics', label: 'الإحصائيات', icon: TrendingUp },
    { id: 'accounting', label: 'المحاسبة', icon: Calculator },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ],
  en: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'products', label: 'Products', icon: Package, path: '/products' },
    { 
      id: 'customers', 
      label: 'Customers & Suppliers', 
      icon: Users,
      subItems: [
        { id: 'customers-manage', label: 'Manage Customers', path: '/customers', icon: Users },
        { id: 'customer-statement', label: 'Customer Statement', path: '/customer-statement', icon: FileText }
      ]
    },
    { 
      id: 'sales', 
      label: 'Sales', 
      icon: ShoppingCart,
      subItems: [
        { id: 'quotations', label: 'Create Quotation', path: '/quotations', icon: PlusCircle },
        { id: 'quotations-manage', label: 'Manage Quotations', path: '/quotations/manage', icon: ListOrdered },
        { id: 'invoices-manage', label: 'Manage Invoices', path: '/invoices/manage', icon: ListOrdered },
        { id: 'cash-sales-invoice', label: 'Cash Sales Invoice', path: '/cash-sales-invoice', icon: Receipt },
        { id: 'credit-sales-invoice', label: 'Credit Sales Invoice', path: '/credit-sales-invoice', icon: Receipt },
        { id: 'sales-return', label: 'Sales Return', path: '/sales-return', icon: RotateCcw }
      ]
    },
    { 
      id: 'purchases', 
      label: 'Purchases', 
      icon: Truck,
      subItems: [
        { id: 'purchase-orders', label: 'Purchase Order', path: '/purchase-orders', icon: PlusCircle },
        { id: 'purchase-invoice', label: 'Purchase Invoice', path: '/purchase-invoice', icon: Receipt },
        { id: 'purchase-return', label: 'Purchase Return', path: '/purchase-return', icon: RotateCcw }
      ]
    },
    { 
      id: 'warehouses', 
      label: 'Warehouse Management', 
      icon: Warehouse,
      subItems: [
        { id: 'warehouse-dashboard', label: 'Warehouse Dashboard', path: '/warehouse/dashboard', icon: LayoutDashboard },
        { id: 'products-stock-report', label: 'Products Stock Report', path: '/warehouse/products-stock-report', icon: FileText },
        { id: 'finished-products-manage', label: 'Finished Products Management', path: '/warehouse/finished-products/manage', icon: Package },
        { id: 'finished-products-in', label: 'Finished Products In', path: '/warehouse/finished_products/incoming', icon: PlusCircle },
        { id: 'finished-products-out', label: 'Finished Products Out', path: '/warehouse/finished_products/outgoing', icon: Receipt },
        { id: 'finished-products-card', label: 'Item Card - Products', path: '/warehouse/finished_products/item-card', icon: FileText },
        { id: 'raw-materials-in', label: 'Raw Materials In', path: '/warehouse/raw_materials/incoming', icon: PlusCircle },
        { id: 'raw-materials-out', label: 'Raw Materials Out', path: '/warehouse/raw_materials/outgoing', icon: Receipt },
        { id: 'raw-materials-card', label: 'Item Card - Raw Materials', path: '/warehouse/raw_materials/item-card', icon: FileText },
        { id: 'equipment-in', label: 'Equipment In', path: '/warehouse/equipment_spare_parts/incoming', icon: PlusCircle },
        { id: 'equipment-out', label: 'Equipment Out', path: '/warehouse/equipment_spare_parts/outgoing', icon: Receipt },
        { id: 'equipment-card', label: 'Item Card - Equipment', path: '/warehouse/equipment_spare_parts/item-card', icon: FileText }
      ]
    },
    { id: 'inventory', label: 'Dispatch Orders', icon: Truck, path: '/dispatch-orders' },
    { id: 'pos', label: 'Point of Sale', icon: CreditCard },
    { 
      id: 'treasury', 
      label: 'Treasury', 
      icon: Wallet,
      subItems: [
        { id: 'treasury-management', label: 'Treasury Management', path: '/treasury/management', icon: Wallet },
        { id: 'cash-disbursement', label: 'Cash Disbursement', path: '/treasury/cash-disbursement', icon: Receipt },
        { id: 'cash-receipt', label: 'Cash Receipt', path: '/treasury/cash-receipt', icon: Receipt },
        { id: 'check-receipt', label: 'Check Receipt', path: '/treasury/check-receipt', icon: Receipt },
        { id: 'check-disbursement', label: 'Check Disbursement', path: '/treasury/check-disbursement', icon: Receipt },
        { id: 'expenses-disbursement', label: 'General Expenses', path: '/treasury/expenses-disbursement', icon: Receipt },
        { id: 'custody-disbursement', label: 'Custody Disbursement', path: '/treasury/custody-disbursement', icon: Receipt },
        { id: 'custody-settlement', label: 'Custody Settlement', path: '/treasury/custody-settlement', icon: Receipt },
        { id: 'cash-receipts-report', label: 'Cash Receipts Report', path: '/treasury/cash-receipts-report', icon: FileText },
        { id: 'cash-disbursements-report', label: 'Cash Disbursements Report', path: '/treasury/cash-disbursements-report', icon: FileText },
        { id: 'expenses-report', label: 'Expenses Report', path: '/treasury/expenses-disbursements-report', icon: FileText }
      ]
    },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'accounting', label: 'Accounting', icon: Calculator },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]
};

export function Sidebar({ language, activeItem, onItemClick }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(['sales', 'purchases', 'treasury']);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const items = menuItems[language];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActiveRoute = (path?: string, subItems?: SubMenuItem[]) => {
    if (path) return location.pathname === path;
    if (subItems) return subItems.some(sub => location.pathname === sub.path);
    return false;
  };

  const handleItemClick = (item: MenuItem, subItem?: SubMenuItem) => {
    if (subItem) {
      navigate(subItem.path);
      onItemClick(subItem.id);
    } else if (item.path) {
      navigate(item.path);
      onItemClick(item.id);
    } else if (item.subItems) {
      toggleExpanded(item.id);
    }
  };

  // Group items for separators
  const mainItems = items.slice(0, 3); // Dashboard, Products, Customers
  const operationItems = items.slice(3, 6); // Sales, Purchases, Inventory, POS
  const financialItems = items.slice(6, 7); // Treasury
  const systemItems = items.slice(7); // Reports, Analytics, Accounting, Settings

  const renderMenuItems = (menuGroup: MenuItem[]) => (
    <>
      {menuGroup.map((item) => {
        const Icon = item.icon;
        const isExpanded = expandedItems.includes(item.id);
        const hasSubItems = item.subItems && item.subItems.length > 0;
        const isActive = isActiveRoute(item.path, item.subItems);
        
        return (
          <div key={item.id}>
            <button
              onClick={() => handleItemClick(item)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                language === 'ar' && "flex-row-reverse",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="flex-1 text-right">{item.label}</span>}
              {!collapsed && hasSubItems && (
                <div className={cn(language === 'ar' && "order-first")}>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              )}
            </button>
            
            {hasSubItems && isExpanded && !collapsed && (
              <div className={cn(
                "mr-6 mt-1 space-y-1",
                language === 'en' && "ml-6 mr-0"
              )}>
                {item.subItems?.map((subItem) => {
                  const SubIcon = subItem.icon;
                  const isSubActive = location.pathname === subItem.path;
                  return (
                    <button
                      key={subItem.id}
                      onClick={() => handleItemClick(item, subItem)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                        language === 'ar' && "flex-row-reverse",
                        isSubActive
                          ? "bg-primary/90 text-primary-foreground font-medium shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      )}
                    >
                      <SubIcon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 text-right">{subItem.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </>
  );

  return (
    <div 
      className={cn(
        "bg-card border-border h-screen overflow-y-auto transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64",
        language === 'ar' ? "border-l" : "border-r"
      )}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="p-4 flex-1">
        {/* Header with collapse button */}
        <div className="flex items-center justify-between mb-6">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
                <Calculator className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground text-sm">
                  {language === 'ar' ? 'مصنع الأسلاك' : 'Wire Factory'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'نظام محاسبي' : 'Accounting System'}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            {collapsed ? (
              language === 'ar' ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />
            ) : (
              language === 'ar' ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        <nav className="space-y-2">
          {renderMenuItems(mainItems)}
          <Separator className="my-3" />
          {renderMenuItems(operationItems)}
          <Separator className="my-3" />
          {renderMenuItems(financialItems)}
          <Separator className="my-3" />
          {renderMenuItems(systemItems)}
        </nav>
      </div>

      {/* Footer */}
      {!collapsed && (
        <>
          <Separator />
          <div className="p-4 text-center">
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'تطوير: استوديو إي' : 'Developed by E-Studio'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {language === 'ar' ? 'النسخة التجريبية' : 'Trial Version'}
            </p>
          </div>
        </>
      )}
    </div>
  );
}