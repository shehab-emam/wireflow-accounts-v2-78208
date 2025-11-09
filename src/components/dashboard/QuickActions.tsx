import { 
  FileText, 
  ShoppingCart, 
  Truck, 
  CreditCard, 
  Wallet,
  Calculator
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  language: 'ar' | 'en';
  onActionClick: (action: string) => void;
}

const quickActions = {
  ar: [
    { id: 'quote', label: 'عرض سعر', icon: FileText, color: 'primary' },
    { id: 'sale', label: 'فاتورة بيع', icon: ShoppingCart, color: 'success' },
    { id: 'purchase', label: 'فاتورة شراء', icon: Truck, color: 'warning' },
    { id: 'receipt', label: 'سند قبض', icon: Wallet, color: 'primary' },
    { id: 'payment', label: 'سند صرف', icon: CreditCard, color: 'destructive' },
    { id: 'voucher', label: 'قيد محاسبي', icon: Calculator, color: 'secondary' },
  ],
  en: [
    { id: 'quote', label: 'Quote', icon: FileText, color: 'primary' },
    { id: 'sale', label: 'Sales Invoice', icon: ShoppingCart, color: 'success' },
    { id: 'purchase', label: 'Purchase Invoice', icon: Truck, color: 'warning' },
    { id: 'receipt', label: 'Receipt Voucher', icon: Wallet, color: 'primary' },
    { id: 'payment', label: 'Payment Voucher', icon: CreditCard, color: 'destructive' },
    { id: 'voucher', label: 'Journal Entry', icon: Calculator, color: 'secondary' },
  ]
};

export function QuickActions({ language, onActionClick }: QuickActionsProps) {
  const actions = quickActions[language];

  return (
    <Card className="accounting-card">
      <CardHeader>
        <CardTitle className={cn(
          "text-lg font-semibold",
          language === 'ar' && "text-right"
        )}>
          {language === 'ar' ? 'الإجراءات السريعة' : 'Quick Actions'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                onClick={() => onActionClick(action.id)}
                className={cn(
                  "h-20 flex flex-col gap-2 hover:scale-105 transition-transform",
                  language === 'ar' && "text-right"
                )}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}