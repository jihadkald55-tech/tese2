"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useUser } from "./UserContext";
import {
  getUserNotifications,
  markNotificationAsRead,
} from "@/lib/supabaseData";
import { supabase } from "@/lib/supabase";

export interface Notification {
  id: string;
  type:
    | "message"
    | "deadline"
    | "research"
    | "system"
    | "info"
    | "warning"
    | "success"
    | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">,
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  // ✅ تحميل الإشعارات من Supabase
  const loadNotifications = async () => {
    if (!user?.id) return;

    const dbNotifications = await getUserNotifications(user.id);
    if (dbNotifications && dbNotifications.length > 0) {
      const mappedNotifications: Notification[] = dbNotifications.map((n) => ({
        id: n.id || "",
        type: (n.type as any) || "info",
        title: n.title,
        message: n.message,
        timestamp: n.created_at || new Date().toISOString(),
        read: n.is_read || false,
      }));
      setNotifications(mappedNotifications);
      setUnreadCount(mappedNotifications.filter((n) => !n.read).length);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  // ✅ تحميل الإشعارات من Supabase عند تحميل المكون
  useEffect(() => {
    setMounted(true);
    if (!user?.id) return;

    loadNotifications();
  }, [user?.id, loadNotifications]);

  // ✅ الاستماع للتحديثات في الوقت الفعلي
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Notification change detected:", payload);
          loadNotifications();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, loadNotifications]);

  const addNotification = async (
    notification: Omit<Notification, "id" | "timestamp" | "read">,
  ) => {
    if (!user?.id) return;

    // ✅ حفظ في Supabase
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: user.id,
        title: notification.title,
        message: notification.message,
        type:
          notification.type === "message" ||
          notification.type === "deadline" ||
          notification.type === "research" ||
          notification.type === "system"
            ? "info"
            : notification.type,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding notification:", error);
      // Fallback: add locally only
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    } else {
      // سيتم تحديث القائمة تلقائياً من خلال realtime subscription
    }

    // إشعار متصفح
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/icon.png",
      });
    }
  };

  const markAsRead = async (id: string) => {
    if (!user?.id) return;

    // تحديث محلي فوري
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    // ✅ تحديث في Supabase
    await markNotificationAsRead(id, user.id);
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    // تحديث محلي فوري
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    // ✅ تحديث كل الإشعارات في Supabase
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    for (const id of unreadIds) {
      await markNotificationAsRead(id, user.id);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!user?.id) return;

    const notification = notifications.find((n) => n.id === id);

    // حذف محلي فوري
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    if (notification && !notification.read) {
      setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
    }

    // ✅ حذف من Supabase
    await supabase
      .from("notifications")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
  };

  const clearAll = async () => {
    if (!user?.id) return;

    // مسح محلي فوري
    setNotifications([]);
    setUnreadCount(0);

    // ✅ حذف كل الإشعارات من Supabase
    await supabase.from("notifications").delete().eq("user_id", user.id);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    // Return default values during SSR/build time
    if (typeof window === "undefined") {
      return {
        notifications: [],
        unreadCount: 0,
        addNotification: () => {},
        markAsRead: () => {},
        markAllAsRead: () => {},
        deleteNotification: () => {},
        clearAll: () => {},
      };
    }
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  }
  return context;
}
