"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export type UserRole = "student" | "professor" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  supervisorId?: string;
  students?: string[];
}

interface UserContextType {
  user: User | null;
  login: (email: string, password: string, role?: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ) => Promise<boolean>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // تحميل بيانات المستخدم من قاعدة البيانات
  const loadUserData = async (authUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (error) throw error;

      if (data) {
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.user_type as UserRole,
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  useEffect(() => {
    // التحقق من الجلسة الحالية
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserData(session.user);
      }
      setLoading(false);
    });

    // الاستماع لتغييرات المصادقة
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadUserData(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (
    email: string,
    password: string,
    role?: UserRole,
  ): Promise<boolean> => {
    try {
      setLoading(true);

      // تسجيل الدخول عبر Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await loadUserData(data.user);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ): Promise<boolean> => {
    try {
      setLoading(true);

      // إنشاء حساب مستخدم جديد في Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            user_type: role,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // سيتم إنشاء المستخدم في جدول users تلقائياً عبر trigger
        // لكن في حالة لم يتم، نقوم بإنشائه يدوياً
        const { error: insertError } = await supabase.from("users").upsert({
          id: data.user.id,
          email,
          name,
          user_type: role,
        });

        if (insertError)
          console.error("Error creating user record:", insertError);

        await loadUserData(data.user);
        return true;
      }

      return false;
    } catch (error: any) {
      console.error("Registration error:", error);

      // التعامل مع أخطاء معينة
      if (error.message?.includes("already registered")) {
        console.error("البريد الإلكتروني مستخدم بالفعل");
      }

      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("users")
        .update({
          name: userData.name,
          user_type: userData.role,
        })
        .eq("id", user.id);

      if (error) throw error;

      setUser({ ...user, ...userData });
    } catch (error) {
      console.error("Update user error:", error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        updateUser,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    // Return default values during SSR/build time
    if (typeof window === "undefined") {
      return {
        user: null,
        login: () => false,
        logout: () => {},
        register: () => false,
        updateUser: () => {},
        isAuthenticated: false,
      };
    }
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
