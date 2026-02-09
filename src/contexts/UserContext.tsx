'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

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

  useEffect(() => {
    // تحميل بيانات المستخدم من localStorage
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

    // إذا لم يوجد المستخدم، إنشاء مستخدمين افتراضيين
    if (users.length === 0) {
      const defaultUsers = [
        {
          id: 'prof-1',
          name: 'د. محمد العلي',
          email: 'prof@university.edu',
          password: '123456',
          role: 'professor',
          department: 'علوم الحاسوب',
          students: ['student-1']
        },
        {
          id: 'student-1',
          name: 'أحمد محمد',
          email: 'student@university.edu',
          password: '123456',
          role: 'student',
          department: 'هندسة البرمجيات',
          supervisorId: 'prof-1'
        },
        {
          id: 'admin-1',
          name: 'إدارة النظام',
          email: 'admin@university.edu',
          password: '123456',
          role: 'admin'
        }
      ]
      localStorage.setItem('users', JSON.stringify(defaultUsers))
      
      const tryAgain = defaultUsers.find((u: any) => 
        u.email === email && u.password === password && u.role === role
      )
      if (tryAgain) {
        const { password: _, ...userWithoutPassword } = tryAgain
        setUser(userWithoutPassword as User)
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword))
        return true
      }
    }

    return false
  }

  const register = (name: string, email: string, password: string, role: UserRole): boolean => {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    
    // التحقق من عدم وجود المستخدم
    if (users.some((u: any) => u.email === email)) {
      return false
    }

    const newUser = {
      id: `${role}-${Date.now()}`,
      name,
      email,
      password,
      role,
      ...(role === 'student' && { supervisorId: undefined, department: '' }),
      ...(role === 'professor' && { students: [], department: '' })
    }

    users.push(newUser)
    localStorage.setItem('users', JSON.stringify(users))

    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword as User)
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('currentUser')
  }

  const updateUser = (userData: Partial<User>) => {
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
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
