import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Calculator, 
  DollarSign, 
  FileText, 
  Lock, 
  Mail, 
  Package, 
  Shield, 
  TrendingUp, 
  Users,
  ChevronLeft,
  Star,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // إذا كان المستخدم مسجل دخوله بالفعل، التوجه للوحة التحكم
  if (user) {
    navigate('/');
    return null;
  }

  const handleLanguageChange = (lang: 'ar' | 'en') => {
    setLanguage(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.className = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (!error) {
      navigate('/');
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signUp(email, password);
    setLoading(false);
  };

  const features = {
    ar: [
      {
        icon: Package,
        title: 'إدارة المنتجات',
        description: 'نظام شامل لإدارة المنتجات والمخزون مع تتبع مستويات المخزون والتنبيهات'
      },
      {
        icon: Calculator,
        title: 'المحاسبة المتكاملة',
        description: 'نظام محاسبي متكامل لتتبع المبيعات والمشتريات والتقارير المالية'
      },
      {
        icon: TrendingUp,
        title: 'التقارير والتحليلات',
        description: 'تقارير مفصلة وتحليلات لأداء الأعمال لاتخاذ قرارات مدروسة'
      },
      {
        icon: Shield,
        title: 'الأمان والموثوقية',
        description: 'حماية عالية للبيانات مع نسخ احتياطية آمنة ومشفرة'
      }
    ],
    en: [
      {
        icon: Package,
        title: 'Product Management',
        description: 'Comprehensive system for managing products and inventory with stock level tracking and alerts'
      },
      {
        icon: Calculator,
        title: 'Integrated Accounting',
        description: 'Complete accounting system for tracking sales, purchases, and financial reports'
      },
      {
        icon: TrendingUp,
        title: 'Reports & Analytics',
        description: 'Detailed reports and business performance analytics for informed decision making'
      },
      {
        icon: Shield,
        title: 'Security & Reliability',
        description: 'High-level data protection with secure encrypted backups'
      }
    ]
  };

  const stats = {
    ar: [
      { number: '10,000+', label: 'منتج مُدار' },
      { number: '500+', label: 'عميل راضٍ' },
      { number: '99.9%', label: 'وقت تشغيل' },
      { number: '24/7', label: 'دعم فني' }
    ],
    en: [
      { number: '10,000+', label: 'Products Managed' },
      { number: '500+', label: 'Satisfied Clients' },
      { number: '99.9%', label: 'Uptime' },
      { number: '24/7', label: 'Support' }
    ]
  };

  return (
    <div className={cn(
      "min-h-screen bg-background",
      language === 'ar' && "rtl"
    )}>
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className={cn(
            "flex items-center justify-between",
            language === 'ar' && "flex-row-reverse"
          )}>
            <div className={cn(
              "flex items-center gap-3",
              language === 'ar' && "flex-row-reverse"
            )}>
              <div className="h-10 w-10 rounded-lg primary-gradient flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div className={cn(language === 'ar' && "text-right")}>
                <h1 className="text-xl font-bold text-foreground">
                  {language === 'ar' ? 'استوديو إي' : 'E-Studio'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'نظام المحاسبة المتكامل' : 'Integrated Accounting System'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex rounded-lg border border-border p-1">
                <button
                  onClick={() => handleLanguageChange('ar')}
                  className={cn(
                    "px-3 py-1 text-sm font-medium rounded-md transition-colors",
                    language === 'ar' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  العربية
                </button>
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={cn(
                    "px-3 py-1 text-sm font-medium rounded-md transition-colors",
                    language === 'en' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Hero Content */}
          <div className={cn(
            "space-y-8",
            language === 'ar' && "text-right"
          )}>
            <div className="space-y-4">
              <Badge variant="secondary" className="mb-4">
                {language === 'ar' ? 'النسخة التجريبية' : 'Demo Version'}
              </Badge>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                {language === 'ar' ? (
                  <>نظام إدارة <span className="text-primary">المنتجات</span> المتكامل</>
                ) : (
                  <>Integrated <span className="text-primary">Product</span> Management System</>
                )}
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                {language === 'ar' 
                  ? 'حلول شاملة لإدارة المنتجات والمخزون والمحاسبة مع واجهة سهلة الاستخدام ومميزات متقدمة'
                  : 'Comprehensive solutions for product, inventory, and accounting management with user-friendly interface and advanced features'
                }
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {features[language].map((feature, index) => (
                <div key={index} className="accounting-card p-4">
                  <feature.icon className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              {stats[language].map((stat, index) => (
                <div key={index} className={cn(
                  "text-center",
                  language === 'ar' && "text-right"
                )}>
                  <div className="text-2xl font-bold text-primary">{stat.number}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto">
            <Card className="accounting-card">
              <CardHeader className="space-y-1">
                <div className={cn(
                  "flex items-center gap-3 mb-4",
                  language === 'ar' && "flex-row-reverse"
                )}>
                  <div className="h-12 w-12 rounded-lg primary-gradient flex items-center justify-center">
                    <Lock className="h-6 w-6 text-white" />
                  </div>
                  <div className={cn(language === 'ar' && "text-right")}>
                    <CardTitle className="text-xl">
                      {language === 'ar' ? 'تسجيل الدخول' : 'Access System'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'ادخل بياناتك للوصول للنظام' : 'Enter your credentials to access'}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">
                      {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                    </TabsTrigger>
                    <TabsTrigger value="signup">
                      {language === 'ar' ? 'إنشاء حساب' : 'Sign Up'}
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="signin" className="space-y-4 mt-6">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">
                          {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder={language === 'ar' ? 'أدخل البريد الإلكتروني' : 'Enter your email'}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className={cn(language === 'ar' && "text-right")}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">
                          {language === 'ar' ? 'كلمة المرور' : 'Password'}
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className={cn(language === 'ar' && "text-right")}
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loading}
                        size="lg"
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
                            {language === 'ar' ? 'جاري تسجيل الدخول...' : 'Signing in...'}
                          </div>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="signup" className="space-y-4 mt-6">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">
                          {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                        </Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder={language === 'ar' ? 'أدخل البريد الإلكتروني' : 'Enter your email'}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className={cn(language === 'ar' && "text-right")}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">
                          {language === 'ar' ? 'كلمة المرور' : 'Password'}
                        </Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className={cn(language === 'ar' && "text-right")}
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loading}
                        size="lg"
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
                            {language === 'ar' ? 'جاري إنشاء الحساب...' : 'Creating account...'}
                          </div>
                        ) : (
                          <>
                            <Users className="h-4 w-4 mr-2" />
                            {language === 'ar' ? 'إنشاء حساب' : 'Create Account'}
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                {/* Demo Credentials */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-2">
                    {language === 'ar' ? 'بيانات تجريبية للدخول:' : 'Demo Login Credentials:'}
                  </p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>{language === 'ar' ? 'البريد الإلكتروني:' : 'Email:'} demo@example.com</p>
                    <p>{language === 'ar' ? 'كلمة المرور:' : 'Password:'} 123456</p>
                  </div>
                </div>

                {/* Back to Dashboard */}
                <div className="mt-4 pt-4 border-t border-border">
                  <Button 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => navigate('/')}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    {language === 'ar' ? 'العودة للوحة التحكم' : 'Back to Dashboard'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className={cn(
            "text-center text-sm text-muted-foreground",
            language === 'ar' && "text-right"
          )}>
            <p>
              {language === 'ar' ? 
                '© 2024 استوديو إي - نظام المحاسبة المتكامل - النسخة التجريبية' :
                '© 2024 E-Studio - Integrated Accounting System - Demo Version'
              }
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}