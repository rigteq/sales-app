-- =====================================================
-- FULL SCHEMA RESET & REBUILD (SAFE / IDEMPOTENT)
-- =====================================================

-- =====================================================
-- 1. CLEANUP: TRIGGERS & FUNCTIONS (TABLE-RELATED)
-- =====================================================

-- Trigger on auth.users → profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Function used by the trigger
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- =====================================================
-- 2. DROP TABLES (DEPENDENCY ORDER)
-- =====================================================

DROP TABLE IF EXISTS public.broadcast_notifications CASCADE;
DROP TABLE IF EXISTS public.po_data CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;
DROP TABLE IF EXISTS public.company CASCADE;

-- =====================================================
-- 3. MASTER TABLES
-- =====================================================

-- COMPANY
CREATE TABLE public.company (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    companyname TEXT NOT NULL,
    companyemail TEXT,
    companyphone TEXT,
    companydetails TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROLES
CREATE TABLE public.roles (
    role_id INTEGER PRIMARY KEY,
    role_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.roles (role_id, role_name)
VALUES (0, 'User'), (1, 'Admin'), (2, 'SuperAdmin')
ON CONFLICT (role_id) DO NOTHING;

-- =====================================================
-- 4. PROFILES (AUTH SYNC)
-- =====================================================

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE,
    gender TEXT,
    address TEXT,
    company_id UUID REFERENCES public.company(id) ON DELETE SET NULL,
    role_id INTEGER REFERENCES public.roles(role_id) DEFAULT 0,
    custom_message TEXT,
    created_time TIMESTAMPTZ DEFAULT NOW(),
    last_edited_time TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- 4.1 AUTH → PROFILES TRIGGER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        name,
        email,
        created_time,
        last_edited_time
    )
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data ->> 'name',
            NEW.raw_user_meta_data ->> 'full_name',
            'User'
        ),
        NEW.email,
        NOW(),
        NOW()
    );

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 5. LEADS
-- =====================================================

CREATE TABLE public.leads (
    id BIGSERIAL PRIMARY KEY,
    lead_name TEXT NOT NULL,
    created_by_email_id TEXT NOT NULL,
    assigned_to_email_id TEXT,
    phone TEXT,
    secondary_phone TEXT,
    email TEXT,
    status TEXT DEFAULT 'New',
    location TEXT,
    note TEXT,
    schedule_time TIMESTAMPTZ,
    created_time TIMESTAMPTZ DEFAULT NOW(),
    last_edited_time TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT at_least_one_contact CHECK (
        phone IS NOT NULL OR email IS NOT NULL OR secondary_phone IS NOT NULL
    )
);

-- =====================================================
-- 6. COMMENTS
-- =====================================================

CREATE TABLE public.comments (
    id BIGSERIAL PRIMARY KEY,
    lead_id BIGINT REFERENCES public.leads(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_by_email_id TEXT NOT NULL,
    status TEXT,
    created_time TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- 7. PURCHASE ORDER DATA
-- =====================================================

CREATE TABLE public.po_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id BIGINT REFERENCES public.leads(id) ON DELETE CASCADE,
    amount_received DECIMAL(15,2) DEFAULT 0,
    amount_remaining DECIMAL(15,2) DEFAULT 0,
    release_date TIMESTAMPTZ,
    note TEXT,
    created_by_email_id TEXT NOT NULL,
    company_id UUID REFERENCES public.company(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_edited_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. BROADCAST NOTIFICATIONS
-- =====================================================

CREATE TABLE public.broadcast_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    created_by_email_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. INDEXES
-- =====================================================

CREATE INDEX idx_leads_created_by ON public.leads(created_by_email_id);
CREATE INDEX idx_leads_assigned_to ON public.leads(assigned_to_email_id);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_comments_lead_id ON public.comments(lead_id);
CREATE INDEX idx_po_company_id ON public.po_data(company_id);
CREATE INDEX idx_po_created_by ON public.po_data(created_by_email_id);
CREATE INDEX idx_po_created_at ON public.po_data(created_at);

-- =====================================================
-- 10. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.company ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.po_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 11. RLS POLICIES
-- =====================================================

-- PROFILES
CREATE POLICY profiles_read ON public.profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY profiles_update ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- LEADS
CREATE POLICY leads_all ON public.leads
    FOR ALL TO authenticated USING (is_deleted = false);

-- COMMENTS
CREATE POLICY comments_all ON public.comments
    FOR ALL TO authenticated USING (is_deleted = false);

-- ROLES
CREATE POLICY roles_read ON public.roles
    FOR SELECT TO authenticated USING (true);

-- COMPANY
CREATE POLICY company_read ON public.company
    FOR SELECT TO authenticated USING (true);

CREATE POLICY company_superadmin_manage ON public.company
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role_id = 2
        )
    );

-- PO DATA
CREATE POLICY po_data_all ON public.po_data
    FOR ALL TO authenticated USING (true);

-- BROADCAST NOTIFICATIONS
CREATE POLICY broadcast_read ON public.broadcast_notifications
    FOR SELECT TO authenticated USING (true);

CREATE POLICY broadcast_superadmin_insert ON public.broadcast_notifications
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role_id = 2
        )
    );

CREATE POLICY broadcast_superadmin_delete ON public.broadcast_notifications
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role_id = 2
        )
    );

-- =====================================================
-- END OF FULL REBUILD
-- =====================================================
