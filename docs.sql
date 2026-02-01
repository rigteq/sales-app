-- NEVER UPDATE OR DELETE THIS. ONLY ADD SQL AT THE END OF THIS FILE--

-- 1: profiles table (In sync with Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    gender TEXT,
    address TEXT,
    phone TEXT UNIQUE,
    created_time TIMESTAMPTZ DEFAULT NOW(),
    last_edited_time TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 2: leads table
CREATE TABLE IF NOT EXISTS public.leads (
    id BIGSERIAL PRIMARY KEY,
    created_by_email_id TEXT NOT NULL,
    lead_name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'New',
    location TEXT,
    note TEXT,
    created_time TIMESTAMPTZ DEFAULT NOW(),
    last_edited_time TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 3: comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id BIGSERIAL PRIMARY KEY,
    lead_id BIGINT REFERENCES public.leads(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_by_email_id TEXT NOT NULL,
    status TEXT,
    created_time TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Policies (Collaborative Organization Access)
CREATE POLICY "Profiles view" ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "Profiles update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Leads access" ON public.leads FOR ALL TO authenticated USING (is_deleted = FALSE);
CREATE POLICY "Comments access" ON public.comments FOR ALL TO authenticated USING (is_deleted = FALSE);

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS secondary_phone TEXT;
ALTER TABLE public.leads ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE public.leads ALTER COLUMN email DROP NOT NULL;
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS at_least_one_contact;
ALTER TABLE public.leads ADD CONSTRAINT at_least_one_contact CHECK (phone IS NOT NULL OR email IS NOT NULL OR secondary_phone IS NOT NULL);

-- RLS POLICIES (Preserved)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON public.leads
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.leads
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON public.leads
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.comments
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.comments
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON public.comments
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON public.profiles
    FOR UPDATE TO authenticated USING (true);

-- 4. Create Roles Table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    role INTEGER DEFAULT 0 CHECK (role IN (0, 1, 2)), -- 0=user, 1=admin, 2=superadmin
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Company Table
CREATE TABLE IF NOT EXISTS public.company (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    companyname TEXT NOT NULL,
    companyemail TEXT,
    companyphone TEXT,
    companydetails TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- NEW ADDITIONS START HERE

-- 1. Add assigned_to_email_id to leads
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS assigned_to_email_id TEXT;

-- update existing leads to have assigned_to = created_by
UPDATE public.leads 
SET assigned_to_email_id = created_by_email_id 
WHERE assigned_to_email_id IS NULL;


-- 2. Drop company_mapping and Update Profiles
DROP TABLE IF EXISTS public.company_mapping;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.company(id) ON DELETE SET NULL;

-- 3. Populate company_id in profiles based on logic (For now, assign all to 'rigteq' if null)
DO $$
DECLARE
    v_company_id UUID;
BEGIN
    SELECT id INTO v_company_id FROM public.company WHERE companyname = 'rigteq' LIMIT 1;
    
    IF v_company_id IS NOT NULL THEN
        UPDATE public.profiles 
        SET company_id = v_company_id 
        WHERE company_id IS NULL;
    END IF;
END $$;

-- 4. Reconstruct Roles Schema

-- Drop old roles table
DROP TABLE IF EXISTS public.roles;

-- Create new roles table
CREATE TABLE IF NOT EXISTS public.roles (
    roleId INTEGER PRIMARY KEY,
    roleName TEXT NOT NULL,
    createdDate TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Roles
INSERT INTO public.roles (roleId, roleName) VALUES (0, 'User'), (1, 'Admin'), (2, 'SuperAdmin')
ON CONFLICT (roleId) DO NOTHING;

-- Update Profiles with roleId
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS roleId INTEGER REFERENCES public.roles(roleId) DEFAULT 0;

-- Set all existing profiles to SuperAdmin (2) as per previous logic (or as requested "Set roleId for all profiles as 2")
UPDATE public.profiles SET roleId = 2;

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_leads_created_by ON public.leads(created_by_email_id);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to_email_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_comments_lead_id ON public.comments(lead_id);

-- 6. Rename roleId to role_id in profiles
ALTER TABLE public.profiles 
RENAME COLUMN roleid TO role_id;

-- 7. Add RLS for roles and company tables

-- Roles Table
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON public.roles
    FOR SELECT TO authenticated USING (true);

-- Company Table
ALTER TABLE public.company ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON public.company
    FOR SELECT TO authenticated USING (true);

-- Allow Superadmins (role_id=2 in profiles) to create/update companies
-- Note: This requires a join or subquery on profiles using auth.uid()
CREATE POLICY "Enable insert/update for Superadmins" ON public.company
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role_id = 2
        )
    );

-- 8. Add Custom Message to Profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS custom_message TEXT;

-- 9. Add Schedule Time to Leads
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS schedule_time TIMESTAMPTZ;
-- 10. Purchase Order (PO) Data Table
CREATE TABLE IF NOT EXISTS public.po_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id BIGINT REFERENCES public.leads(id) ON DELETE CASCADE,
    amount_received DECIMAL(15, 2) DEFAULT 0,
    amount_remaining DECIMAL(15, 2) DEFAULT 0,
    release_date TIMESTAMPTZ,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_edited_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_email_id TEXT NOT NULL,
    company_id UUID REFERENCES public.company(id) -- snapshot company to assist aggregation
);

-- Indexes for Aggregation
CREATE INDEX IF NOT EXISTS idx_po_company_id ON public.po_data(company_id);
CREATE INDEX IF NOT EXISTS idx_po_created_by ON public.po_data(created_by_email_id);
CREATE INDEX IF NOT EXISTS idx_po_created_at ON public.po_data(created_at);

-- RLS for PO Data
ALTER TABLE public.po_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read/write for authenticated users" ON public.po_data
    FOR ALL TO authenticated USING (true);

-- 11. Broadcast Notifications Table
CREATE TABLE IF NOT EXISTS public.broadcast_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    created_by_email_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Broadcast Notifications
ALTER TABLE public.broadcast_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for all authenticated users" ON public.broadcast_notifications
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for Superadmins" ON public.broadcast_notifications
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role_id = 2
        )
    );

-- 12. Add DELETE policy for Broadcast Notifications (Missing previously)
CREATE POLICY "Enable delete for Superadmins" ON public.broadcast_notifications
    FOR DELETE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role_id = 2
        )
    );
