'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Target,
  TrendingUp,
  Award,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  BookOpen,
  MessageSquare,
  ArrowRight
} from 'lucide-react'

export default function ProgressPage() {
  const router = useRouter()
  const overallProgress = 65

  const chapters = [
    { id: 1, name: 'المقدمة', progress: 100, status: 'completed', words: 2500, deadline: '2026-01-15' },
    { id: 2, name: 'الإطار النظري', progress: 100, status: 'completed', words: 4200, deadline: '2026-01-25' },
    { id: 3, name: 'الدراسات السابقة', progress: 85, status: 'in-progress', words: 3800, deadline: '2026-02-10' },
    { id: 4, name: 'المنهجية', progress: 45, status: 'in-progress', words: 1800, deadline: '2026-02-20' },
    { id: 5, name: 'النتائج والتحليل', progress: 0, status: 'pending', words: 0, deadline: '2026-03-01' },
    { id: 6, name: 'الخاتمة والتوصيات', progress: 0, status: 'pending', words: 0, deadline: '2026-03-15' }
  ]

  const milestones = [
    {
      id: 1,
      title: 'اقتراح البحث',
      date: '2025-12-01',
      status: 'completed',
      description: 'تمت الموافقة على اقتراح البحث'
    },
    {
      id: 2,
      title: 'اكتمال الفصول النظرية',
      date: '2026-01-25',
      status: 'completed',
      description: 'إنهاء الإطار النظري والدراسات السابقة'
    },
    {
      id: 3,
      title: 'مراجعة منتصف المدة',
      date: '2026-02-15',
      status: 'upcoming',
      description: 'اجتماع مراجعة التقدم مع المشرف'
    },
    {
      id: 4,
      title: 'اكتمال جمع البيانات',
      date: '2026-02-28',
      status: 'upcoming',
      description: 'إنهاء جمع وتحليل البيانات'
    },
    {
      id: 5,
      title: 'تسليم المسودة النهائية',
      date: '2026-03-20',
      status: 'upcoming',
      description: 'تسليم البحث الكامل للمراجعة'
    },
    {
      id: 6,
      title: 'المناقشة النهائية',
      date: '2026-04-10',
      status: 'upcoming',
      description: 'موعد مناقشة البحث'
    }
  ]

  const stats = [
    {
      label: 'الكلمات المكتوبة',
      value: '12,300',
      target: '20,000',
      icon: FileText,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'الفصول المكتملة',
      value: '2/6',
      progress: 33,
      icon: BookOpen,
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'التعليقات المعلقة',
      value: '3',
      icon: MessageSquare,
      color: 'from-orange-500 to-orange-600'
    },
    {
      label: 'الأيام المتبقية',
      value: '61',
      subtitle: 'حتى المناقشة',
      icon: Clock,
      color: 'from-purple-500 to-purple-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 dark:text-dark-muted hover:text-medad-primary dark:hover:text-primary-400 transition-colors"
      >
        <ArrowRight className="w-5 h-5" />
        <span>رجوع</span>
      </button>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-medad-ink dark:text-dark-text mb-2">
          تقدم البحث
        </h1>
        <p className="text-gray-600 dark:text-dark-muted">
          تتبع تقدمك ومعالمك البحثية
        </p>
      </div>

      {/* Overall Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8 bg-gradient-to-br from-primary-500 to-purple-600 text-white"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">التقدم الإجمالي</h2>
            <p className="text-primary-100">أنت في المسار الصحيح! 🎯</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold mb-2">{overallProgress}%</div>
            <div className="flex items-center gap-2 text-primary-100">
              <TrendingUp className="w-5 h-5" />
              <span>+15% هذا الشهر</span>
            </div>
          </div>
        </div>
        <div className="h-4 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full bg-white dark:bg-dark-text rounded-full"
          />
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6"
          >
            <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl w-fit mb-4`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-gray-600 dark:text-dark-muted text-sm mb-2">{stat.label}</p>
            <p className="text-2xl font-bold text-medad-ink dark:text-dark-text mb-1">
              {stat.value}
            </p>
            {stat.target && (
              <p className="text-sm text-gray-500 dark:text-dark-muted">من {stat.target}</p>
            )}
            {stat.subtitle && (
              <p className="text-sm text-gray-500 dark:text-dark-muted">{stat.subtitle}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Chapters Progress */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-medad-ink dark:text-dark-text mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          تقدم الفصول
        </h2>
        <div className="space-y-4">
          {chapters.map((chapter, index) => (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-medad-paper dark:bg-dark-hover rounded-google hover:bg-medad-hover dark:hover:bg-dark-border transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {chapter.status === 'completed' ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : chapter.status === 'in-progress' ? (
                    <Clock className="w-6 h-6 text-orange-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400 dark:text-dark-muted" />
                  )}
                  <div>
                    <h3 className="font-bold text-medad-ink dark:text-dark-text">
                      الفصل {chapter.id}: {chapter.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-dark-muted mt-1">
                      <span>{chapter.words.toLocaleString()} كلمة</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {chapter.deadline}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  {chapter.progress}%
                </span>
              </div>
              <div className="h-2 bg-white dark:bg-dark-bg rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${chapter.progress}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`h-full ${
                    chapter.progress === 100
                      ? 'bg-green-500'
                      : chapter.progress > 50
                      ? 'bg-primary-500'
                      : 'bg-orange-500'
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Milestones Timeline */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-medad-ink dark:text-dark-text mb-6 flex items-center gap-2">
          <Award className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          المعالم الرئيسية
        </h2>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute right-6 top-0 bottom-0 w-0.5 bg-medad-border dark:bg-dark-border"></div>
          
          <div className="space-y-6">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pr-16"
              >
                <div
                  className={`absolute right-4 w-5 h-5 rounded-full border-4 border-white dark:border-dark-card ${
                    milestone.status === 'completed'
                      ? 'bg-green-500'
                      : milestone.status === 'upcoming'
                      ? 'bg-primary-500'
                      : 'bg-gray-300'
                  }`}
                ></div>
                <div className="p-4 bg-medad-paper dark:bg-dark-hover rounded-google">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-medad-ink dark:text-dark-text">{milestone.title}</h3>
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      milestone.status === 'completed'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : milestone.status === 'upcoming'
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}>
                      {milestone.status === 'completed' ? 'مكتمل' : 'قادم'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-dark-muted mb-2">{milestone.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-muted">
                    <Calendar className="w-4 h-4" />
                    <span>{milestone.date}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
