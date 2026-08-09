-- ==============================================================================
-- LSSCDT ONLINE ADMISSION PORTAL - POPUP BANNERS DATABASE & STORAGE MIGRATION SCRIPT
-- ==============================================================================
-- Copy and paste this entire script into your Supabase Dashboard -> SQL Editor
-- URL: https://supabase.com/dashboard/project/_/sql/new
-- ==============================================================================

-- 1. Create popup_banners Table in public schema
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

-- 2. Index for active popup lookups
CREATE INDEX IF NOT EXISTS idx_popup_banners_is_active ON public.popup_banners(is_active);

-- 3. Enable Row Level Security (RLS) on popup_banners
ALTER TABLE public.popup_banners ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running to avoid duplicate policy errors
DROP POLICY IF EXISTS "Allow public select for popup_banners" ON public.popup_banners;
DROP POLICY IF EXISTS "Allow public/admin insert for popup_banners" ON public.popup_banners;
DROP POLICY IF EXISTS "Allow public/admin update for popup_banners" ON public.popup_banners;
DROP POLICY IF EXISTS "Allow public/admin delete for popup_banners" ON public.popup_banners;

-- 4. Create RLS Policies for popup_banners table
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

-- 5. Storage Policies for Banner & Image Uploads (admissions & website_documents buckets)
DROP POLICY IF EXISTS "Allow public upload to admissions bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from admissions bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update in admissions bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete from admissions bucket" ON storage.objects;

CREATE POLICY "Allow public upload to admissions bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'admissions');

CREATE POLICY "Allow public read from admissions bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'admissions');

CREATE POLICY "Allow public update in admissions bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'admissions');

CREATE POLICY "Allow public delete from admissions bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'admissions');

-- 6. Insert Default Initial Active Popup Record if Table is Empty
INSERT INTO public.popup_banners (
    id, is_active, title, description, image_url, button_text, button_url, display_frequency, start_date, end_date, created_at, updated_at
) VALUES (
    'banner-default',
    true,
    'Admissions Open 2026-27 | B.Tech Dairy Technology',
    'Applications invited for B.Tech Dairy Technology (4-Year Degree) & Direct 2nd Year Lateral Entry. State Govt. approved & MAFSU Nagpur affiliated.',
    'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
    'Apply Online Now',
    '#admissions',
    'once_per_session',
    '',
    '',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- POPUP BANNERS MIGRATION SCRIPT COMPLETE!
-- ==============================================================================
