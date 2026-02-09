'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { saveUserData, loadUserData } from '@/lib/userDataManager'
import { useUser } from './UserContext'

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
  const { user } = useUser()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  // تحميل الإشعارات من localStorage للمستخدم الحالي فقط
  useEffect(() => {
    setMounted(true)
    if (typeof window === 'undefined' || !user?.id) return
    
    const userNotifications = loadUserData<Notification[]>(user.id, 'notifications')
    if (userNotifications && userNotifications.length > 0) {
      setNotifications(userNotifications)
      setUnreadCount(userNotifications.filter((n: Notification) => !n.read).length)
    } else {
      // ✅ مستخدم جديد = لا إشعارات (وليس إشعارات وهمية)
      setNotifications([])
      setUnreadCount(0)
    }
  }, [user?.id])

  // حفظ الإشعارات في localStorage للمستخدم الحالي
  useEffect(() => {
    if (typeof window === 'undefined' || !user?.id) return
    if (notifications.length > 0 || mounted) {
      saveUserData(user.id, 'notifications', notifications)
    }
  }, [notifications, user?.id, mounted])

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
