import { ReactNode, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();

  // Determine active menu item based on current path
  const getActiveMenuItem = () => {
    const path = location.pathname;
    if (path === '/') return 'dashboard';
    if (path === '/products') return 'products';
    if (path === '/customers') return 'customers';
    if (path.startsWith('/quotations')) return 'quotations';
    if (path.startsWith('/invoices')) return 'invoices-manage';
    if (path === '/cash-sales-invoice') return 'cash-sales-invoice';
    if (path === '/credit-sales-invoice') return 'credit-sales-invoice';
    if (path === '/purchase-orders') return 'purchase-orders';
    if (path === '/purchase-invoice') return 'purchase-invoice';
    if (path === '/purchase-return') return 'purchase-return';
    if (path === '/dispatch-orders') return 'inventory';
    if (path.startsWith('/treasury/')) {
      if (path.includes('cash-disbursement')) return 'cash-disbursement';
      if (path.includes('cash-receipt')) return 'cash-receipt';
      if (path.includes('check-receipt')) return 'check-receipt';
      if (path.includes('check-disbursement')) return 'check-disbursement';
      if (path.includes('expenses-disbursement')) return 'expenses-disbursement';
      if (path.includes('custody-disbursement')) return 'custody-disbursement';
      if (path.includes('custody-settlement')) return 'custody-settlement';
    }
    return 'dashboard';
  };

  const handleLanguageChange = (lang: 'ar' | 'en') => {
    setLanguage(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.className = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={cn(
      "min-h-screen bg-background flex",
      language === 'ar' && "rtl"
    )}>
      {/* Fixed Sidebar */}
      <div className={cn(
        "fixed inset-y-0 z-50 flex-shrink-0",
        language === 'ar' ? "right-0" : "left-0"
      )}>
        <Sidebar 
          language={language} 
          activeItem={getActiveMenuItem()}
          onItemClick={() => {}}
        />
      </div>

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        language === 'ar' ? "mr-64" : "ml-64"
      )}>
        {/* Fixed Header */}
        <div className="sticky top-0 z-40">
          <Header 
            language={language}
            onLanguageChange={handleLanguageChange}
            isDarkMode={isDarkMode}
            onThemeToggle={handleThemeToggle}
          />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
