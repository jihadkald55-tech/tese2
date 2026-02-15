"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, BookOpen, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSubmitted(true);
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError(err.message || "حدث خطأ أثناء إرسال رابط إعادة التعيين");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-dark-bg dark:via-dark-card dark:to-dark-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-dark-card rounded-[24px] shadow-google-lg dark:shadow-dark p-8 border border-medad-border dark:border-dark-border">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-3 rounded-2xl shadow-lg">
                <BookOpen className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-4xl font-bold text-medad-ink dark:text-dark-text">
                مداد
                <span className="text-primary-600 dark:text-primary-400">
                  .
                </span>
              </h1>
            </div>
            <h2 className="text-2xl font-bold text-medad-ink dark:text-dark-text mb-2">
              استعادة كلمة المرور
            </h2>
            <p className="text-gray-600 dark:text-dark-muted">
              {!submitted
                ? "أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين"
                : "تم إرسال رابط إعادة التعيين"}
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-medad-ink dark:text-dark-text mb-2">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pr-12"
                    placeholder="your.email@university.edu"
                    disabled={isSubmitting}
                    required
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-dark-muted" />
                </div>
              </div>

              {/* رسالة الخطأ */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-google text-red-600 dark:text-red-400 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full text-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جارٍ الإرسال...
                  </>
                ) : (
                  "إرسال رابط إعادة التعيين"
                )}
              </motion.button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors inline-flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  العودة إلى تسجيل الدخول
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-google p-4 text-center">
                <div className="bg-green-100 dark:bg-green-900/40 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-green-800 dark:text-green-300 font-medium mb-2">
                  تم الإرسال بنجاح!
                </p>
                <p className="text-green-700 dark:text-green-400 text-sm">
                  تحقق من بريدك الإلكتروني <strong>{email}</strong> للحصول على
                  رابط إعادة تعيين كلمة المرور.
                </p>
              </div>

              <div className="text-center space-y-3">
                <p className="text-gray-600 dark:text-dark-muted text-sm">
                  لم تستلم الرسالة؟
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setError("");
                  }}
                  className="btn-secondary"
                >
                  إعادة الإرسال
                </button>
              </div>

              <div className="text-center pt-4 border-t border-medad-border dark:border-dark-border">
                <Link
                  href="/login"
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors inline-flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  العودة إلى تسجيل الدخول
                </Link>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
