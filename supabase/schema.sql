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
    is_active BOOLEAN DEFAULT TRUE, -- حالة المستخدم (نشط/معطل)
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

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

CREATE POLICY "Users can insert their own data" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can insert" ON public.users
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update all users" ON public.users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

CREATE POLICY "Admins can delete users" ON public.users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

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
-- جداول نظام الإشراف والمراجعة
-- ======================================

-- جدول ربط الطالب بالمشرف
CREATE TABLE IF NOT EXISTS public.supervisor_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    supervisor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    research_id UUID REFERENCES public.research_projects(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'suspended')),
    assigned_by UUID REFERENCES public.users(id), -- المدير الذي قام بالتعيين
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, research_id)
);

-- جدول الفصول والمراجعات
CREATE TABLE IF NOT EXISTS public.chapter_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    research_id UUID NOT NULL REFERENCES public.research_projects(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    word_count INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'needs_revision')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- جدول تعليقات المراجعة
CREATE TABLE IF NOT EXISTS public.review_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES public.chapter_submissions(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    position_start INTEGER, -- موضع بداية التعليق في النص
    position_end INTEGER, -- موضع نهاية التعليق في النص
    type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('general', 'suggestion', 'error', 'praise')),
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- جدول إعلانات المدير
CREATE TABLE IF NOT EXISTS public.system_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'urgent', 'deadline')),
    target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'students', 'professors')),
    deadline TIMESTAMP WITH TIME ZONE, -- الموعد النهائي إن وجد
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- جدول إحصائيات التقدم (للأداء)
CREATE TABLE IF NOT EXISTS public.progress_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    research_id UUID REFERENCES public.research_projects(id) ON DELETE CASCADE,
    total_words INTEGER DEFAULT 0,
    completed_chapters INTEGER DEFAULT 0,
    pending_reviews INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completion_percentage INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, research_id)
);

-- ======================================
-- الفهارس للجداول الجديدة
-- ======================================

CREATE INDEX IF NOT EXISTS idx_supervisor_assignments_student ON public.supervisor_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_supervisor_assignments_supervisor ON public.supervisor_assignments(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_chapter_submissions_research ON public.chapter_submissions(research_id);
CREATE INDEX IF NOT EXISTS idx_chapter_submissions_student ON public.chapter_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_chapter_submissions_status ON public.chapter_submissions(status);
CREATE INDEX IF NOT EXISTS idx_review_comments_chapter ON public.review_comments(chapter_id);
CREATE INDEX IF NOT EXISTS idx_system_announcements_active ON public.system_announcements(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_progress_stats_user ON public.progress_stats(user_id);

-- ======================================
-- السياسات الأمنية للجداول الجديدة
-- ======================================

-- سياسات جدول ربط المشرفين
ALTER TABLE public.supervisor_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their supervisors" ON public.supervisor_assignments
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Supervisors can view their students" ON public.supervisor_assignments
    FOR SELECT USING (auth.uid() = supervisor_id);

CREATE POLICY "Admins can manage all assignments" ON public.supervisor_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- سياسات جدول الفصول
ALTER TABLE public.chapter_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own chapters" ON public.chapter_submissions
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can submit chapters" ON public.chapter_submissions
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Supervisors can view assigned students chapters" ON public.chapter_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.supervisor_assignments 
            WHERE supervisor_id = auth.uid() 
            AND student_id = chapter_submissions.student_id
        )
    );

CREATE POLICY "Supervisors can update chapters status" ON public.chapter_submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.supervisor_assignments 
            WHERE supervisor_id = auth.uid() 
            AND student_id = chapter_submissions.student_id
        )
    );

-- سياسات جدول التعليقات
ALTER TABLE public.review_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view comments on their chapters" ON public.review_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chapter_submissions 
            WHERE id = review_comments.chapter_id 
            AND student_id = auth.uid()
        )
    );

CREATE POLICY "Reviewers can add comments" ON public.review_comments
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Reviewers can view their comments" ON public.review_comments
    FOR SELECT USING (auth.uid() = reviewer_id);

-- سياسات جدول الإعلانات
ALTER TABLE public.system_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active announcements" ON public.system_announcements
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage announcements" ON public.system_announcements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- سياسات جدول الإحصائيات
ALTER TABLE public.progress_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stats" ON public.progress_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Supervisors can view students stats" ON public.progress_stats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.supervisor_assignments 
            WHERE supervisor_id = auth.uid() 
            AND student_id = progress_stats.user_id
        )
    );

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
COMMENT ON TABLE public.supervisor_assignments IS 'جدول ربط الطلاب بالمشرفين';
COMMENT ON TABLE public.chapter_submissions IS 'جدول رفع الفصول للمراجعة';
COMMENT ON TABLE public.review_comments IS 'جدول تعليقات المراجعة من المشرفين';
COMMENT ON TABLE public.system_announcements IS 'جدول إعلانات المدير العامة';
COMMENT ON TABLE public.progress_stats IS 'جدول إحصائيات تقدم الطلاب';

-- ======================================
-- مزامنة المستخدمين الموجودين من auth.users
-- ======================================

-- دالة لمزامنة جميع المستخدمين الموجودين في auth.users إلى public.users
CREATE OR REPLACE FUNCTION public.sync_existing_users()
RETURNS void AS $$
BEGIN
    INSERT INTO public.users (id, email, name, user_type, created_at, updated_at)
    SELECT 
        au.id,
        au.email,
        COALESCE(au.raw_user_meta_data->>'name', 'مستخدم'),
        COALESCE(au.raw_user_meta_data->>'user_type', 'student'),
        au.created_at,
        au.updated_at
    FROM auth.users au
    WHERE NOT EXISTS (
        SELECT 1 FROM public.users pu WHERE pu.id = au.id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- تنفيذ المزامنة
SELECT public.sync_existing_users();
