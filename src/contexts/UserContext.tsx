'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { initializeNewUser, cleanupLegacyData } from '@/lib/userDataManager'

export type UserRole = 'student' | 'professor' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  department?: string
  supervisorId?: string // للطالب - معرف المشرف
  students?: string[] // للأستاذ - قائمة الطلاب
}

interface UserContextType {
  user: User | null
  login: (email: string, password: string, role: UserRole) => boolean
  logout: () => void
  register: (name: string, email: string, password: string, role: UserRole) => boolean
  updateUser: (userData: Partial<User>) => void
  isAuthenticated: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // تحميل بيانات المستخدم من localStorage
    if (typeof window === 'undefined') return
    
    // تنظيف البيانات القديمة غير المعزولة (مرة واحدة)
    const hasCleanedUp = localStorage.getItem('data_cleanup_done')
    if (!hasCleanedUp) {
      cleanupLegacyData()
      localStorage.setItem('data_cleanup_done', 'true')
    }
    
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    }
  }, [])

  const login = (email: string, password: string, role: UserRole): boolean => {
    // التحقق من المستخدمين المسجلين
    if (typeof window === 'undefined') return false
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const foundUser = users.find((u: any) => 
      u.email === email && u.password === password && u.role === role
    )

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword as User)
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword))
      return true
    }

    // ✅ حُذف: لا مستخدمين افتراضيين
    // المستخدمون الحقيقيون فقط يمكنهم تسجيل الدخول
    
    return false
  }

  const register = (name: string, email: string, password: string, role: UserRole): boolean => {
    if (typeof window === 'undefined') return false
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    
    // التحقق من عدم وجود المستخدم
    if (users.some((u: any) => u.email === email)) {
      return false
    }

    const newUser = {
      id: `${role}-${Date.now()}`,
      name,
      email,
      password, // ⚠️ TODO: يجب hash في بيئة إنتاج حقيقية
      role,
      ...(role === 'student' && { supervisorId: undefined, department: '' }),
      ...(role === 'professor' && { students: [], department: '' })
    }

    users.push(newUser)
    localStorage.setItem('users', JSON.stringify(users))

    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword as User)
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword))
    
    // ✅ تهيئة بيانات المستخدم الجديد (فارغة)
    initializeNewUser(newUser.id)
    
    return true
  }

  const logout = () => {
    if (typeof window === 'undefined') return
    setUser(null)
    localStorage.removeItem('currentUser')
  }

  const updateUser = (userData: Partial<User>) => {
    if (typeof window === 'undefined') return
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      
      // تحديث في قائمة المستخدمين
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const index = users.findIndex((u: any) => u.id === user.id)
      if (index !== -1) {
        users[index] = { ...users[index], ...userData }
        localStorage.setItem('users', JSON.stringify(users))
      }
    }
  }

  return (
    <UserContext.Provider value={{
      user,
      login,
      logout,
      register,
      updateUser,
      isAuthenticated: !!user
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    // Return default values during SSR/build time
    if (typeof window === 'undefined') {
      return {
        user: null,
        login: () => false,
        logout: () => {},
        register: () => false,
        updateUser: () => {},
        isAuthenticated: false,
      }
    }
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
