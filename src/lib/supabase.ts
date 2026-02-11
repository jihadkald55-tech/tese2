/**
 * Supabase Client Configuration
 * ملف الاتصال بقاعدة البيانات
 */

import { createClient } from "@supabase/supabase-js";

// التحقق من وجود المتغيرات البيئية
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env.local file.",
  );
}

// إنشاء عميل Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});

// أنواع البيانات TypeScript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          user_type: "student" | "professor" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          user_type?: "student" | "professor" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          user_type?: "student" | "professor" | "admin";
          updated_at?: string;
        };
      };
      research_projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          status: "planning" | "in_progress" | "completed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          status?: "planning" | "in_progress" | "completed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          status?: "planning" | "in_progress" | "completed";
          updated_at?: string;
        };
      };
      sources: {
        Row: {
          id: string;
          user_id: string;
          research_id: string | null;
          title: string;
          author: string | null;
          url: string | null;
          type: "book" | "article" | "website" | "other";
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          research_id?: string | null;
          title: string;
          author?: string | null;
          url?: string | null;
          type?: "book" | "article" | "website" | "other";
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          research_id?: string | null;
          title?: string;
          author?: string | null;
          url?: string | null;
          type?: "book" | "article" | "website" | "other";
          notes?: string | null;
        };
      };
      schedule_tasks: {
        Row: {
          id: string;
          user_id: string;
          research_id: string | null;
          title: string;
          description: string | null;
          due_date: string | null;
          status: "pending" | "in_progress" | "completed";
          priority: "low" | "medium" | "high";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          research_id?: string | null;
          title: string;
          description?: string | null;
          due_date?: string | null;
          status?: "pending" | "in_progress" | "completed";
          priority?: "low" | "medium" | "high";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          research_id?: string | null;
          title?: string;
          description?: string | null;
          due_date?: string | null;
          status?: "pending" | "in_progress" | "completed";
          priority?: "low" | "medium" | "high";
        };
      };
      ai_conversations: {
        Row: {
          id: string;
          user_id: string;
          research_id: string | null;
          message: string;
          response: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          research_id?: string | null;
          message: string;
          response: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          research_id?: string | null;
          message?: string;
          response?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
