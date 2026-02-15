"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useUser();
  const router = useRouter();

  // ✅ حماية Dashboard - إعادة توجيه المستخدمين غير المصادقين
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/dashboard");
    }
  }, [user, loading, router]);

  // عرض loading state بينما يتم التحقق من الجلسة
  if (loading) {
    return (
      <div className="min-h-screen bg-medad-paper dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-dark-muted">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  // لا تعرض المحتوى إذا لم يكن المستخدم مصادق
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-medad-paper dark:bg-dark-bg">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Fixed Toggle Button - Always Visible */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          right: sidebarOpen ? "288px" : "0px",
        }}
        className="fixed top-1/2 -translate-y-1/2 z-[60] bg-white dark:bg-dark-card hover:bg-medad-hover dark:hover:bg-dark-hover border-2 border-medad-border dark:border-dark-border shadow-google-lg hover:shadow-xl p-3 rounded-r-full transition-all duration-300 group"
        title={sidebarOpen ? "إخفاء الشريط الجانبي" : "إظهار الشريط الجانبي"}
      >
        <Menu className="w-5 h-5 text-medad-ink dark:text-dark-text group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
      </button>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${sidebarOpen ? "lg:mr-72" : "mr-0"}`}
      >
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
