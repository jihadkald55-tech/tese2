'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  FileText,
  BookOpen,
  Clock,
  Target,
  TrendingUp,
  Sparkles,
  MessageSquare,
  Calendar,
  Award,
  ArrowLeft,
  Users,
  CheckCircle2
} from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { loadUserData } from '@/lib/userDataManager'

export default function DashboardPage() {
  const { user } = useUser()
  const router = useRouter()
  const [researchStats, setResearchStats] = useState({
    wordCount: 0,
    sourcesCount: 0,
    progress: 0 // ✅ حساب ديناميكي
  })

  // ✅ تحميل إحصائيات البحث الحقيقية للمستخدم الحالي
  useEffect(() => {
    if (!user?.id) return
    
    // تحميل محتوى البحث
    const research = loadUserData<any>(user.id, 'research')
    const wordCount = research?.wordCount || 0
    
    // تحميل المصادر
    const sources = loadUserData<any[]>(user.id, 'sources') || []
    const sourcesCount = sources.length
    
    // ✅ حساب نسبة التقدم بشكل واقعي
    let calculatedProgress = 0
    
    // 40% - عدد الكلمات (الهدف: 10000 كلمة)
    if (wordCount > 0) {
      calculatedProgress += Math.min(40, (wordCount / 10000) * 40)
    }
    
    // 30% - عدد المصادر (الهدف: 15 مصدر)
    if (sourcesCount > 0) {
      calculatedProgress += Math.min(30, (sourcesCount / 15) * 30)
    }
    
    // 30% - إكمال المهام في الجدول الزمني
    const schedule = loadUserData<any[]>(user.id, 'schedule') || []
    if (schedule.length > 0) {
      const completed = schedule.filter((e: any) => e.completed).length
      calculatedProgress += (completed / schedule.length) * 30
    }
    
    setResearchStats({
      wordCount,
      sourcesCount,
      progress: Math.round(calculatedProgress)
    })
  }, [user?.id])
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  }

  const stats = [
    {
      id: 1,
      title: 'إجمالي الكلمات',
      value: researchStats.wordCount.toLocaleString('ar-SA'),
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      change: researchStats.wordCount > 0 ? 'من بحثك الحالي' : 'ابدأ الكتابة',
      link: '/dashboard/research'
    },
    {
      id: 2,
      title: 'المصادر',
      value: researchStats.sourcesCount.toString(),
      icon: BookOpen,
      color: 'from-purple-500 to-purple-600',
      change: researchStats.sourcesCount > 0 ? 'مصدر محفوظ' : 'أضف مصادر',
      link: '/dashboard/sources'
    },
    {
      id: 3,
      title: 'التقدم',
      value: `${researchStats.progress}%`,
      icon: Target,
      color: 'from-green-500 to-green-600',
      change: researchStats.progress > 0 ? `${researchStats.progress}% من المشروع` : 'لم تبدأ بعد',
      link: '/dashboard/progress'
    },
    {
      id: 4,
      title: 'الوقت المتبقي',
      value: '45 يوم',
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
      change: 'حتى المناقشة',
      link: '/dashboard/schedule'
    }
  ]

  const recentActivities = [
    {
      id: 1,
      action: 'أضاف تعليقاً جديداً',
      author: 'د. محمد العلي',
      time: 'منذ ساعتين',
      type: 'comment',
      link: '/dashboard/chat'
    },
    {
      id: 2,
      action: 'تم إضافة مصدر جديد',
      author: 'أنت',
      time: 'منذ 5 ساعات',
      type: 'source',
      link: '/dashboard/sources'
    },
    {
      id: 3,
      action: 'تم إكمال الفصل الثالث',
      author: 'أنت',
      time: 'منذ يومين',
      type: 'milestone',
      link: '/dashboard/progress'
    }
  ]

  const nextMilestones = [
    {
      id: 1,
      title: 'مراجعة الفصل الرابع',
      date: '12 فبراير 2026',
      status: 'قريب',
      link: '/dashboard/progress'
    },
    {
      id: 2,
      title: 'اجتماع مع المشرف',
      date: '15 فبراير 2026',
      status: 'مجدول',
      link: '/dashboard/schedule'
    },
    {
      id: 3,
      title: 'تسليم المسودة النهائية',
      date: '28 فبراير 2026',
      status: 'قادم',
      link: '/dashboard/progress'
    }
  ]

  // محتوى مختلف حسب نوع المستخدم
  const statsForProfessor = [
    {
      id: 1,
      title: 'الطلاب المسجلين',
      value: user?.students?.length || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      change: 'تحت إشرافك',
      link: '/dashboard/chat'
    },
    {
      id: 2,
      title: 'الأبحاث النشطة',
      value: user?.students?.length || 0,
      icon: FileText,
      color: 'from-green-500 to-green-600',
      change: 'قيد التنفيذ',
      link: '/dashboard/progress'
    },
    {
      id: 3,
      title: 'التعليقات المعلقة',
      value: '5',
      icon: MessageSquare,
      color: 'from-orange-500 to-orange-600',
      change: 'تحتاج مراجعة',
      link: '/dashboard/chat'
    },
    {
      id: 4,
      title: 'الأبحاث المكتملة',
      value: '12',
      icon: CheckCircle2,
      color: 'from-purple-500 to-purple-600',
      change: 'هذا العام',
      link: '/dashboard/progress'
    }
  ]

  const displayStats = user?.role === 'professor' ? statsForProfessor : stats

  // دوال الإجراءات السريعة
  const quickActions = [
    { 
      icon: FileText, 
      label: 'كتابة جديدة', 
      color: 'primary',
      onClick: () => router.push('/dashboard/research')
    },
    { 
      icon: BookOpen, 
      label: 'إضافة مصدر', 
      color: 'purple',
      onClick: () => router.push('/dashboard/sources')
    },
    { 
      icon: MessageSquare, 
      label: 'مراسلة المشرف', 
      color: 'green',
      onClick: () => router.push('/dashboard/chat')
    },
    { 
      icon: Calendar, 
      label: 'جدولة اجتماع', 
      color: 'orange',
      onClick: () => router.push('/dashboard/schedule')
    }
  ]

  const handleStartWriting = () => {
    router.push('/dashboard/research')
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-medad-ink dark:text-dark-text">
            مرحباً، {user?.name || 'ضيف'} 👋
          </h1>
          {user?.role === 'student' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartWriting}
              className="btn-primary flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>ابدأ الكتابة</span>
            </motion.button>
          )}
        </div>
        {user?.role === 'student' ? (
          <p className="text-gray-600 dark:text-dark-muted text-lg">
            لنواصل العمل على بحثك: &quot;تطبيقات الذكاء الاصطناعي في التعليم&quot;
          </p>
        ) : user?.role === 'professor' ? (
          <p className="text-gray-600 dark:text-dark-muted text-lg">
            لديك {user.students?.length || 0} طالب تحت إشرافك
          </p>
        ) : (
          <p className="text-gray-600 dark:text-dark-muted text-lg">
            لوحة تحكم إدارة النظام
          </p>
        )}
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {displayStats.map((stat, index) => (
          <motion.div
            key={stat.id}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            onClick={() => stat.link && router.push(stat.link)}
            className="card p-6 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500 dark:text-green-400" />
            </div>
            <h3 className="text-gray-600 dark:text-dark-muted text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-3xl font-bold text-medad-ink dark:text-dark-text mb-2">{stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-dark-muted">{stat.change}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="lg:col-span-2 card p-6">
          <h2 className="text-xl font-bold text-medad-ink dark:text-dark-text mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            إجراءات سريعة
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={index}
                onClick={action.onClick}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 p-4 bg-medad-paper dark:bg-dark-hover hover:bg-medad-hover dark:hover:bg-dark-border rounded-google transition-all border border-medad-border dark:border-dark-border group"
              >
                <div className={`bg-${action.color}-100 dark:bg-${action.color}-900/30 p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                  <action.icon className={`w-5 h-5 text-${action.color}-600 dark:text-${action.color}-400`} />
                </div>
                <span className="font-medium text-medad-ink dark:text-dark-text">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Next Milestones */}
        <motion.div variants={itemVariants} className="card p-6">
          <h2 className="text-xl font-bold text-medad-ink dark:text-dark-text mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            المعالم القادمة
          </h2>
          <div className="space-y-3">
            {nextMilestones.map((milestone) => (
              <motion.div
                key={milestone.id}
                whileHover={{ x: 5 }}
                onClick={() => milestone.link && router.push(milestone.link)}
                className="p-3 bg-medad-paper dark:bg-dark-hover rounded-lg hover:bg-medad-hover dark:hover:bg-dark-border transition-all cursor-pointer border border-medad-border dark:border-dark-border"
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-medium text-medad-ink dark:text-dark-text text-sm">{milestone.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    milestone.status === 'قريب' 
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' 
                      : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  }`}>
                    {milestone.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-dark-muted flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {milestone.date}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activities */}
      <motion.div variants={itemVariants} className="card p-6">
        <h2 className="text-xl font-bold text-medad-ink dark:text-dark-text mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          النشاطات الأخيرة
        </h2>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <motion.div
              key={activity.id}
              whileHover={{ x: 5 }}
              onClick={() => activity.link && router.push(activity.link)}
              className="flex items-start gap-4 p-4 bg-medad-paper dark:bg-dark-hover rounded-google hover:bg-medad-hover dark:hover:bg-dark-border transition-all cursor-pointer"
            >
              <div className={`p-2 rounded-lg ${
                activity.type === 'comment' ? 'bg-blue-100 dark:bg-blue-900/30' :
                activity.type === 'source' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-green-100 dark:bg-green-900/30'
              }`}>
                {activity.type === 'comment' && <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                {activity.type === 'source' && <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                {activity.type === 'milestone' && <Award className="w-5 h-5 text-green-600 dark:text-green-400" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-medad-ink dark:text-dark-text">{activity.action}</p>
                <p className="text-sm text-gray-500 dark:text-dark-muted">{activity.author} • {activity.time}</p>
              </div>
              <ArrowLeft className="w-5 h-5 text-gray-400 dark:text-dark-muted" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Motivation Quote */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden bg-gradient-to-br from-primary-500 to-purple-600 rounded-[24px] p-8 text-white shadow-google-lg"
      >
        <div className="relative z-10">
          <Sparkles className="w-8 h-8 mb-4 opacity-80" />
          <h3 className="text-2xl font-bold mb-2">
            &quot;النجاح هو مجموع الجهود الصغيرة المتكررة يوماً بعد يوم&quot;
          </h3>
          <p className="text-primary-100">
            استمر في العمل الجيد! أنت تقترب من تحقيق هدفك 🎯
          </p>
        </div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>
      </motion.div>
    </motion.div>
  )
}
