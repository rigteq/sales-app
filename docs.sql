-- Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    name TEXT,
    gender TEXT, -- 'Male', 'Female', 'Other'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
    id BIGSERIAL PRIMARY KEY,
    created_by_email_id TEXT NOT NULL,
    lead_name TEXT NOT NULL,
    phone TEXT, -- Made Nullable
    secondary_phone TEXT, -- Added new field
    email TEXT, -- Made Nullable
    status TEXT DEFAULT 'New',
    location TEXT,
    note TEXT,
    created_time TIMESTAMPTZ DEFAULT NOW(),
    last_edited_time TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT unique_phone UNIQUE (phone),
    CONSTRAINT unique_email UNIQUE (email),
    CONSTRAINT at_least_one_contact CHECK (
        phone IS NOT NULL OR email IS NOT NULL OR secondary_phone IS NOT NULL
    )
);

-- Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
    id BIGSERIAL PRIMARY KEY,
    lead_id BIGINT REFERENCES public.leads(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_by_email_id TEXT NOT NULL,
    status TEXT,
    created_time TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Note: If tables already exist, you will need to run ALTER COMMANDS manually:
-- ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS secondary_phone TEXT;
-- ALTER TABLE public.leads ALTER COLUMN phone DROP NOT NULL;
-- ALTER TABLE public.leads ALTER COLUMN email DROP NOT NULL;
-- ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS at_least_one_contact;
-- ALTER TABLE public.leads ADD CONSTRAINT at_least_one_contact CHECK (phone IS NOT NULL OR email IS NOT NULL OR secondary_phone IS NOT NULL);

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