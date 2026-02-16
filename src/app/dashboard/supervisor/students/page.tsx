"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  BookOpen,
  FileText,
  BarChart3,
  Calendar,
  Eye,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import Link from "next/link";

interface StudentData {
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  researchId: string;
  researchTitle: string;
  researchStatus: string;
  wordCount: number;
  lastActivity: string;
  totalChapters: number;
  approvedChapters: number;
  pendingReviews: number;
  completionPercentage: number;
  assignedAt: string;
}

export default function SupervisorStudentsPage() {
  const { user } = useUser();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "delayed">("all");

  useEffect(() => {
    if (user?.role === "professor") {
      fetchStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/supervisor/students?supervisorId=${user?.id}`,
      );
      const data = await response.json();

      if (data.success) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error("خطأ في جلب الطلاب:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "in_progress":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "مكتمل";
      case "in_progress":
        return "قيد التنفيذ";
      case "planning":
        return "التخطيط";
      default:
        return status;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-blue-500";
    if (percentage >= 30) return "bg-yellow-500";
    return "bg-red-500";
  };

  const filteredStudents = students.filter((student) => {
    if (filter === "all") return true;
    if (filter === "active") return student.completionPercentage >= 30;
    if (filter === "delayed") return student.completionPercentage < 30;
    return true;
  });

  const stats = {
    total: students.length,
    active: students.filter((s) => s.completionPercentage >= 30).length,
    delayed: students.filter((s) => s.completionPercentage < 30).length,
    avgProgress:
      Math.round(
        students.reduce((sum, s) => sum + s.completionPercentage, 0) /
          students.length,
      ) || 0,
  };

  if (user?.role !== "professor") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-gray-600 dark:text-dark-muted">
            هذه الصفحة متاحة للمشرفين فقط
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-dark-muted">
            جاري تحميل بيانات الطلاب...
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
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-google p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <Users className="w-12 h-12" />
              <div>
                <h1 className="text-3xl font-bold">لوحة الطلاب</h1>
                <p className="text-white/90">متابعة تقدم الطلاب المشرف عليهم</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-google p-4">
                <Users className="w-6 h-6 mb-2" />
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-white/80">إجمالي الطلاب</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-google p-4">
                <TrendingUp className="w-6 h-6 mb-2" />
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-white/80">نشط</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-google p-4">
                <Clock className="w-6 h-6 mb-2" />
                <p className="text-2xl font-bold">{stats.delayed}</p>
                <p className="text-sm text-white/80">متأخر</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-google p-4">
                <BarChart3 className="w-6 h-6 mb-2" />
                <p className="text-2xl font-bold">{stats.avgProgress}%</p>
                <p className="text-sm text-white/80">متوسط التقدم</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-2 rounded-google font-medium transition-all ${
              filter === "all"
                ? "bg-primary-600 text-white shadow-google-md"
                : "bg-white dark:bg-dark-card text-gray-700 dark:text-dark-text hover:shadow-google-sm"
            }`}
          >
            الكل ({students.length})
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-6 py-2 rounded-google font-medium transition-all ${
              filter === "active"
                ? "bg-green-600 text-white shadow-google-md"
                : "bg-white dark:bg-dark-card text-gray-700 dark:text-dark-text hover:shadow-google-sm"
            }`}
          >
            نشط ({stats.active})
          </button>
          <button
            onClick={() => setFilter("delayed")}
            className={`px-6 py-2 rounded-google font-medium transition-all ${
              filter === "delayed"
                ? "bg-red-600 text-white shadow-google-md"
                : "bg-white dark:bg-dark-card text-gray-700 dark:text-dark-text hover:shadow-google-sm"
            }`}
          >
            متأخر ({stats.delayed})
          </button>
        </div>

        {/* Students List */}
        <div className="space-y-4">
          {filteredStudents.length === 0 ? (
            <div className="bg-white dark:bg-dark-card rounded-google shadow-google-md p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600 dark:text-dark-muted">
                لا يوجد طلاب مسجلون بعد
              </p>
            </div>
          ) : (
            filteredStudents.map((student, index) => (
              <motion.div
                key={student.assignmentId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-dark-card rounded-google shadow-google-md hover:shadow-google-lg transition-all overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {student.studentName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-medad-ink dark:text-dark-text">
                            {student.studentName}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-dark-muted">
                            {student.studentEmail}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-4 h-4 text-primary-600" />
                          <span className="font-medium text-gray-900 dark:text-dark-text">
                            {student.researchTitle}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.researchStatus)}`}
                          >
                            {getStatusText(student.researchStatus)}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600 dark:text-dark-muted">
                              نسبة الإنجاز
                            </span>
                            <span className="text-sm font-bold text-gray-900 dark:text-dark-text">
                              {student.completionPercentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-dark-border rounded-full h-3 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${student.completionPercentage}%`,
                              }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className={`h-full ${getProgressColor(student.completionPercentage)}`}
                            />
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-700 dark:text-dark-text">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span>{student.totalChapters} فصول</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700 dark:text-dark-text">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>{student.approvedChapters} معتمد</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700 dark:text-dark-text">
                            <Clock className="w-4 h-4 text-orange-600" />
                            <span>{student.pendingReviews} قيد المراجعة</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700 dark:text-dark-text">
                            <BarChart3 className="w-4 h-4 text-purple-600" />
                            <span>
                              {student.wordCount.toLocaleString()} كلمة
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 dark:text-dark-muted flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        آخر نشاط:{" "}
                        {new Date(student.lastActivity).toLocaleDateString(
                          "ar",
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-dark-border">
                    <Link
                      href={`/dashboard/review/${student.researchId}`}
                      className="flex-1 bg-gradient-to-r from-primary-600 to-purple-600 text-white px-6 py-3 rounded-google font-medium hover:shadow-google-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Eye className="w-5 h-5" />
                      مراجعة البحث
                    </Link>
                    {student.pendingReviews > 0 && (
                      <span className="px-4 py-3 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-google font-medium flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {student.pendingReviews} في انتظار المراجعة
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
