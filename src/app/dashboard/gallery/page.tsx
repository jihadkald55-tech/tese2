"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Star,
  Calendar,
  User,
  FileText,
  Search,
  Filter,
  Sparkles,
  GraduationCap,
  Award,
  TrendingUp,
} from "lucide-react";

interface ResearchProject {
  id: string;
  title: string;
  description: string;
  summary: string;
  wordCount: number;
  graduationYear: number;
  publishedAt: string;
  isFeatured: boolean;
  supervisorName: string;
  studentName: string;
  studentEmail: string;
}

export default function GalleryPage() {
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ResearchProject[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<ResearchProject | null>(null);

  useEffect(() => {
    fetchPublishedProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, searchQuery, selectedYear, showFeaturedOnly]);

  const fetchPublishedProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/gallery");
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

  const filterProjects = () => {
    let filtered = [...projects];

    // تصفية حسب البحث
    if (searchQuery) {
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.studentName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          project.supervisorName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    // تصفية حسب السنة
    if (selectedYear !== "all") {
      filtered = filtered.filter(
        (project) => project.graduationYear.toString() === selectedYear,
      );
    }

    // تصفية الأبحاث المميزة
    if (showFeaturedOnly) {
      filtered = filtered.filter((project) => project.isFeatured);
    }

    setFilteredProjects(filtered);
  };

  const getAvailableYears = () => {
    const years = projects.map((p) => p.graduationYear);
    return [...new Set(years)].sort((a, b) => b - a);
  };

  const stats = {
    total: projects.length,
    featured: projects.filter((p) => p.isFeatured).length,
    avgWords: Math.round(
      projects.reduce((sum, p) => sum + p.wordCount, 0) / projects.length || 0,
    ),
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-dark-muted">
            جاري تحميل المعرض...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-medad-paper dark:bg-dark-bg">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Award className="w-12 h-12" />
              <h1 className="text-4xl md:text-5xl font-bold">أرشيف مداد</h1>
              <Sparkles className="w-12 h-12" />
            </div>
            <p className="text-xl text-white/90 mb-8">
              معرض الأبحاث المميزة • مكتبة الإلهام والمعرفة
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-lg rounded-google p-4"
              >
                <BookOpen className="w-8 h-8 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-white/80">بحث منشور</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-lg rounded-google p-4"
              >
                <Star className="w-8 h-8 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.featured}</p>
                <p className="text-sm text-white/80">بحث مميز</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-lg rounded-google p-4"
              >
                <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                <p className="text-2xl font-bold">
                  {stats.avgWords.toLocaleString()}
                </p>
                <p className="text-sm text-white/80">متوسط الكلمات</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-dark-card rounded-google shadow-google-md p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن بحث، طالب، أو مشرف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 py-3 px-4 border border-medad-border dark:border-dark-border rounded-google focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-hover dark:text-dark-text"
              />
            </div>

            {/* Year Filter */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-3 border border-medad-border dark:border-dark-border rounded-google focus:ring-2 focus:ring-primary-500 dark:bg-dark-hover dark:text-dark-text"
            >
              <option value="all">جميع السنوات</option>
              {getAvailableYears().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            {/* Featured Filter */}
            <button
              onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
              className={`px-6 py-3 rounded-google font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                showFeaturedOnly
                  ? "bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-google-lg"
                  : "bg-gray-100 dark:bg-dark-hover text-gray-700 dark:text-dark-text hover:bg-gray-200"
              }`}
            >
              <Star
                className={`w-5 h-5 ${showFeaturedOnly ? "fill-white" : ""}`}
              />
              المميزة فقط
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-600 dark:text-dark-muted">
            عرض {filteredProjects.length} من {projects.length} بحث
          </div>
        </motion.div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-600 dark:text-dark-muted">
              لا توجد أبحاث مطابقة للبحث
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                onClick={() => setSelectedProject(project)}
                className="bg-white dark:bg-dark-card rounded-google shadow-google-md hover:shadow-google-lg transition-all cursor-pointer overflow-hidden group"
              >
                {/* Featured Badge */}
                {project.isFeatured && (
                  <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white px-4 py-2 flex items-center gap-2">
                    <Star className="w-4 h-4 fill-white" />
                    <span className="text-sm font-medium">بحث مميز</span>
                  </div>
                )}

                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-medad-ink dark:text-dark-text mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {project.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-gray-600 dark:text-dark-muted mb-4 line-clamp-3">
                    {project.summary}
                  </p>

                  {/* Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-dark-text">
                      <GraduationCap className="w-4 h-4 text-primary-600" />
                      <span>{project.studentName}</span>
                    </div>
                    {project.supervisorName && (
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-dark-text">
                        <User className="w-4 h-4 text-purple-600" />
                        <span>إشراف: {project.supervisorName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-dark-text">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <span>{project.graduationYear}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-border">
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-dark-muted">
                      <FileText className="w-4 h-4" />
                      <span>{project.wordCount.toLocaleString()} كلمة</span>
                    </div>
                    <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                      اقرأ المزيد ←
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-4 md:inset-10 lg:inset-20 bg-white dark:bg-dark-card rounded-google shadow-2xl z-50 overflow-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-purple-600 text-white p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedProject.isFeatured && (
                    <Star className="w-6 h-6 fill-white" />
                  )}
                  <h2 className="text-2xl font-bold">تفاصيل البحث</h2>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-8">
                <h1 className="text-3xl font-bold text-medad-ink dark:text-dark-text mb-6">
                  {selectedProject.title}
                </h1>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-primary-600" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-dark-muted">
                          الطالب
                        </p>
                        <p className="font-medium text-gray-900 dark:text-dark-text">
                          {selectedProject.studentName}
                        </p>
                      </div>
                    </div>
                    {selectedProject.supervisorName && (
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-dark-muted">
                            المشرف
                          </p>
                          <p className="font-medium text-gray-900 dark:text-dark-text">
                            {selectedProject.supervisorName}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-dark-muted">
                          سنة التخرج
                        </p>
                        <p className="font-medium text-gray-900 dark:text-dark-text">
                          {selectedProject.graduationYear}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-dark-muted">
                          عدد الكلمات
                        </p>
                        <p className="font-medium text-gray-900 dark:text-dark-text">
                          {selectedProject.wordCount.toLocaleString()} كلمة
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-dark-hover rounded-google p-6">
                  <h3 className="text-lg font-bold text-medad-ink dark:text-dark-text mb-3">
                    ملخص البحث
                  </h3>
                  <p className="text-gray-700 dark:text-dark-text leading-relaxed whitespace-pre-wrap">
                    {selectedProject.summary || selectedProject.description}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
