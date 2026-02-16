"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Send,
  AlertTriangle,
  ThumbsUp,
  User,
  Calendar,
  BookOpen,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";

interface Chapter {
  id: string;
  chapter_number: number;
  title: string;
  content: string;
  word_count: number;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  student: {
    id: string;
    name: string;
    email: string;
  };
  research: {
    id: string;
    title: string;
  };
  comments: Array<{
    id: string;
    comment: string;
    type: string;
    is_resolved: boolean;
    created_at: string;
  }>;
}

export default function ReviewCenterPage() {
  const { user } = useUser();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.role === "professor") {
      fetchChapters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filter]);

  const fetchChapters = async () => {
    try {
      setLoading(true);
      const statusParam = filter !== "all" ? `&status=${filter}` : "";
      const response = await fetch(
        `/api/supervisor/review?supervisorId=${user?.id}${statusParam}`,
      );
      const data = await response.json();

      if (data.success) {
        setChapters(data.chapters);
      }
    } catch (error) {
      console.error("خطأ في جلب الفصول:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedChapter) return;

    try {
      setSubmitting(true);
      const response = await fetch("/api/supervisor/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterId: selectedChapter.id,
          reviewerId: user?.id,
          comment: newComment,
          type: "general",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNewComment("");
        fetchChapters();
        alert("تم إضافة التعليق بنجاح");
      }
    } catch (error) {
      console.error("خطأ:", error);
      alert("حدث خطأ في إضافة التعليق");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (chapterId: string, status: string) => {
    try {
      const response = await fetch("/api/supervisor/review", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterId,
          status,
          reviewerId: user?.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        fetchChapters();
        setSelectedChapter(null);
        alert(
          status === "approved"
            ? "تم اعتماد الفصل بنجاح"
            : "تم طلب التعديلات بنجاح",
        );
      }
    } catch (error) {
      console.error("خطأ:", error);
      alert("حدث خطأ في تحديث الحالة");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "text-orange-700 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400";
      case "under_review":
        return "text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400";
      case "needs_revision":
        return "text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "text-gray-700 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "معتمد";
      case "pending":
        return "في الانتظار";
      case "under_review":
        return "قيد المراجعة";
      case "needs_revision":
        return "يحتاج تعديل";
      default:
        return status;
    }
  };

  const stats = {
    pending: chapters.filter((c) => c.status === "pending").length,
    under_review: chapters.filter((c) => c.status === "under_review").length,
    needs_revision: chapters.filter((c) => c.status === "needs_revision")
      .length,
    approved: chapters.filter((c) => c.status === "approved").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-dark-muted">
            جاري تحميل الفصول...
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
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-google p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <MessageSquare className="w-12 h-12" />
              <div>
                <h1 className="text-3xl font-bold">مركز المراجعة</h1>
                <p className="text-white/90">مراجعة واعتماد فصول الطلاب</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-google p-4">
                <Clock className="w-6 h-6 mb-2" />
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-white/80">في الانتظار</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-google p-4">
                <Eye className="w-6 h-6 mb-2" />
                <p className="text-2xl font-bold">{stats.under_review}</p>
                <p className="text-sm text-white/80">قيد المراجعة</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-google p-4">
                <AlertTriangle className="w-6 h-6 mb-2" />
                <p className="text-2xl font-bold">{stats.needs_revision}</p>
                <p className="text-sm text-white/80">يحتاج تعديل</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-google p-4">
                <CheckCircle className="w-6 h-6 mb-2" />
                <p className="text-2xl font-bold">{stats.approved}</p>
                <p className="text-sm text-white/80">معتمد</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="mb-6 flex gap-3 flex-wrap">
          {["pending", "under_review", "needs_revision", "approved", "all"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-2 rounded-google font-medium transition-all ${
                  filter === status
                    ? "bg-primary-600 text-white shadow-google-md"
                    : "bg-white dark:bg-dark-card text-gray-700 dark:text-dark-text hover:shadow-google-sm"
                }`}
              >
                {getStatusText(status)} (
                {status === "all"
                  ? chapters.length
                  : stats[status as keyof typeof stats] || 0}
                )
              </button>
            ),
          )}
        </div>

        {/* Chapters Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chapters.map((chapter, index) => (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedChapter(chapter)}
              className="bg-white dark:bg-dark-card rounded-google shadow-google-md hover:shadow-google-lg transition-all cursor-pointer overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-primary-600">
                    الفصل {chapter.chapter_number}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(chapter.status)}`}
                  >
                    {getStatusText(chapter.status)}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-medad-ink dark:text-dark-text mb-2 line-clamp-2">
                  {chapter.title}
                </h3>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-dark-text">
                    <User className="w-4 h-4 text-purple-600" />
                    <span>{chapter.student.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-dark-text">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span className="line-clamp-1">
                      {chapter.research.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-dark-text">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span>{chapter.word_count.toLocaleString()} كلمة</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-dark-muted">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(chapter.submitted_at).toLocaleDateString("ar")}
                    </span>
                  </div>
                </div>

                {chapter.comments.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-primary-600">
                    <MessageSquare className="w-4 h-4" />
                    <span>{chapter.comments.length} تعليق</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {chapters.length === 0 && (
          <div className="bg-white dark:bg-dark-card rounded-google shadow-google-md p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 dark:text-dark-muted">
              لا توجد فصول للمراجعة
            </p>
          </div>
        )}

        {/* Chapter Detail Modal */}
        <AnimatePresence>
          {selectedChapter && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedChapter(null)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed inset-4 md:inset-10 lg:inset-20 bg-white dark:bg-dark-card rounded-google shadow-2xl z-50 overflow-auto"
              >
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center justify-between z-10">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedChapter.title}
                    </h2>
                    <p className="text-white/80">
                      الفصل {selectedChapter.chapter_number} -{" "}
                      {selectedChapter.student.name}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedChapter(null)}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-8">
                  {/* Content */}
                  <div className="bg-gray-50 dark:bg-dark-hover rounded-google p-6 mb-6">
                    <h3 className="text-lg font-bold text-medad-ink dark:text-dark-text mb-4">
                      محتوى الفصل
                    </h3>
                    <div className="prose prose-lg dark:prose-invert max-w-none whitespace-pre-wrap">
                      {selectedChapter.content}
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-medad-ink dark:text-dark-text mb-4 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      التعليقات ({selectedChapter.comments.length})
                    </h3>
                    <div className="space-y-3 mb-4">
                      {selectedChapter.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="bg-blue-50 dark:bg-blue-900/20 rounded-google p-4"
                        >
                          <p className="text-gray-900 dark:text-dark-text">
                            {comment.comment}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-dark-muted mt-2">
                            {new Date(comment.created_at).toLocaleString("ar")}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Add Comment */}
                    <div className="flex gap-3">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="أضف تعليقك هنا..."
                        className="flex-1 p-4 border border-medad-border dark:border-dark-border rounded-google focus:ring-2 focus:ring-primary-500 dark:bg-dark-hover dark:text-dark-text"
                        rows={3}
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={submitting || !newComment.trim()}
                        className="px-6 bg-primary-600 text-white rounded-google hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  {selectedChapter.status !== "approved" && (
                    <div className="flex gap-4">
                      <button
                        onClick={() =>
                          handleUpdateStatus(selectedChapter.id, "approved")
                        }
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-google font-medium hover:shadow-google-lg transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        اعتماد الفصل
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            selectedChapter.id,
                            "needs_revision",
                          )
                        }
                        className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-4 rounded-google font-medium hover:shadow-google-lg transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        طلب تعديل
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
