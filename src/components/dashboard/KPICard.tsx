import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  gradient?: 'primary' | 'success' | 'warning' | 'default';
  language: 'ar' | 'en';
}

export function KPICard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon, 
  gradient = 'default',
  language 
}: KPICardProps) {
  return (
    <Card className={cn(
      "accounting-card overflow-hidden",
      gradient === 'primary' && "primary-gradient text-primary-foreground",
      gradient === 'success' && "success-gradient text-success-foreground",
      gradient === 'warning' && "bg-warning text-warning-foreground"
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
            <p className={cn(
              "text-sm font-medium opacity-90",
              gradient === 'default' && "text-muted-foreground"
            )}>
              {title}
            </p>
            <p className="text-2xl font-bold mt-1">
              {value}
            </p>
            {change && (
              <p className={cn(
                "text-sm mt-1 flex items-center gap-1",
                language === 'ar' && "flex-row-reverse",
                changeType === 'positive' && "text-success",
                changeType === 'negative' && "text-destructive",
                changeType === 'neutral' && (gradient === 'default' ? "text-muted-foreground" : "opacity-90")
              )}>
                {change}
              </p>
            )}
          </div>
          <div className={cn(
            "h-12 w-12 rounded-lg flex items-center justify-center",
            gradient === 'default' && "bg-primary/10 text-primary",
            gradient !== 'default' && "bg-white/20"
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}