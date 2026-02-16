"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Settings,
  UserPlus,
  Link2,
  Bell,
  BarChart3,
  Shield,
  Star,
  Eye,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";

export default function AdminDashboardPage() {
  const { user } = useUser();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/stats");
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("خطأ في جلب الإحصائيات:", error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-gray-600 dark:text-dark-muted">
            هذه الصفحة متاحة للمديرين فقط
          </p>
        </div>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-dark-muted">
            جاري تحميل الإحصائيات...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-medad-paper dark:bg-dark-bg p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-google p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <Shield className="w-12 h-12" />
              <div>
                <h1 className="text-3xl font-bold">لوحة تحكم المدير</h1>
                <p className="text-white/90">إدارة شاملة لنظام مداد</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* User Stats */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-medad-ink dark:text-dark-text mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary-600" />
            إحصائيات المستخدمين
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-card rounded-google shadow-google-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <Users className="w-10 h-10 text-blue-600" />
                <span className="text-3xl font-bold text-medad-ink dark:text-dark-text">
                  {stats.users.total}
                </span>
              </div>
              <p className="text-gray-600 dark:text-dark-muted font-medium">
                إجمالي المستخدمين
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-dark-card rounded-google shadow-google-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <GraduationCap className="w-10 h-10 text-green-600" />
                <span className="text-3xl font-bold text-medad-ink dark:text-dark-text">
                  {stats.users.students}
                </span>
              </div>
              <p className="text-gray-600 dark:text-dark-muted font-medium">
                الطلاب
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-dark-card rounded-google shadow-google-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <UserPlus className="w-10 h-10 text-purple-600" />
                <span className="text-3xl font-bold text-medad-ink dark:text-dark-text">
                  {stats.users.professors}
                </span>
              </div>
              <p className="text-gray-600 dark:text-dark-muted font-medium">
                المشرفين
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-dark-card rounded-google shadow-google-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <Shield className="w-10 h-10 text-red-600" />
                <span className="text-3xl font-bold text-medad-ink dark:text-dark-text">
                  {stats.users.admins}
                </span>
              </div>
              <p className="text-gray-600 dark:text-dark-muted font-medium">
                المديرين
              </p>
            </motion.div>
          </div>
        </div>

        {/* Project Stats */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-medad-ink dark:text-dark-text mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary-600" />
            إحصائيات الأبحاث
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-google shadow-google-md p-6 text-white"
            >
              <BookOpen className="w-8 h-8 mb-3" />
              <p className="text-3xl font-bold mb-2">{stats.projects.total}</p>
              <p className="text-white/90 text-sm">إجمالي الأبحاث</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-google shadow-google-md p-6 text-white"
            >
              <Settings className="w-8 h-8 mb-3" />
              <p className="text-3xl font-bold mb-2">
                {stats.projects.planning}
              </p>
              <p className="text-white/90 text-sm">التخطيط</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-google shadow-google-md p-6 text-white"
            >
              <TrendingUp className="w-8 h-8 mb-3" />
              <p className="text-3xl font-bold mb-2">
                {stats.projects.in_progress}
              </p>
              <p className="text-white/90 text-sm">قيد التنفيذ</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-google shadow-google-md p-6 text-white"
            >
              <CheckCircle className="w-8 h-8 mb-3" />
              <p className="text-3xl font-bold mb-2">
                {stats.projects.completed}
              </p>
              <p className="text-white/90 text-sm">مكتمل</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-pink-500 to-red-600 rounded-google shadow-google-md p-6 text-white"
            >
              <Star className="w-8 h-8 mb-3" />
              <p className="text-3xl font-bold mb-2">
                {stats.projects.featured}
              </p>
              <p className="text-white/90 text-sm">مميز</p>
            </motion.div>
          </div>
        </div>

        {/* Assignments & Chapters */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Assignments */}
          <div>
            <h2 className="text-2xl font-bold text-medad-ink dark:text-dark-text mb-4 flex items-center gap-2">
              <Link2 className="w-6 h-6 text-primary-600" />
              التعيينات
            </h2>
            <div className="space-y-4">
              <div className="bg-white dark:bg-dark-card rounded-google shadow-google-md p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-medad-ink dark:text-dark-text">
                        {stats.assignments.active}
                      </p>
                      <p className="text-gray-600 dark:text-dark-muted">
                        تعيينات نشطة
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-dark-card rounded-google shadow-google-md p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-medad-ink dark:text-dark-text">
                        {stats.assignments.total}
                      </p>
                      <p className="text-gray-600 dark:text-dark-muted">
                        إجمالي التعيينات
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chapters */}
          <div>
            <h2 className="text-2xl font-bold text-medad-ink dark:text-dark-text mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary-600" />
              الفصول
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-dark-card rounded-google shadow-google-md p-4">
                <Clock className="w-6 h-6 text-orange-600 mb-2" />
                <p className="text-xl font-bold text-medad-ink dark:text-dark-text">
                  {stats.chapters.pending}
                </p>
                <p className="text-sm text-gray-600 dark:text-dark-muted">
                  في الانتظار
                </p>
              </div>
              <div className="bg-white dark:bg-dark-card rounded-google shadow-google-md p-4">
                <Eye className="w-6 h-6 text-blue-600 mb-2" />
                <p className="text-xl font-bold text-medad-ink dark:text-dark-text">
                  {stats.chapters.under_review}
                </p>
                <p className="text-sm text-gray-600 dark:text-dark-muted">
                  قيد المراجعة
                </p>
              </div>
              <div className="bg-white dark:bg-dark-card rounded-google shadow-google-md p-4">
                <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                <p className="text-xl font-bold text-medad-ink dark:text-dark-text">
                  {stats.chapters.approved}
                </p>
                <p className="text-sm text-gray-600 dark:text-dark-muted">
                  معتمد
                </p>
              </div>
              <div className="bg-white dark:bg-dark-card rounded-google shadow-google-md p-4">
                <Bell className="w-6 h-6 text-red-600 mb-2" />
                <p className="text-xl font-bold text-medad-ink dark:text-dark-text">
                  {stats.chapters.needs_revision}
                </p>
                <p className="text-sm text-gray-600 dark:text-dark-muted">
                  يحتاج تعديل
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-medad-ink dark:text-dark-text mb-4">
            إجراءات سريعة
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <button className="bg-white dark:bg-dark-card rounded-google shadow-google-md p-6 hover:shadow-google-lg transition-all text-right">
              <Users className="w-8 h-8 text-primary-600 mb-3" />
              <h3 className="text-lg font-bold text-medad-ink dark:text-dark-text mb-2">
                إدارة المستخدمين
              </h3>
              <p className="text-gray-600 dark:text-dark-muted text-sm">
                إضافة أو تعديل حسابات الطلاب والمشرفين
              </p>
            </button>

            <button className="bg-white dark:bg-dark-card rounded-google shadow-google-md p-6 hover:shadow-google-lg transition-all text-right">
              <Link2 className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="text-lg font-bold text-medad-ink dark:text-dark-text mb-2">
                نظام التوزيع
              </h3>
              <p className="text-gray-600 dark:text-dark-muted text-sm">
                ربط الطلاب بالمشرفين
              </p>
            </button>

            <button className="bg-white dark:bg-dark-card rounded-google shadow-google-md p-6 hover:shadow-google-lg transition-all text-right">
              <Bell className="w-8 h-8 text-red-600 mb-3" />
              <h3 className="text-lg font-bold text-medad-ink dark:text-dark-text mb-2">
                إدارة الإعلانات
              </h3>
              <p className="text-gray-600 dark:text-dark-muted text-sm">
                إنشاء إعلانات ومواعيد نهائية
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
