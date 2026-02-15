"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Lock,
  Eye,
  EyeOff,
  BookOpen,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // التحقق من صحة الرمز عند تحميل الصفحة
    const checkToken = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        // تحقق من أن المستخدم لديه جلسة نشطة
        if (sessionError) {
          console.error("Session error:", sessionError);
          setError("حدث خطأ في التحقق من الرابط");
          setIsValidToken(false);
        } else if (!session?.user) {
          setError(
            "رابط إعادة التعيين غير صحيح أو منتهي الصلاحية. يرجى طلب رابط جديد.",
          );
          setIsValidToken(false);
        } else {
          setIsValidToken(true);
        }
      } catch (err) {
        console.error("Token check error:", err);
        setError("حدث خطأ في التحقق من الرابط");
        setIsValidToken(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    if (password !== confirmPassword) {
      setError("كلمات المرور غير متطابقة");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setSuccess(true);

      // إعادة توجيه لتسجيل الدخول بعد 3 ثوانٍ
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError(err.message || "حدث خطأ أثناء تغيير كلمة المرور");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-dark-bg dark:via-dark-card dark:to-dark-bg flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-primary-600 dark:text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-dark-muted">
            جارٍ التحقق من الرابط...
          </p>
        </motion.div>
      </div>
    );
  }

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
              إعادة تعيين كلمة المرور
            </h2>
            <p className="text-gray-600 dark:text-dark-muted">
              {success
                ? "تم تغيير كلمة المرور بنجاح"
                : "أدخل كلمة المرور الجديدة"}
            </p>
          </div>

          {!isValidToken ? (
            <div className="space-y-6">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-google text-center">
                <p className="text-red-600 dark:text-red-400 font-medium mb-2">
                  رابط غير صحيح
                </p>
                <p className="text-red-700 dark:text-red-400 text-sm">
                  {error ||
                    "الرابط غير صحيح أو منتهي الصلاحية. يرجى طلب رابط جديد."}
                </p>
              </div>

              <Link
                href="/forgot-password"
                className="btn-primary w-full text-center block"
              >
                طلب رابط جديد
              </Link>
            </div>
          ) : success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-google p-6 text-center">
                <div className="bg-green-100 dark:bg-green-900/40 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-green-800 dark:text-green-300 font-medium mb-2 text-lg">
                  تم تغيير كلمة المرور بنجاح!
                </p>
                <p className="text-green-700 dark:text-green-400 text-sm">
                  سيتم إعادة توجيهك لتسجيل الدخول...
                </p>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* كلمة المرور الجديدة */}
              <div>
                <label className="block text-sm font-medium text-medad-ink dark:text-dark-text mb-2">
                  كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-12"
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    required
                    minLength={6}
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-dark-muted" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-muted hover:text-medad-ink dark:hover:text-dark-text transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* تأكيد كلمة المرور */}
              <div>
                <label className="block text-sm font-medium text-medad-ink dark:text-dark-text mb-2">
                  تأكيد كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pr-12"
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    required
                    minLength={6}
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-dark-muted" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isSubmitting}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-muted hover:text-medad-ink dark:hover:text-dark-text transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* متطلبات كلمة المرور */}
              <div className="text-sm space-y-1">
                <p className="text-gray-600 dark:text-dark-muted font-medium">
                  متطلبات كلمة المرور:
                </p>
                <ul className="text-gray-500 dark:text-dark-muted space-y-1">
                  <li
                    className={
                      password.length >= 6
                        ? "text-green-600 dark:text-green-400"
                        : ""
                    }
                  >
                    • 6 أحرف على الأقل
                  </li>
                  <li
                    className={
                      password === confirmPassword && password
                        ? "text-green-600 dark:text-green-400"
                        : ""
                    }
                  >
                    • كلمات المرور متطابقة
                  </li>
                </ul>
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

              {/* زر الحفظ */}
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
                    جارٍ الحفظ...
                  </>
                ) : (
                  "حفظ كلمة المرور"
                )}
              </motion.button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
