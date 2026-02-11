"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  GraduationCap,
  BookOpen,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "student" as "student" | "professor" | "admin",
  });
  const [error, setError] = useState("");
  const router = useRouter();
  const { register } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("كلمات المرور غير متطابقة");
      return;
    }

    if (formData.password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.userType,
    );

    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "حدث خطأ أثناء إنشاء الحساب");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-dark-bg dark:via-dark-card dark:to-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-64 h-64 bg-primary-200 dark:bg-primary-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-64 h-64 bg-purple-200 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
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
              إنشاء حساب جديد
            </h2>
            <p className="text-gray-600 dark:text-dark-muted">
              انضم إلى مجتمع الأبحاث الأكاديمية
            </p>
          </div>

          {/* اختيار نوع المستخدم */}
          <div className="mb-6">
            <div className="grid grid-cols-3 gap-2 p-1 bg-medad-paper dark:bg-dark-hover rounded-google">
              {[
                { id: "student" as const, label: "طالب", icon: GraduationCap },
                { id: "professor" as const, label: "أستاذ", icon: BookOpen },
                { id: "admin" as const, label: "مدير", icon: Sparkles },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() =>
                    setFormData({ ...formData, userType: type.id })
                  }
                  className={`py-2 px-2 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-1 ${
                    formData.userType === type.id
                      ? "bg-white dark:bg-dark-card text-primary-600 dark:text-primary-400 shadow-google dark:shadow-dark"
                      : "text-gray-600 dark:text-dark-muted hover:text-medad-ink dark:hover:text-dark-text"
                  }`}
                >
                  <type.icon className="w-4 h-4" />
                  <span className="text-sm">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* الاسم */}
            <div>
              <label className="block text-sm font-medium text-medad-ink dark:text-dark-text mb-2">
                الاسم الكامل
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input-field pr-12"
                  placeholder="أدخل اسمك الكامل"
                  required
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-dark-muted" />
              </div>
            </div>

            {/* البريد الإلكتروني */}
            <div>
              <label className="block text-sm font-medium text-medad-ink dark:text-dark-text mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="input-field pr-12"
                  placeholder="your.email@university.edu"
                  required
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-dark-muted" />
              </div>
            </div>

            {/* كلمة المرور */}
            <div>
              <label className="block text-sm font-medium text-medad-ink dark:text-dark-text mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="input-field pr-12"
                  placeholder="••••••••"
                  required
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-dark-muted" />
              </div>
            </div>

            {/* تأكيد كلمة المرور */}
            <div>
              <label className="block text-sm font-medium text-medad-ink dark:text-dark-text mb-2">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="input-field pr-12"
                  placeholder="••••••••"
                  required
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-dark-muted" />
              </div>
            </div>

            {/* الموافقة على الشروط */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                required
                className="mt-1 w-4 h-4 text-primary-600 dark:text-primary-400 border-medad-border dark:border-dark-border rounded focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
              />
              <span className="text-sm text-gray-600 dark:text-dark-muted">
                أوافق على{" "}
                <Link
                  href="/terms"
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  الشروط والأحكام
                </Link>{" "}
                و{" "}
                <Link
                  href="/privacy"
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  سياسة الخصوصية
                </Link>
              </span>
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

            {/* زر التسجيل */}
            <motion.button
              type="submit"
              className="btn-primary w-full text-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              إنشاء الحساب
            </motion.button>

            {/* رابط تسجيل الدخول */}
            <p className="text-center text-gray-600 dark:text-dark-muted text-sm">
              لديك حساب بالفعل؟{" "}
              <Link
                href="/login"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
              >
                سجل الدخول
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
