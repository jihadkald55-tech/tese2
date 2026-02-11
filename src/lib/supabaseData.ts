/**
 * مدير البيانات مع Supabase
 * Data Manager for Supabase Integration
 */

import { supabase } from "./supabase";

// =====================================================
// Research Projects - مشاريع البحث
// =====================================================

export interface ResearchProject {
  id?: string;
  user_id?: string;
  title: string;
  description?: string;
  content?: string;
  word_count?: number;
  status?: "planning" | "in_progress" | "completed";
  created_at?: string;
  updated_at?: string;
}

/**
 * الحصول على مشروع البحث للمستخدم الحالي
 */
export async function getUserResearch(
  userId: string,
): Promise<ResearchProject | null> {
  try {
    const { data, error } = await supabase
      .from("research_projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows
      console.error("Error fetching research:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getUserResearch:", error);
    return null;
  }
}

/**
 * حفظ/تحديث مشروع البحث
 */
export async function saveResearch(
  userId: string,
  research: ResearchProject,
): Promise<boolean> {
  try {
    // محاولة الحصول على المشروع الموجود
    const existing = await getUserResearch(userId);

    if (existing?.id) {
      // تحديث المشروع الموجود
      const { error } = await supabase
        .from("research_projects")
        .update({
          title: research.title,
          description: research.description,
          content: research.content,
          word_count: research.word_count,
          status: research.status || "in_progress",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .eq("user_id", userId);

      if (error) {
        console.error("Error updating research:", error);
        return false;
      }
    } else {
      // إنشاء مشروع جديد
      const { error } = await supabase.from("research_projects").insert({
        user_id: userId,
        title: research.title || "بحث التخرج",
        description: research.description,
        content: research.content,
        word_count: research.word_count || 0,
        status: research.status || "planning",
      });

      if (error) {
        console.error("Error creating research:", error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Error in saveResearch:", error);
    return false;
  }
}

// =====================================================
// Sources - المصادر
// =====================================================

export interface Source {
  id?: string;
  user_id?: string;
  research_id?: string;
  title: string;
  author?: string;
  url?: string;
  type: "book" | "article" | "website" | "other";
  notes?: string;
  created_at?: string;
}

/**
 * الحصول على جميع مصادر المستخدم
 */
export async function getUserSources(userId: string): Promise<Source[]> {
  try {
    const { data, error } = await supabase
      .from("sources")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching sources:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getUserSources:", error);
    return [];
  }
}

/**
 * إضافة مصدر جديد
 */
export async function addSource(
  userId: string,
  source: Source,
): Promise<boolean> {
  try {
    const { error } = await supabase.from("sources").insert({
      user_id: userId,
      title: source.title,
      author: source.author,
      url: source.url,
      type: source.type || "article",
      notes: source.notes,
    });

    if (error) {
      console.error("Error adding source:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in addSource:", error);
    return false;
  }
}

/**
 * تحديث مصدر
 */
export async function updateSource(
  sourceId: string,
  userId: string,
  source: Partial<Source>,
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("sources")
      .update(source)
      .eq("id", sourceId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating source:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updateSource:", error);
    return false;
  }
}

/**
 * حذف مصدر
 */
export async function deleteSource(
  sourceId: string,
  userId: string,
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("sources")
      .delete()
      .eq("id", sourceId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting source:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteSource:", error);
    return false;
  }
}

// =====================================================
// Schedule Tasks - المهام والجدول الزمني
// =====================================================

export interface ScheduleTask {
  id?: string;
  user_id?: string;
  research_id?: string;
  title: string;
  description?: string;
  due_date?: string;
  status?: "pending" | "in_progress" | "completed";
  priority?: "low" | "medium" | "high";
  created_at?: string;
}

/**
 * الحصول على جميع مهام المستخدم
 */
export async function getUserTasks(userId: string): Promise<ScheduleTask[]> {
  try {
    const { data, error } = await supabase
      .from("schedule_tasks")
      .select("*")
      .eq("user_id", userId)
      .order("due_date", { ascending: true });

    if (error) {
      console.error("Error fetching tasks:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getUserTasks:", error);
    return [];
  }
}

/**
 * إضافة مهمة جديدة
 */
export async function addTask(
  userId: string,
  task: ScheduleTask,
): Promise<boolean> {
  try {
    const { error } = await supabase.from("schedule_tasks").insert({
      user_id: userId,
      title: task.title,
      description: task.description,
      due_date: task.due_date,
      status: task.status || "pending",
      priority: task.priority || "medium",
    });

    if (error) {
      console.error("Error adding task:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in addTask:", error);
    return false;
  }
}

/**
 * تحديث مهمة
 */
export async function updateTask(
  taskId: string,
  userId: string,
  task: Partial<ScheduleTask>,
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("schedule_tasks")
      .update(task)
      .eq("id", taskId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating task:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updateTask:", error);
    return false;
  }
}

/**
 * حذف مهمة
 */
export async function deleteTask(
  taskId: string,
  userId: string,
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("schedule_tasks")
      .delete()
      .eq("id", taskId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting task:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteTask:", error);
    return false;
  }
}

// =====================================================
// AI Conversations - محادثات الذكاء الاصطناعي
// =====================================================

export interface AIConversation {
  id?: string;
  user_id?: string;
  research_id?: string;
  message: string;
  response: string;
  created_at?: string;
}

/**
 * الحصول على محادثات المستخدم
 */
export async function getUserConversations(
  userId: string,
  limit: number = 50,
): Promise<AIConversation[]> {
  try {
    const { data, error } = await supabase
      .from("ai_conversations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching conversations:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getUserConversations:", error);
    return [];
  }
}

/**
 * حفظ محادثة جديدة
 */
export async function saveConversation(
  userId: string,
  message: string,
  response: string,
): Promise<boolean> {
  try {
    const { error } = await supabase.from("ai_conversations").insert({
      user_id: userId,
      message,
      response,
    });

    if (error) {
      console.error("Error saving conversation:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in saveConversation:", error);
    return false;
  }
}

/**
 * حذف محادثة
 */
export async function deleteConversation(
  conversationId: string,
  userId: string,
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("ai_conversations")
      .delete()
      .eq("id", conversationId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting conversation:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteConversation:", error);
    return false;
  }
}

// =====================================================
// Notifications - الإشعارات
// =====================================================

export interface Notification {
  id?: string;
  user_id?: string;
  title: string;
  message: string;
  type?: "info" | "warning" | "success" | "error";
  is_read?: boolean;
  created_at?: string;
}

/**
 * الحصول على إشعارات المستخدم
 */
export async function getUserNotifications(
  userId: string,
): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getUserNotifications:", error);
    return [];
  }
}

/**
 * تمييز الإشعار كمقروء
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId: string,
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in markNotificationAsRead:", error);
    return false;
  }
}
