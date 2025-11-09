import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from "@/lib/utils";

interface SalesChartProps {
  language: 'ar' | 'en';
}

const salesData = [
  { 
    day: 'السبت', 
    dayEn: 'Sat', 
    sales: 25000, 
    purchases: 15000 
  },
  { 
    day: 'الأحد', 
    dayEn: 'Sun', 
    sales: 32000, 
    purchases: 18000 
  },
  { 
    day: 'الاثنين', 
    dayEn: 'Mon', 
    sales: 28000, 
    purchases: 22000 
  },
  { 
    day: 'الثلاثاء', 
    dayEn: 'Tue', 
    sales: 45000, 
    purchases: 25000 
  },
  { 
    day: 'الأربعاء', 
    dayEn: 'Wed', 
    sales: 38000, 
    purchases: 20000 
  },
  { 
    day: 'الخميس', 
    dayEn: 'Thu', 
    sales: 52000, 
    purchases: 30000 
  },
  { 
    day: 'الجمعة', 
    dayEn: 'Fri', 
    sales: 41000, 
    purchases: 28000 
  },
];

export function SalesChart({ language }: SalesChartProps) {
  return (
    <Card className="accounting-card">
      <CardHeader>
        <CardTitle className={cn(
          "text-lg font-semibold",
          language === 'ar' && "text-right"
        )}>
          {language === 'ar' ? 'المبيعات والمشتريات - آخر 7 أيام' : 'Sales & Purchases - Last 7 Days'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey={language === 'ar' ? 'day' : 'dayEn'}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `${value / 1000}K`}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `${value.toLocaleString()} ${language === 'ar' ? 'ر.س' : 'SAR'}`,
                  language === 'ar' ? 
                    (name === 'sales' ? 'المبيعات' : 'المشتريات') :
                    (name === 'sales' ? 'Sales' : 'Purchases')
                ]}
                labelFormatter={(label) => language === 'ar' ? label : label}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--card-foreground))'
                }}
              />
              <Bar 
                dataKey="sales" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
                name="sales"
              />
              <Bar 
                dataKey="purchases" 
                fill="hsl(var(--success))" 
                radius={[4, 4, 0, 0]}
                name="purchases"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}