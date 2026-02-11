"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  BookOpen,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<"student" | "professor" | "admin">(
    "student",
  );
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useUser();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await login(email, password, userType);

    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "البريد الإلكتروني أو كلمة المرور غير صحيحة");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-dark-bg dark:via-dark-card dark:to-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
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
          className="absolute bottom-20 left-20 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
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
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-6xl grid md:grid-cols-2 gap-8 relative z-10"
      >
        {/* القسم الأيمن - الترحيب والإلهام */}
        <motion.div
          variants={itemVariants}
          className="hidden md:flex flex-col justify-center p-12 bg-white/40 dark:bg-dark-card/40 backdrop-blur-sm rounded-[24px] border border-white/60 dark:border-dark-border shadow-google-lg"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-3 rounded-2xl shadow-lg">
                <BookOpen className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-5xl font-bold text-medad-ink">
                مداد<span className="text-primary-600">.</span>
              </h1>
            </div>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-3xl font-bold text-medad-ink dark:text-dark-text mb-4 leading-relaxed"
          >
            رحلة بحثك الأكاديمي
            <br />
            <span className="text-primary-600 dark:text-primary-400">
              تبدأ من هنا
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-lg text-gray-600 dark:text-dark-muted mb-8 leading-relaxed"
          >
            نظام متكامل لإدارة أبحاث التخرج بتجربة ملهمة واحترافية، مصمم خصيصاً
            للبيئة الأكاديمية العربية
          </motion.p>

          <motion.div variants={itemVariants} className="space-y-4">
            {[
              { icon: Sparkles, text: "مساعد ذكي لدعم بحثك" },
              { icon: BookOpen, text: "إدارة مصادر ومراجع متقدمة" },
              { icon: GraduationCap, text: "تواصل مباشر مع المشرف" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex items-center gap-3 text-medad-ink dark:text-dark-text"
                whileHover={{ x: 10, transition: { duration: 0.2 } }}
              >
                <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg">
                  <feature.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <span className="font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* القسم الأيسر - نموذج تسجيل الدخول */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-dark-card rounded-[24px] shadow-google-lg dark:shadow-dark p-8 md:p-12 border border-medad-border dark:border-dark-border"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <h3 className="text-3xl font-bold text-medad-ink dark:text-dark-text mb-2">
              مرحباً بعودتك
            </h3>
            <p className="text-gray-600 dark:text-dark-muted">
              قم بتسجيل الدخول للمتابعة
            </p>
          </motion.div>

          {/* اختيار نوع المستخدم */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="grid grid-cols-3 gap-2 p-1 bg-medad-paper dark:bg-dark-hover rounded-google">
              {[
                { id: "student" as const, label: "طالب", icon: GraduationCap },
                { id: "professor" as const, label: "أستاذ", icon: BookOpen },
                { id: "admin" as const, label: "مدير", icon: Sparkles },
              ].map((type) => (
                <motion.button
                  key={type.id}
                  onClick={() => setUserType(type.id)}
                  className={`py-2.5 px-4 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    userType === type.id
                      ? "bg-white dark:bg-dark-bg text-primary-600 dark:text-primary-400 shadow-google dark:shadow-dark"
                      : "text-gray-600 dark:text-dark-muted hover:text-medad-ink dark:hover:text-dark-text"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <type.icon className="w-4 h-4" />
                  <span>{type.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* حقل البريد الإلكتروني */}
            <motion.div variants={itemVariants}>
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
                  required
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </motion.div>

            {/* حقل كلمة المرور */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-medad-ink dark:text-dark-text mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  required
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-muted hover:text-medad-ink dark:hover:text-dark-text transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* تذكرني ونسيت كلمة المرور */}
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-between"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 border-medad-border dark:border-dark-border rounded focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600 dark:text-dark-muted">
                  تذكرني
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-500 font-medium transition-colors"
              >
                نسيت كلمة المرور؟
              </Link>
            </motion.div>

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

            {/* زر تسجيل الدخول */}
            <motion.button
              variants={itemVariants}
              type="submit"
              className="btn-primary w-full text-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              تسجيل الدخول
            </motion.button>

            {/* حسابات تجريبية */}
            <motion.div
              variants={itemVariants}
              className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-google"
            >
              <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-2">
                💡 حسابات تجريبية للاختبار:
              </p>
              <div className="space-y-1 text-xs text-blue-700 dark:text-blue-400">
                <p>• طالب: student@university.edu / 123456</p>
                <p>• أستاذ: prof@university.edu / 123456</p>
                <p>• مدير: admin@university.edu / 123456</p>
              </div>
            </motion.div>

            {/* رابط التسجيل */}
            <motion.p
              variants={itemVariants}
              className="text-center text-gray-600 dark:text-dark-muted text-sm"
            >
              ليس لديك حساب؟{" "}
              <Link
                href="/register"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-500 font-medium transition-colors"
              >
                سجل الآن
              </Link>
            </motion.p>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
