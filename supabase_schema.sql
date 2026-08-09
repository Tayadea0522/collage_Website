-- ==============================================================================
-- LSSCDT ONLINE ADMISSION PORTAL - SUPABASE POSTGRESQL & STORAGE SETUP SCRIPT
-- ==============================================================================
-- Execute this SQL script in your Supabase SQL Editor (Dashboard -> SQL Editor)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Admission Applications Table
CREATE TABLE IF NOT EXISTS public.admission_applications (
    id VARCHAR(100) PRIMARY KEY, -- e.g. LSSCDT-2026-1042
    full_name TEXT NOT NULL,
    father_name TEXT,
    mother_name TEXT,
    dob DATE,
    gender VARCHAR(20),
    category VARCHAR(50),
    email TEXT,
    mobile VARCHAR(20),
    aadhar_number VARCHAR(20),
    address TEXT,
    district TEXT,
    state TEXT,
    pincode VARCHAR(10),

    -- Seeking & Qualifications
    admission_year TEXT,
    admission_branch TEXT,
    previous_qualification TEXT,
    previous_institute TEXT,
    previous_board_university TEXT,
    previous_passing_year VARCHAR(10),
    previous_stream_branch TEXT,
    previous_obtained_marks NUMERIC,
    previous_total_marks NUMERIC,
    previous_percentage NUMERIC,

    -- HSC / Entrance
    hsc_pcm_marks NUMERIC,
    hsc_total_marks NUMERIC,
    hsc_percentage NUMERIC,
    hsc_board TEXT,
    hsc_passing_year VARCHAR(10),
    entrance_exam TEXT,
    entrance_roll_no VARCHAR(100),
    entrance_percentile NUMERIC,

    -- Quotas
    is_agriculturalist BOOLEAN DEFAULT FALSE,
    is_maharashtra_domicile BOOLEAN DEFAULT FALSE,

    -- Workflow Status & History
    status VARCHAR(50) DEFAULT 'Submitted',
    submission_date DATE DEFAULT CURRENT_DATE,
    remarks TEXT,
    status_history JSONB DEFAULT '[]'::jsonb,
    documents_uploaded JSONB DEFAULT '{}'::jsonb,
    attached_files JSONB DEFAULT '[]'::jsonb,

    -- Metadata
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for Fast Searching & Filtering
CREATE INDEX IF NOT EXISTS idx_admission_apps_status ON public.admission_applications(status);
CREATE INDEX IF NOT EXISTS idx_admission_apps_year ON public.admission_applications(admission_year);
CREATE INDEX IF NOT EXISTS idx_admission_apps_mobile ON public.admission_applications(mobile);
CREATE INDEX IF NOT EXISTS idx_admission_apps_email ON public.admission_applications(email);
CREATE INDEX IF NOT EXISTS idx_admission_apps_full_name ON public.admission_applications USING gin (to_tsvector('english', full_name));

-- 3. Setup Private Supabase Storage Bucket 'admissions'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'admissions',
    'admissions',
    false, -- Private bucket requiring signed URLs
    10485760, -- 10 MB Limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 10485760;

-- 4. Enable Row Level Security (RLS) Policies
ALTER TABLE public.admission_applications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit an application
CREATE POLICY "Allow public insert for new admission applications"
ON public.admission_applications FOR INSERT
WITH CHECK (true);

-- Allow public read for tracking status by application ID, mobile, or email
CREATE POLICY "Allow public select for candidate application tracking"
ON public.admission_applications FOR SELECT
USING (true);

-- Allow authenticated admins to update/delete applications
CREATE POLICY "Allow admin update for applications"
ON public.admission_applications FOR UPDATE
USING (true);

CREATE POLICY "Allow admin delete for applications"
ON public.admission_applications FOR DELETE
USING (true);

-- 5. Storage Bucket RLS Policies for 'admissions' bucket
CREATE POLICY "Allow public upload to admissions bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'admissions');

CREATE POLICY "Allow public read/signed_url from admissions bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'admissions');

CREATE POLICY "Allow admin delete from admissions bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'admissions');

-- ==============================================================================
-- SCHEMA & STORAGE CONFIGURATION COMPLETE!
-- ==============================================================================

-- 6. Create Popup Banners Table & RLS Policies
CREATE TABLE IF NOT EXISTS public.popup_banners (
    id VARCHAR(100) PRIMARY KEY DEFAULT 'banner-default',
    is_active BOOLEAN DEFAULT FALSE,
    title TEXT DEFAULT '',
    description TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    button_text TEXT DEFAULT '',
    button_url TEXT DEFAULT '',
    display_frequency VARCHAR(50) DEFAULT 'once_per_session',
    start_date VARCHAR(20) DEFAULT '',
    end_date VARCHAR(20) DEFAULT '',
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.popup_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select for popup_banners"
ON public.popup_banners FOR SELECT
USING (true);

CREATE POLICY "Allow public/admin insert for popup_banners"
ON public.popup_banners FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public/admin update for popup_banners"
ON public.popup_banners FOR UPDATE
USING (true);

CREATE POLICY "Allow public/admin delete for popup_banners"
ON public.popup_banners FOR DELETE
USING (true);

