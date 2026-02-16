"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  GraduationCap,
  UserCheck,
  UserX,
  Search,
  Filter,
  X,
  Check,
  Mail,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";

interface User {
  id: string;
  email: string;
  name: string;
  user_type: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminUsersPage() {
  const { user } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    userType: "student",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    filterUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, searchQuery, filterType]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("خطأ في جلب المستخدمين:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // تصفية حسب النوع
    if (filterType !== "all") {
      filtered = filtered.filter((u) => u.user_type === filterType);
    }

    // تصفية حسب البحث
    if (searchQuery) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredUsers(filtered);
  };

  const handleAddUser = async () => {
    if (!formData.email || !formData.name) {
      alert("الرجاء ملء جميع الحقول");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert("تم إضافة المستخدم بنجاح");
        setShowAddModal(false);
        setFormData({ email: "", name: "", userType: "student" });
        fetchUsers();
      } else {
        alert(data.error || "حدث خطأ");
      }
    } catch (error) {
      console.error("خطأ:", error);
      alert("حدث خطأ في الإضافة");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      setSubmitting(true);
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          name: formData.name,
          userType: formData.userType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("تم تحديث المستخدم بنجاح");
        setShowEditModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        alert(data.error || "حدث خطأ");
      }
    } catch (error) {
      console.error("خطأ:", error);
      alert("حدث خطأ في التحديث");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          isActive: !currentStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        fetchUsers();
      }
    } catch (error) {
      console.error("خطأ:", error);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`هل أنت متأكد من حذف المستخدم "${userName}"؟`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        alert("تم حذف المستخدم بنجاح");
        fetchUsers();
      } else {
        alert(data.error || "حدث خطأ");
      }
    } catch (error) {
      console.error("خطأ:", error);
      alert("حدث خطأ في الحذف");
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      userType: user.user_type,
    });
    setShowEditModal(true);
  };

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case "admin":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "professor":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "student":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getUserTypeText = (type: string) => {
    switch (type) {
      case "admin":
        return "مدير";
      case "professor":
        return "مشرف";
      case "student":
        return "طالب";
      default:
        return type;
    }
  };

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case "admin":
        return <Shield className="w-4 h-4" />;
      case "professor":
        return <UserCheck className="w-4 h-4" />;
      case "student":
        return <GraduationCap className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const stats = {
    total: users.length,
    students: users.filter((u) => u.user_type === "student").length,
    professors: users.filter((u) => u.user_type === "professor").length,
    admins: users.filter((u) => u.user_type === "admin").length,
    active: users.filter((u) => u.is_active !== false).length,
  };

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-gray-600 dark:text-dark-muted">
            هذه الصفحة متاحة للمديرين فقط
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-dark-muted">
            جاري تحميل المستخدمين...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-medad-paper dark:bg-dark-bg p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-google p-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Users className="w-12 h-12" />
                <div>
                  <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
                  <p className="text-white/90">إضافة وتعديل حسابات النظام</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-white text-primary-600 px-6 py-3 rounded-google font-medium hover:shadow-google-lg transition-all flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                إضافة مستخدم
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-google p-4">
                <Users className="w-6 h-6 mb-2" />
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-white/80">الإجمالي</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-google p-4">
                <GraduationCap className="w-6 h-6 mb-2" />
                <p className="text-2xl font-bold">{stats.students}</p>
                <p className="text-sm text-white/80">طلاب</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-google p-4">
                <UserCheck className="w-6 h-6 mb-2" />
                <p className="text-2xl font-bold">{stats.professors}</p>
                <p className="text-sm text-white/80">مشرفين</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-google p-4">
                <Shield className="w-6 h-6 mb-2" />
                <p className="text-2xl font-bold">{stats.admins}</p>
                <p className="text-sm text-white/80">مديرين</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-google p-4">
                <Check className="w-6 h-6 mb-2" />
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-white/80">نشط</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search & Filter */}
        <div className="bg-white dark:bg-dark-card rounded-google shadow-google-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن مستخدم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 py-3 px-4 border border-medad-border dark:border-dark-border rounded-google focus:ring-2 focus:ring-primary-500 dark:bg-dark-hover dark:text-dark-text"
              />
            </div>
            <div className="flex gap-3">
              {["all", "student", "professor", "admin"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-6 py-3 rounded-google font-medium transition-all ${
                    filterType === type
                      ? "bg-primary-600 text-white shadow-google-md"
                      : "bg-gray-100 dark:bg-dark-hover text-gray-700 dark:text-dark-text hover:bg-gray-200"
                  }`}
                >
                  {type === "all" ? "الكل" : getUserTypeText(type)}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-dark-muted">
            عرض {filteredUsers.length} من {users.length} مستخدم
          </p>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-dark-card rounded-google shadow-google-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-hover">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-dark-text">
                    الاسم
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-dark-text">
                    البريد الإلكتروني
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-dark-text">
                    النوع
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-dark-text">
                    الحالة
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-dark-text">
                    تاريخ الإنشاء
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-dark-text">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                {filteredUsers.map((currentUser) => (
                  <motion.tr
                    key={currentUser.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {currentUser.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-dark-text">
                          {currentUser.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-dark-muted">
                        <Mail className="w-4 h-4" />
                        {currentUser.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getUserTypeColor(currentUser.user_type)}`}
                      >
                        {getUserTypeIcon(currentUser.user_type)}
                        {getUserTypeText(currentUser.user_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          handleToggleActive(
                            currentUser.id,
                            currentUser.is_active !== false,
                          )
                        }
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all ${
                          currentUser.is_active !== false
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {currentUser.is_active !== false ? (
                          <>
                            <Check className="w-4 h-4" />
                            نشط
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4" />
                            معطل
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-dark-muted text-sm">
                      {new Date(currentUser.created_at).toLocaleDateString(
                        "ar",
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(currentUser)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteUser(currentUser.id, currentUser.name)
                          }
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-dark-muted">
                  لا توجد نتائج
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Add User Modal */}
        <AnimatePresence>
          {showAddModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddModal(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md bg-white dark:bg-dark-card rounded-google shadow-2xl z-50 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-medad-ink dark:text-dark-text">
                    إضافة مستخدم جديد
                  </h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                      الاسم
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-medad-border dark:border-dark-border rounded-google focus:ring-2 focus:ring-primary-500 dark:bg-dark-hover dark:text-dark-text"
                      placeholder="أدخل الاسم"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-medad-border dark:border-dark-border rounded-google focus:ring-2 focus:ring-primary-500 dark:bg-dark-hover dark:text-dark-text"
                      placeholder="example@domain.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                      النوع
                    </label>
                    <select
                      value={formData.userType}
                      onChange={(e) =>
                        setFormData({ ...formData, userType: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-medad-border dark:border-dark-border rounded-google focus:ring-2 focus:ring-primary-500 dark:bg-dark-hover dark:text-dark-text"
                    >
                      <option value="student">طالب</option>
                      <option value="professor">مشرف</option>
                      <option value="admin">مدير</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleAddUser}
                      disabled={submitting}
                      className="flex-1 bg-gradient-to-r from-primary-600 to-purple-600 text-white px-6 py-3 rounded-google font-medium hover:shadow-google-lg transition-all disabled:opacity-50"
                    >
                      {submitting ? "جاري الإضافة..." : "إضافة"}
                    </button>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="px-6 py-3 bg-gray-100 dark:bg-dark-hover text-gray-700 dark:text-dark-text rounded-google font-medium hover:bg-gray-200 transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Edit User Modal */}
        <AnimatePresence>
          {showEditModal && selectedUser && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowEditModal(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md bg-white dark:bg-dark-card rounded-google shadow-2xl z-50 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-medad-ink dark:text-dark-text">
                    تعديل المستخدم
                  </h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                      الاسم
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-medad-border dark:border-dark-border rounded-google focus:ring-2 focus:ring-primary-500 dark:bg-dark-hover dark:text-dark-text"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-3 border border-medad-border dark:border-dark-border rounded-google bg-gray-50 dark:bg-dark-bg text-gray-500 dark:text-dark-muted cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 dark:text-dark-muted mt-1">
                      لا يمكن تعديل البريد الإلكتروني
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                      النوع
                    </label>
                    <select
                      value={formData.userType}
                      onChange={(e) =>
                        setFormData({ ...formData, userType: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-medad-border dark:border-dark-border rounded-google focus:ring-2 focus:ring-primary-500 dark:bg-dark-hover dark:text-dark-text"
                    >
                      <option value="student">طالب</option>
                      <option value="professor">مشرف</option>
                      <option value="admin">مدير</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleUpdateUser}
                      disabled={submitting}
                      className="flex-1 bg-gradient-to-r from-primary-600 to-purple-600 text-white px-6 py-3 rounded-google font-medium hover:shadow-google-lg transition-all disabled:opacity-50"
                    >
                      {submitting ? "جاري التحديث..." : "تحديث"}
                    </button>
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="px-6 py-3 bg-gray-100 dark:bg-dark-hover text-gray-700 dark:text-dark-text rounded-google font-medium hover:bg-gray-200 transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
