import { useAuth } from "@/contexts/AuthContext";
import LandingPage from "./LandingPage";
import DashboardContent from "./DashboardContent";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-transparent border-t-primary mx-auto mb-4" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // إذا لم يكن المستخدم مسجل دخوله، عرض صفحة الهبوط
  if (!user) {
    return <LandingPage />;
  }

  // إذا كان مسجل دخوله، عرض محتوى لوحة التحكم فقط
  // MainLayout سيتولى عرض Sidebar و Header
  return <DashboardContent />;
};

export default Index;
