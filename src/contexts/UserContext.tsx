"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";

export type UserRole = "student" | "professor" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
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

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const mapAuthUserToLocalUser = (
    authUser: SupabaseUser,
    fallbackRole: UserRole = "student",
  ): User => ({
    id: authUser.id,
    name: (authUser.user_metadata?.name as string) || "مستخدم",
    email: authUser.email || "",
    role: (authUser.user_metadata?.user_type as UserRole) || fallbackRole,
  });

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

        const { error: insertError } = await supabase.from("users").upsert(
          {
            id: authUser.id,
            email: authUser.email!,
            name: authUser.user_metadata.name || "مستخدم",
            user_type: authUser.user_metadata.user_type || "student",
          },
          {
            onConflict: "id",
          },
        );

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
          const fallbackUser = mapAuthUserToLocalUser(
            data.user,
            role || "student",
          );
          setUser(fallbackUser);
          return { success: true };
        }
      }

      return {
        success: false,
        error: "بيانات الاعتماد غير صحيحة",
      };
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "حدث خطأ أثناء تسجيل الدخول";

      if (
        error.message === "Invalid login credentials" ||
        error.message?.includes("Invalid")
      ) {
        errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
      } else if (error.message?.includes("Email not confirmed")) {
        errorMessage =
          "حسابك قيد التفعيل. يرجى الانتظار لحظات ثم المحاولة مرة أخرى";
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
          emailRedirectTo: undefined,
          data: {
            name,
            user_type: role,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        console.log("User created in Auth:", data.user.id);

        let session = data.session;

        // إذا لم توجد جلسة، نحاول تسجيل الدخول مباشرة
        if (!session) {
          console.log("No session from signup, attempting auto-login...");
          const { data: loginData, error: loginError } =
            await supabase.auth.signInWithPassword({
              email,
              password,
            });

          if (loginError) {
            console.error("Auto-login failed:", loginError);
            return {
              success: false,
              error:
                "تم إنشاء الحساب لكن فشل تسجيل الدخول الفوري. يرجى محاولة تسجيل الدخول يدوياً.",
            };
          }

          session = loginData.session;
          console.log("Auto-login successful");
        }

        // انتظار قليل للسماح بتنفيذ triggers
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // محاولة تحميل بيانات المستخدم من قاعدة البيانات
        try {
          const { data: userData, error: fetchError } = await supabase
            .from("users")
            .select("*")
            .eq("id", data.user.id!)
            .single();

          if (userData) {
            setUser({
              id: userData.id,
              name: userData.name || name,
              email: userData.email || data.user.email!,
              role: (userData.user_type as UserRole) || role,
            });
          } else {
            // إذا لم يتم العثور على السجل، حاول إنشاؤه
            const { error: insertError } = await supabase.from("users").insert({
              id: data.user.id,
              email: data.user.email!,
              name: name,
              user_type: role,
            });

            if (insertError) {
              console.error("Insert error:", insertError);
              // لا نرمي خطأ هنا - قد يكون السجل موجود بالفعل من trigger
            }

            setUser({
              id: data.user.id,
              name: name,
              email: data.user.email!,
              role: role,
            });
          }
        } catch (error: any) {
          console.error("Error loading user data:", error);
          // استخدم البيانات الأساسية على أي حال
          setUser({
            id: data.user.id,
            name: name,
            email: data.user.email!,
            role: role,
          });
        }

        return { success: true };
      }

      return { success: false, error: "فشل إنشاء الحساب" };
    } catch (error: any) {
      console.error("Registration error:", error);

      let errorMessage = "حدث خطأ أثناء إنشاء الحساب";

      if (
        error.message?.includes("already registered") ||
        error.message?.includes("User already registered")
      ) {
        errorMessage = "البريد الإلكتروني مستخدم بالفعل";
      } else if (error.message?.includes("Email rate limit")) {
        errorMessage = "تم إرسال عدد كبير من الطلبات. يرجى الانتظار قليلاً";
      } else if (error.message?.includes("Password")) {
        errorMessage = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
      } else if (error.message?.includes("Invalid email")) {
        errorMessage = "البريد الإلكتروني غير صحيح";
      } else if (error.message) {
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
