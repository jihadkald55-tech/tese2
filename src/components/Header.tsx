'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, Menu, Sun, Moon, X, MessageSquare, Clock, FileText, CheckCheck } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useNotifications } from '@/contexts/NotificationContext'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications()
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-5 h-5 text-blue-500" />
      case 'deadline':
        return <Clock className="w-5 h-5 text-red-500" />
      case 'research':
        return <FileText className="w-5 h-5 text-green-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'الآن'
    if (minutes < 60) return `منذ ${minutes} دقيقة`
    if (hours < 24) return `منذ ${hours} ساعة`
    return `منذ ${days} يوم`
  }

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id)
    if (notification.link) {
      router.push(notification.link)
      setShowNotifications(false)
    }
  }

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border-b border-medad-border dark:border-dark-border shadow-sm">
      <div className="px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          {/* Search Bar - Hidden on mobile, shown on tablet+ */}
          <div className="hidden md:flex flex-1 max-w-2xl">
            <div className="relative w-full">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث في مصادرك، ملاحظاتك، أو اسأل المساعد الذكي..."
                className="w-full pr-12 pl-4 py-3 bg-medad-paper dark:bg-dark-hover border border-medad-border dark:border-dark-border rounded-google focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          
          {/* Mobile Search Icon */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="md:hidden p-2.5 hover:bg-medad-hover dark:hover:bg-dark-hover rounded-google transition-colors"
          >
            <Search className="w-5 h-5 text-gray-600 dark:text-dark-text" />
          </motion.button>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2.5 hover:bg-medad-hover dark:hover:bg-dark-hover rounded-google transition-colors"
              title={theme === 'light' ? 'التبديل للوضع الداكن' : 'التبديل للوضع الفاتح'}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-dark-text" />
              ) : (
                <Sun className="w-5 h-5 text-gray-600 dark:text-dark-text" />
              )}
            </motion.button>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 hover:bg-medad-hover dark:hover:bg-dark-hover rounded-google transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-dark-text" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Notification Panel */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="fixed md:absolute left-4 right-4 md:left-0 md:right-auto mt-2 md:w-96 bg-white dark:bg-dark-card rounded-lg shadow-2xl border border-medad-border dark:border-dark-border overflow-hidden z-50"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-medad-border dark:border-dark-border">
                      <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-medad-ink dark:text-dark-text" />
                        <h3 className="font-bold text-medad-ink dark:text-dark-text">الإشعارات</h3>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                        >
                          <CheckCheck className="w-4 h-4" />
                          <span className="hidden sm:inline">قراءة الكل</span>
                        </button>
                      )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-dark-muted" />
                          <p className="text-gray-500 dark:text-dark-muted">لا توجد إشعارات</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`p-4 border-b border-medad-border dark:border-dark-border last:border-b-0 cursor-pointer transition-colors ${
                              !notification.read 
                                ? 'bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20' 
                                : 'hover:bg-medad-hover dark:hover:bg-dark-hover'
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex gap-3">
                              <div className="flex-shrink-0 mt-1">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h4 className="font-semibold text-medad-ink dark:text-dark-text">
                                    {notification.title}
                                  </h4>
                                  {!notification.read && (
                                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-dark-muted mb-2">
                                  {notification.message}
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500 dark:text-dark-muted">
                                    {formatTimestamp(notification.timestamp)}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      deleteNotification(notification.id)
                                    }}
                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                  >
                                    <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMenuClick}
              className="lg:hidden p-2.5 hover:bg-medad-hover dark:hover:bg-dark-hover rounded-google transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-dark-text" />
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  )
}
