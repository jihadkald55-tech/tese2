"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Star,
  Eye,
  EyeOff,
  Award,
  BookOpen,
  Calendar,
  User,
  FileText,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";

interface ResearchProject {
  id: string;
  title: string;
  description: string;
  summary: string;
  wordCount: number;
  status: string;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt: string | null;
  graduationYear: number | null;
  supervisorName: string | null;
  studentName: string;
  studentId: string;
  studentEmail: string;
  createdAt: string;
  updatedAt: string;
}

export default function PublishManager() {
  const { user } = useUser();
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] =
    useState<ResearchProject | null>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (user?.role === "professor") {
      fetchCompletedProjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchCompletedProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/publish?supervisorId=${user?.id || ""}`,
      );
      const data = await response.json();

      if (data.success) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error("خطأ في جلب الأبحاث:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (
    projectId: string,
    isPublished: boolean,
    isFeatured: boolean = false,
  ) => {
    try {
      setPublishing(true);
      const currentDate = new Date();
      const graduationYear = currentDate.getFullYear();

      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          researchId: projectId,
          isPublished,
          isFeatured,
          supervisorId: user?.id,
          supervisorName: user?.name,
          graduationYear,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // تحديث القائمة المحلية
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  isPublished,
                  isFeatured,
                  publishedAt: isPublished ? new Date().toISOString() : null,
                  graduationYear,
                  supervisorName: user?.name || null,
                }
              : p,
          ),
        );

        alert(data.message);
      } else {
        alert(data.error || "حدث خطأ");
      }
    } catch (error) {
      console.error("خطأ:", error);
      alert("حدث خطأ في النشر");
    } finally {
      setPublishing(false);
    }
  };

  if (user?.role !== "professor") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
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
            جاري تحميل الأبحاث...
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
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-google p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <Award className="w-12 h-12" />
              <div>
                <h1 className="text-3xl font-bold">إدارة النشر</h1>
                <p className="text-white/90">
                  ترشيح الأبحاث المميزة للنشر في معرض مداد
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-google p-4">
                <BookOpen className="w-6 h-6 mb-2" />
                <p className="text-2xl font-bold">{projects.length}</p>
                <p className="text-sm text-white/80">بحث مكتمل</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-google p-4">
                <Eye className="w-6 h-6 mb-2" />
                <p className="text-2xl font-bold">
                  {projects.filter((p) => p.isPublished).length}
                </p>
                <p className="text-sm text-white/80">منشور</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-google p-4">
                <Star className="w-6 h-6 mb-2" />
                <p className="text-2xl font-bold">
                  {projects.filter((p) => p.isFeatured).length}
                </p>
                <p className="text-sm text-white/80">مميز</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Projects List */}
        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="bg-white dark:bg-dark-card rounded-google shadow-google-md p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600 dark:text-dark-muted">
                لا توجد أبحاث مكتملة بعد
              </p>
            </div>
          ) : (
            projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-dark-card rounded-google shadow-google-md hover:shadow-google-lg transition-all"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-medad-ink dark:text-dark-text">
                          {project.title}
                        </h3>
                        {project.isPublished && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-medium flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            منشور
                          </span>
                        )}
                        {project.isFeatured && (
                          <span className="px-3 py-1 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-full text-sm font-medium flex items-center gap-1">
                            <Star className="w-4 h-4 fill-white" />
                            مميز
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 dark:text-dark-muted mb-4 line-clamp-2">
                        {project.description}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-dark-text">
                          <User className="w-4 h-4 text-primary-600" />
                          <span>{project.studentName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 dark:text-dark-text">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span>{project.wordCount.toLocaleString()} كلمة</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 dark:text-dark-text">
                          <Calendar className="w-4 h-4 text-green-600" />
                          <span>
                            {new Date(project.updatedAt).toLocaleDateString(
                              "ar",
                            )}
                          </span>
                        </div>
                        {project.publishedAt && (
                          <div className="flex items-center gap-2 text-gray-700 dark:text-dark-text">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            <span>
                              نُشر:{" "}
                              {new Date(project.publishedAt).toLocaleDateString(
                                "ar",
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-dark-border">
                    {!project.isPublished ? (
                      <>
                        <button
                          onClick={() => handlePublish(project.id, true, false)}
                          disabled={publishing}
                          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-google font-medium hover:shadow-google-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <Eye className="w-5 h-5" />
                          نشر في المعرض
                        </button>
                        <button
                          onClick={() => handlePublish(project.id, true, true)}
                          disabled={publishing}
                          className="flex-1 bg-gradient-to-r from-primary-600 to-purple-600 text-white px-6 py-3 rounded-google font-medium hover:shadow-google-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <Star className="w-5 h-5" />
                          ترشيح كبحث مميز
                        </button>
                      </>
                    ) : (
                      <>
                        {!project.isFeatured && (
                          <button
                            onClick={() =>
                              handlePublish(project.id, true, true)
                            }
                            disabled={publishing}
                            className="flex-1 bg-gradient-to-r from-primary-600 to-purple-600 text-white px-6 py-3 rounded-google font-medium hover:shadow-google-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            <Star className="w-5 h-5" />
                            جعله مميزاً
                          </button>
                        )}
                        {project.isFeatured && (
                          <button
                            onClick={() =>
                              handlePublish(project.id, true, false)
                            }
                            disabled={publishing}
                            className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-google font-medium hover:shadow-google-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            <Star className="w-5 h-5" />
                            إزالة التمييز
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handlePublish(project.id, false, false)
                          }
                          disabled={publishing}
                          className="px-6 py-3 bg-red-600 text-white rounded-google font-medium hover:shadow-google-lg transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          <EyeOff className="w-5 h-5" />
                          إلغاء النشر
                        </button>
                      </>
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
