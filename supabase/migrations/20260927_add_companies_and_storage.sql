-- =====================================================================
-- KERJAKILAT JOB PORTAL - COMPANIES & STORAGE MIGRATION
-- Database: PostgreSQL / Supabase
-- Target: Companies table, Relationships with Jobs, Storage Bucket
-- =====================================================================

-- 1. Create 'companies' table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  logo_path TEXT,
  industry TEXT,
  location TEXT,
  website TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on company name for fast case-insensitive lookups
CREATE INDEX IF NOT EXISTS idx_companies_name_lower ON companies (LOWER(name));

-- Trigger to update 'updated_at' column automatically
DROP TRIGGER IF EXISTS trigger_companies_updated_at ON companies;
CREATE TRIGGER trigger_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 2. Alter 'jobs' table to include company_id and company_logo
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_logo TEXT;

CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);

-- 3. Supabase Storage Bucket for Company Logos
-- Max 5MB, format PNG, JPG, JPEG, WEBP
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos',
  true,
  5242880, -- 5 MB in bytes
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp'];

-- Storage Policies:
-- Allow public read access to company logos
CREATE POLICY "Public Read Company Logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-logos');

-- Allow authenticated and anon inserts for uploading logos
CREATE POLICY "Allow Upload Company Logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'company-logos');

-- Allow updating and deleting company logos
CREATE POLICY "Allow Update Company Logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'company-logos');

CREATE POLICY "Allow Delete Company Logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'company-logos');

-- 4. Enable Row Level Security (RLS) on companies table
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read companies"
  ON companies FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert companies"
  ON companies FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update companies"
  ON companies FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete companies"
  ON companies FOR DELETE
  USING (true);
