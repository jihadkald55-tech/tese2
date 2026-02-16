-- ======================================
-- مزامنة المستخدمين من auth.users إلى public.users
-- Sync Users from auth.users to public.users
-- ======================================

-- الخطوة 1: إضافة سياسات RLS للمديرين
-- Step 1: Add RLS policies for admins

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
CREATE POLICY "Admins can insert users" ON public.users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
CREATE POLICY "Admins can update all users" ON public.users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
CREATE POLICY "Admins can delete users" ON public.users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- الخطوة 2: دالة مزامنة المستخدمين الموجودين
-- Step 2: Function to sync existing users

CREATE OR REPLACE FUNCTION public.sync_existing_users()
RETURNS TABLE(synced_count INT) AS $$
DECLARE
    v_count INT;
BEGIN
    -- مزامنة المستخدمين من auth.users إلى public.users
    INSERT INTO public.users (id, email, name, user_type, created_at, updated_at)
    SELECT 
        au.id,
        au.email,
        COALESCE(au.raw_user_meta_data->>'name', au.email),
        COALESCE(au.raw_user_meta_data->>'user_type', 'student'),
        au.created_at,
        au.updated_at
    FROM auth.users au
    WHERE NOT EXISTS (
        SELECT 1 FROM public.users pu WHERE pu.id = au.id
    );
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN QUERY SELECT v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- الخطوة 3: تنفيذ المزامنة
-- Step 3: Execute sync

SELECT * FROM public.sync_existing_users();

-- عرض النتائج
-- Show results
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE user_type = 'student') as students,
    COUNT(*) FILTER (WHERE user_type = 'professor') as professors,
    COUNT(*) FILTER (WHERE user_type = 'admin') as admins
FROM public.users;
