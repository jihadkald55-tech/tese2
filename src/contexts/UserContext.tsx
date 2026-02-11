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
  login: (
    email: string,
    password: string,
    role?: UserRole,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ) => Promise<{ success: boolean; error?: string }>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // تحميل بيانات المستخدم من قاعدة البيانات
  const loadUserData = async (authUser: SupabaseUser): Promise<boolean> => {
    try {
      console.log("Loading user data for:", authUser.id, authUser.email);

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      console.log("User data query result:", { data, error });

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        console.log("User data found:", data);
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.user_type as UserRole,
        });
        return true;
      } else {
        // المستخدم موجود في Auth ولكن غير موجود في جدول users
        console.warn(
          "User in Auth but missing in public.users. Creating record...",
        );

        const { error: insertError } = await supabase.from("users").insert({
          id: authUser.id,
          email: authUser.email!,
          name: authUser.user_metadata.name || "مستخدم",
          user_type: authUser.user_metadata.user_type || "student",
        });

        if (insertError) {
          console.error("Failed to create user record:", insertError);
          return false;
        }

        // إعادة المحاولة
        const { data: newData } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (newData) {
          console.log("User record created successfully:", newData);
          setUser({
            id: newData.id,
            name: newData.name,
            email: newData.email,
            role: newData.user_type as UserRole,
          });
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      return false;
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
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log("UserContext: Login started for", email);
      setLoading(true);

      // تسجيل الدخول عبر Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("Supabase auth response:", { data, error });

      if (error) throw error;

      if (data.user) {
        console.log("User authenticated, loading user data...");
        const loaded = await loadUserData(data.user);
        console.log("User data loaded:", loaded);

        if (loaded) {
          return { success: true };
        } else {
          return {
            success: false,
            error: "فشل في تحميل بيانات المستخدم. يرجى المحاولة مرة أخرى.",
          };
        }
      }

      return {
        success: false,
        error: "بيانات الاعتماد غير صحيحة",
      };
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "حدث خطأ أثناء تسجيل الدخول";

      if (error.message === "Invalid login credentials") {
        errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "يرجى تأكيد البريد الإلكتروني قبل تسجيل الدخول";
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ): Promise<{ success: boolean; error?: string }> => {
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
        console.log("User created in Auth:", data.user.id);

        // ✅ يتم إنشاء المستخدم في جدول users تلقائياً عبر trigger
        // انتظر للتأكد من تنفيذ الـ trigger
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // محاولة أولى
        let loaded = await loadUserData(data.user);
        console.log("First load attempt:", loaded);

        if (loaded) {
          return { success: true };
        }

        // محاولة ثانية بعد 2 ثانية
        console.log("Retrying after 2 seconds...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        loaded = await loadUserData(data.user);
        console.log("Second load attempt:", loaded);

        if (loaded) {
          return { success: true };
        }

        // محاولة ثالثة وأخيرة بعد 3 ثوانٍ إضافية
        console.log("Final retry after 3 more seconds...");
        await new Promise((resolve) => setTimeout(resolve, 3000));
        loaded = await loadUserData(data.user);
        console.log("Third load attempt:", loaded);

        if (loaded) {
          return { success: true };
        }

        return {
          success: false,
          error: "تم إنشاء الحساب ولكن فشل تحميل البيانات. يرجى تسجيل الدخول.",
        };
      }

      return { success: false, error: "فشل إنشاء الحساب" };
    } catch (error: any) {
      console.error("Registration error:", error);

      let errorMessage = "حدث خطأ أثناء إنشاء الحساب";
      // التعامل مع أخطاء معينة
      if (error.message?.includes("already registered")) {
        errorMessage = "البريد الإلكتروني مستخدم بالفعل";
      } else {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
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
        login: async () => ({ success: false, error: "Server side rendering" }),
        logout: async () => {},
        register: async () => ({
          success: false,
          error: "Server side rendering",
        }),
        updateUser: async () => {},
        isAuthenticated: false,
        loading: true,
      };
    }
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
