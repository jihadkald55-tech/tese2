/**
 * مدير البيانات المعزولة لكل مستخدم
 * يضمن عدم تسريب البيانات بين الحسابات
 */

export type DataType = 
  | 'research' 
  | 'sources' 
  | 'conversations' 
  | 'schedule' 
  | 'settings'
  | 'notifications'
  | 'progress';

/**
 * الحصول على مفتاح البيانات المرتبط بمستخدم معين
 */
function getUserDataKey(userId: string, dataType: DataType): string {
  return `${dataType}_${userId}`;
}

/**
 * حفظ بيانات مرتبطة بمستخدم معين
 */
export function saveUserData<T>(userId: string, dataType: DataType, data: T): void {
  if (typeof window === 'undefined' || !userId) return;
  
  const key = getUserDataKey(userId, dataType);
  const dataWithMeta = {
    ownerId: userId,
    data: data,
    lastModified: new Date().toISOString()
  };
  
  try {
    localStorage.setItem(key, JSON.stringify(dataWithMeta));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}

/**
 * تحميل بيانات مرتبطة بمستخدم معين
 */
export function loadUserData<T>(userId: string, dataType: DataType): T | null {
  if (typeof window === 'undefined' || !userId) return null;
  
  const key = getUserDataKey(userId, dataType);
  
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    
    // تحقق أمني: تأكد أن البيانات تخص نفس المستخدم
    if (parsed.ownerId !== userId) {
      console.error('Data ownership mismatch - possible security breach!');
      return null;
    }
    
    return parsed.data as T;
  } catch (error) {
    console.error('Error loading user data:', error);
    return null;
  }
}

/**
 * حذف بيانات مستخدم معين
 */
export function deleteUserData(userId: string, dataType: DataType): void {
  if (typeof window === 'undefined' || !userId) return;
  
  const key = getUserDataKey(userId, dataType);
  localStorage.removeItem(key);
}

/**
 * حذف جميع بيانات مستخدم عند حذف حسابه
 */
export function deleteAllUserData(userId: string): void {
  if (typeof window === 'undefined' || !userId) return;
  
  const dataTypes: DataType[] = [
    'research',
    'sources',
    'conversations',
    'schedule',
    'settings',
    'notifications',
    'progress'
  ];
  
  dataTypes.forEach(type => deleteUserData(userId, type));
}

/**
 * مسح البيانات القديمة غير المرتبطة بمستخدمين (cleanup)
 */
export function cleanupLegacyData(): void {
  if (typeof window === 'undefined') return;
  
  // حذف البيانات القديمة غير المعزولة
  const legacyKeys = [
    'currentResearch',
    'researchSources',
    'chatConversations',
    'userSettings',
    'notifications',
    'notificationsInitialized'
  ];
  
  legacyKeys.forEach(key => {
    localStorage.removeItem(key);
  });
}

/**
 * التحقق من صلاحية الوصول للبيانات
 */
export function canAccessData(
  currentUserId: string,
  resourceOwnerId: string,
  currentUserRole: 'student' | 'professor' | 'admin',
  supervisorId?: string
): boolean {
  // نفس المستخدم
  if (currentUserId === resourceOwnerId) return true;
  
  // المشرف يصل لبيانات طالبه (قراءة فقط)
  if (currentUserRole === 'professor' && supervisorId === currentUserId) {
    return true;
  }
  
  // الأدمن يصل لكل شيء
  if (currentUserRole === 'admin') return true;
  
  return false;
}

/**
 * تهيئة البيانات الافتراضية لمستخدم جديد
 */
export function initializeNewUser(userId: string): void {
  if (typeof window === 'undefined' || !userId) return;
  
  // إعدادات افتراضية فقط
  const defaultSettings = {
    language: 'ar',
    theme: 'light',
    notifications: true,
    autoSave: true,
    autoSaveInterval: 30
  };
  
  saveUserData(userId, 'settings', defaultSettings);
  
  // باقي البيانات تبقى فارغة (لا بيانات وهمية)
  saveUserData(userId, 'research', null);
  saveUserData(userId, 'sources', []);
  saveUserData(userId, 'conversations', []);
  saveUserData(userId, 'schedule', []);
  saveUserData(userId, 'notifications', []);
}
