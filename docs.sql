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

-- 6. Create Company Mapping Table
CREATE TABLE IF NOT EXISTS public.company_mapping (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.company(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, company_id)
);

-- 7. Population Script
DO $$
DECLARE
    v_company_id UUID;
    v_profile RECORD;
BEGIN
    -- Create Company if not exists
    SELECT id INTO v_company_id FROM public.company WHERE companyname = 'rigteq' LIMIT 1;
    
    IF v_company_id IS NULL THEN
        INSERT INTO public.company (companyname, companyemail, companydetails)
        VALUES ('rigteq', 'ops@rq.com', 'Main Company')
        RETURNING id INTO v_company_id;
    END IF;

    -- Iterate over all profiles to assign role 2 and map to company
    FOR v_profile IN SELECT id FROM public.profiles LOOP
        
        -- Insert into company_mapping
        BEGIN
            INSERT INTO public.company_mapping (user_id, company_id)
            VALUES (v_profile.id, v_company_id);
        EXCEPTION WHEN unique_violation THEN
            -- Ignore if already mapped
        END;

        -- Insert or Update Role to 2 (Superadmin)
        INSERT INTO public.roles (id, role)
        VALUES (v_profile.id, 2)
        ON CONFLICT (id) DO UPDATE SET role = 2;
        
    END LOOP;
END $$;