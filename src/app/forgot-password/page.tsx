'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // سيتم دمج Supabase لاحقاً
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-[24px] shadow-google-lg p-8 border border-medad-border">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-3 rounded-2xl shadow-lg">
                <BookOpen className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-4xl font-bold text-medad-ink">
                مداد<span className="text-primary-600">.</span>
              </h1>
            </div>
            <h2 className="text-2xl font-bold text-medad-ink mb-2">
              استعادة كلمة المرور
            </h2>
            <p className="text-gray-600">
              {!submitted 
                ? 'أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين'
                : 'تم إرسال رابط إعادة التعيين'
              }
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-medad-ink mb-2">
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
              </div>

              <motion.button
                type="submit"
                className="btn-primary w-full text-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                إرسال رابط إعادة التعيين
              </motion.button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors inline-flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  العودة إلى تسجيل الدخول
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-google p-4 text-center">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-green-800 font-medium mb-2">
                  تم الإرسال بنجاح!
                </p>
                <p className="text-green-700 text-sm">
                  تحقق من بريدك الإلكتروني <strong>{email}</strong> للحصول على رابط إعادة تعيين كلمة المرور.
                </p>
              </div>

              <div className="text-center space-y-3">
                <p className="text-gray-600 text-sm">
                  لم تستلم الرسالة؟
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn-secondary"
                >
                  إعادة الإرسال
                </button>
              </div>

              <div className="text-center pt-4 border-t border-medad-border">
                <Link
                  href="/login"
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors inline-flex items-center gap-2"
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
  )
}
