'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Notification {
  id: string
  type: 'message' | 'deadline' | 'research' | 'system'
  title: string
  message: string
  timestamp: string
  read: boolean
  link?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // تحميل الإشعارات من localStorage
  useEffect(() => {
    const saved = localStorage.getItem('notifications')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setNotifications(parsed)
        setUnreadCount(parsed.filter((n: Notification) => !n.read).length)
      } catch (error) {
        console.error('Error loading notifications:', error)
      }
    }

    // إنشاء إشعارات تجريبية في أول مرة
    const hasInitialized = localStorage.getItem('notificationsInitialized')
    if (!hasInitialized) {
      const demoNotifications: Notification[] = [
        {
          id: '1',
          type: 'message',
          title: 'رسالة جديدة',
          message: 'المشرف أرسل لك رسالة حول البحث',
          timestamp: new Date().toISOString(),
          read: false,
          link: '/dashboard/chat'
        },
        {
          id: '2',
          type: 'deadline',
          title: 'موعد نهائي قريب',
          message: 'تبقى 3 أيام على موعد تسليم الفصل الأول',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false,
          link: '/dashboard/schedule'
        },
        {
          id: '3',
          type: 'research',
          title: 'تم الحفظ التلقائي',
          message: 'تم حفظ بحثك تلقائياً',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          read: true,
          link: '/dashboard/research'
        }
      ]
      setNotifications(demoNotifications)
      setUnreadCount(2)
      localStorage.setItem('notifications', JSON.stringify(demoNotifications))
      localStorage.setItem('notificationsInitialized', 'true')
    }
  }, [])

  // حفظ الإشعارات في localStorage
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications))
    }
  }, [notifications])

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    }
    
    setNotifications(prev => [newNotification, ...prev])
    setUnreadCount(prev => prev + 1)

    // إشعار متصفح
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon.png'
      })
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id)
      const newNotifications = prev.filter(n => n.id !== id)
      
      if (notification && !notification.read) {
        setUnreadCount(prevCount => Math.max(0, prevCount - 1))
      }
      
      return newNotifications
    })
  }

  const clearAll = () => {
    setNotifications([])
    setUnreadCount(0)
    localStorage.removeItem('notifications')
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    // Return default values during SSR/build time
    if (typeof window === 'undefined') {
      return {
        notifications: [],
        unreadCount: 0,
        addNotification: () => {},
        markAsRead: () => {},
        markAllAsRead: () => {},
        deleteNotification: () => {},
        clearAll: () => {},
      }
    }
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}
