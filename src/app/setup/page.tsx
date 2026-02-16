import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-dark-bg dark:to-dark-bg p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            إعداد بدء التشغيل
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            حسابات اختبارية للبدء السريع
          </p>
        </div>

        {/* Main Setup Card */}
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Option 1 */}
            <div className="border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 hover:border-blue-400 dark:hover:border-blue-600 transition-colors">
              <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                ✨ الخيار 1: الطريقة السريعة
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                إنشاء حساب جديد مباشرة من خلال صفحة التسجيل
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400 text-sm mb-6">
                <li>اضغط على رابط التسجيل أدناه</li>
                <li>أدخل بيانات تسجيل جديدة</li>
                <li>اختر نوع المستخدم (طالب/أستاذ/مدير)</li>
                <li>انقر "إنشاء الحساب"</li>
              </ol>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                اذهب للتسجيل
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Option 2 */}
            <div className="border-2 border-green-200 dark:border-green-800 rounded-xl p-6 hover:border-green-400 dark:hover:border-green-600 transition-colors">
              <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
                ⚡ الخيار 2: حسابات جاهزة
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                إنشاء حسابات اختبارية تلقائية (يتطلب إعداد)
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400 text-sm mb-6">
                <li>أضف SUPABASE_SERVICE_KEY إلى .env.local</li>
                <li>شغّل الخادم: npm run dev</li>
                <li>افتح: /api/setup</li>
                <li>ستُنشأ الحسابات تلقائيًا</li>
              </ol>
              <details className="cursor-pointer">
                <summary className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium inline-flex items-center gap-2">
                  اطلب المساعدة
                  <ArrowRight className="w-4 h-4" />
                </summary>
                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                  <p className="mb-2">
                    1. اذهب إلى Supabase Dashboard → Settings → API
                  </p>
                  <p className="mb-2">2. انسخ "Service role key"</p>
                  <p className="mb-2">3. أضفه في .env.local</p>
                  <code className="block bg-gray-200 dark:bg-gray-900 p-2 rounded mt-2 text-xs">
                    SUPABASE_SERVICE_KEY=your_key_here
                  </code>
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* Test Credentials */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-300 mb-4">
            📝 حسابات الاختبار الافتراضية
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                type: "طالب",
                email: "student@university.edu",
                password: "123456",
              },
              {
                type: "أستاذ",
                email: "prof@university.edu",
                password: "123456",
              },
              {
                type: "مدير",
                email: "admin@university.edu",
                password: "123456",
              },
            ].map((account, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-dark-card p-4 rounded-lg border border-yellow-100 dark:border-yellow-900"
              >
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  {account.type}
                </p>
                <p className="font-mono text-sm text-gray-900 dark:text-white mt-1">
                  {account.email}
                </p>
                <p className="font-mono text-sm text-gray-900 dark:text-white">
                  {account.password}
                </p>
              </div>
            ))}
          </div>
          <p className="text-sm text-yellow-700 dark:text-yellow-200 mt-4">
            ⚠️ هذه الحسابات قد تكون موجودة أم لا في النظام الحالي. استخدم الخيار
            1 أو 2 أعلاه لضمان وجود حسابات.
          </p>
        </div>

        {/* Back to Login */}
        <div className="text-center">
          <Link
            href="/login"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            ← العودة إلى صفحة تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
