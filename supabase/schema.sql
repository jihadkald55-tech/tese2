-- ======================================
-- Medad Research System Database Schema
-- نظام مداد - قاعدة البيانات
-- ======================================

-- إنشاء جدول المستخدمين
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('student', 'professor', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- إنشاء جدول مشاريع البحث
CREATE TABLE IF NOT EXISTS public.research_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT, -- محتوى البحث الكامل
    summary TEXT, -- ملخص البحث
    word_count INTEGER DEFAULT 0, -- عدد الكلمات
    status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed')),
    is_published BOOLEAN DEFAULT FALSE, -- هل البحث منشور في المعرض
    is_featured BOOLEAN DEFAULT FALSE, -- هل البحث مميز (جوهرة)
    published_at TIMESTAMP WITH TIME ZONE, -- تاريخ النشر
    supervisor_id UUID REFERENCES public.users(id), -- معرف المشرف
    supervisor_name TEXT, -- اسم المشرف
    graduation_year INTEGER, -- سنة التخرج
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- إنشاء جدول المصادر
CREATE TABLE IF NOT EXISTS public.sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    research_id UUID REFERENCES public.research_projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    author TEXT,
    url TEXT,
    type TEXT NOT NULL DEFAULT 'article' CHECK (type IN ('book', 'article', 'website', 'other')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- إنشاء جدول الجدول الزمني والمهام
CREATE TABLE IF NOT EXISTS public.schedule_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    research_id UUID REFERENCES public.research_projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- إنشاء جدول محادثات الذكاء الاصطناعي
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    research_id UUID REFERENCES public.research_projects(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- إنشاء جدول الإشعارات
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- إنشاء جدول المحادثات بين المستخدمين
CREATE TABLE IF NOT EXISTS public.user_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ======================================
-- إنشاء الفهارس (Indexes) لتحسين الأداء
-- ======================================

CREATE INDEX IF NOT EXISTS idx_research_projects_user_id ON public.research_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_research_projects_published ON public.research_projects(is_published) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_research_projects_featured ON public.research_projects(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_sources_user_id ON public.sources(user_id);
CREATE INDEX IF NOT EXISTS idx_sources_research_id ON public.sources(research_id);
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_user_id ON public.schedule_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_research_id ON public.schedule_tasks(research_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_sender_id ON public.user_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_recipient_id ON public.user_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_created_at ON public.user_messages(created_at);

-- ======================================
-- Row Level Security (RLS) - أمان على مستوى الصفوف
-- ======================================

-- تفعيل RLS على جميع الجداول
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_messages ENABLE ROW LEVEL SECURITY;

-- سياسات جدول المستخدمين
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can insert" ON public.users
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- سياسات جدول مشاريع البحث
CREATE POLICY "Users can view their own research projects" ON public.research_projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view published research projects" ON public.research_projects
    FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Users can insert their own research projects" ON public.research_projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own research projects" ON public.research_projects
    FOR UPDATE USING (auth.uid() = user_id);
    
CREATE POLICY "Supervisors can update assigned research projects" ON public.research_projects
    FOR UPDATE USING (auth.uid() = supervisor_id);

CREATE POLICY "Users can delete their own research projects" ON public.research_projects
    FOR DELETE USING (auth.uid() = user_id);

-- سياسات جدول المصادر
CREATE POLICY "Users can view their own sources" ON public.sources
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sources" ON public.sources
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sources" ON public.sources
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sources" ON public.sources
    FOR DELETE USING (auth.uid() = user_id);

-- سياسات جدول المهام
CREATE POLICY "Users can view their own tasks" ON public.schedule_tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON public.schedule_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON public.schedule_tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON public.schedule_tasks
    FOR DELETE USING (auth.uid() = user_id);

-- سياسات جدول المحادثات
CREATE POLICY "Users can view their own conversations" ON public.ai_conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations" ON public.ai_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" ON public.ai_conversations
    FOR DELETE USING (auth.uid() = user_id);

-- سياسات جدول الإشعارات
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);

-- سياسات جدول الرسائل بين المستخدمين
CREATE POLICY "Users can view messages they sent or received" ON public.user_messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON public.user_messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they received" ON public.user_messages
    FOR UPDATE USING (auth.uid() = recipient_id);

CREATE POLICY "Users can delete messages they sent" ON public.user_messages
    FOR DELETE USING (auth.uid() = sender_id);

-- ======================================
-- الدوال (Functions) والمحفزات (Triggers)
-- ======================================

-- دالة تحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- محفز لجدول المستخدمين
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- محفز لجدول مشاريع البحث
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.research_projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- دالة لإنشاء مستخدم جديد بعد التسجيل
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, user_type)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', 'مستخدم جديد'),
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- محفز لإنشاء مستخدم تلقائياً عند التسجيل
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ======================================
-- البيانات التجريبية (Optional)
-- ======================================

-- يمكنك إضافة بيانات تجريبية هنا إذا أردت

COMMENT ON TABLE public.users IS 'جدول المستخدمين - يحتوي على معلومات الطلاب والأساتذة';
COMMENT ON TABLE public.research_projects IS 'جدول مشاريع البحث - يحتوي على جميع مشاريع التخرج';
COMMENT ON TABLE public.sources IS 'جدول المصادر - المراجع والمصادر المستخدمة في الأبحاث';
COMMENT ON TABLE public.schedule_tasks IS 'جدول المهام والجدول الزمني';
COMMENT ON TABLE public.ai_conversations IS 'جدول محادثات الذكاء الاصطناعي';
COMMENT ON TABLE public.notifications IS 'جدول الإشعارات';
COMMENT ON TABLE public.user_messages IS 'جدول الرسائل بين المستخدمين';
