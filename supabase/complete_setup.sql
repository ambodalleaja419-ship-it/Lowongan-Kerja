-- =====================================================================
-- KERJAKILAT JOB PORTAL - SUPABASE SETUP SCRIPT (LENGKAP & SIAP PAKAI)
-- Database : PostgreSQL / Supabase
-- Target   : Companies, Jobs, Applications, Telegram Sessions,
--            Storage Bucket (company-logos), RLS & Policies, Seed Data
-- =====================================================================

-- 1. AKTIFKAN EXTENSION UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. FUNGSI OTOMATISASI TIMESTAMP (updated_at)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. TABEL 'companies' (PERUSAHAAN & LOGO)
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

CREATE INDEX IF NOT EXISTS idx_companies_name_lower ON companies (LOWER(name));

DROP TRIGGER IF EXISTS trigger_companies_updated_at ON companies;
CREATE TRIGGER trigger_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. TABEL 'jobs' (LOWONGAN KERJA)
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  company_logo TEXT,
  position TEXT NOT NULL,
  location TEXT NOT NULL,
  salary_min NUMERIC,
  salary_max NUMERIC,
  salary_text TEXT,
  employment_type TEXT DEFAULT 'Full-time',
  education TEXT,
  min_age INTEGER,
  max_age INTEGER,
  gender TEXT,
  experience TEXT,
  skills JSONB DEFAULT '[]'::jsonb,
  requirements JSONB DEFAULT '[]'::jsonb,
  responsibilities JSONB DEFAULT '[]'::jsonb,
  benefits JSONB DEFAULT '[]'::jsonb,
  description TEXT NOT NULL,
  deadline DATE,
  application_url TEXT,
  slug TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'published', -- 'draft', 'published', 'archived'
  featured BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_slug ON jobs(slug);
CREATE INDEX IF NOT EXISTS idx_jobs_published_at ON jobs(published_at DESC);

DROP TRIGGER IF EXISTS trigger_jobs_updated_at ON jobs;
CREATE TRIGGER trigger_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. TABEL 'applications' (LAMARAN KANDIDAT)
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  domicile TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 17 AND age <= 70),
  applied_position TEXT NOT NULL,
  telegram_username TEXT NOT NULL,
  telegram_number TEXT,
  consent BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'NEW', -- 'NEW', 'CONTACTED', 'CV_REQUESTED', 'CV_RECEIVED', 'INTERVIEW', 'ACCEPTED', 'REJECTED'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);

DROP TRIGGER IF EXISTS trigger_applications_updated_at ON applications;
CREATE TRIGGER trigger_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. TABEL 'telegram_sessions' (SESI BOT REKRUTMEN)
CREATE TABLE IF NOT EXISTS telegram_sessions (
  chat_id BIGINT PRIMARY KEY,
  step TEXT NOT NULL DEFAULT 'idle',
  active_field TEXT,
  draft_payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_telegram_sessions_updated_at ON telegram_sessions;
CREATE TRIGGER trigger_telegram_sessions_updated_at
  BEFORE UPDATE ON telegram_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. SUPABASE STORAGE BUCKET 'company-logos'
-- Menyimpan file logo (PNG, JPG, JPEG, WEBP) maksimal 5 MB
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos',
  true,
  5242880, -- 5 MB
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp'];

-- Storage Policies:
DROP POLICY IF EXISTS "Public Read Company Logos" ON storage.objects;
CREATE POLICY "Public Read Company Logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'company-logos');

DROP POLICY IF EXISTS "Allow Upload Company Logos" ON storage.objects;
CREATE POLICY "Allow Upload Company Logos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'company-logos');

DROP POLICY IF EXISTS "Allow Update Company Logos" ON storage.objects;
CREATE POLICY "Allow Update Company Logos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'company-logos');

DROP POLICY IF EXISTS "Allow Delete Company Logos" ON storage.objects;
CREATE POLICY "Allow Delete Company Logos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'company-logos');

-- 8. ROW LEVEL SECURITY (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_sessions ENABLE ROW LEVEL SECURITY;

-- Policies companies
DROP POLICY IF EXISTS "Public Read Companies" ON companies;
CREATE POLICY "Public Read Companies" ON companies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert Companies" ON companies;
CREATE POLICY "Public Insert Companies" ON companies FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Update Companies" ON companies;
CREATE POLICY "Public Update Companies" ON companies FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public Delete Companies" ON companies;
CREATE POLICY "Public Delete Companies" ON companies FOR DELETE USING (true);

-- Policies jobs
DROP POLICY IF EXISTS "Public Read Published Jobs" ON jobs;
CREATE POLICY "Public Read Published Jobs" ON jobs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert Jobs" ON jobs;
CREATE POLICY "Public Insert Jobs" ON jobs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Update Jobs" ON jobs;
CREATE POLICY "Public Update Jobs" ON jobs FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public Delete Jobs" ON jobs;
CREATE POLICY "Public Delete Jobs" ON jobs FOR DELETE USING (true);

-- Policies applications
DROP POLICY IF EXISTS "Public Read Applications" ON applications;
CREATE POLICY "Public Read Applications" ON applications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert Applications" ON applications;
CREATE POLICY "Public Insert Applications" ON applications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Update Applications" ON applications;
CREATE POLICY "Public Update Applications" ON applications FOR UPDATE USING (true);

-- Policies telegram_sessions
DROP POLICY IF EXISTS "Public Manage Telegram Sessions" ON telegram_sessions;
CREATE POLICY "Public Manage Telegram Sessions" ON telegram_sessions FOR ALL USING (true);

-- =====================================================================
-- 9. DATA AWAL (SEED DATA PERUSAHAAN & LOWONGAN KERJA)
-- =====================================================================

-- Insert Companies
INSERT INTO companies (id, name, logo_url, industry, location, website, description)
VALUES
(
  'f87a38b2-5a21-48e2-b432-8889b76e1a00',
  'PT Maju Jaya Logistics',
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200&auto=format&fit=crop&q=80',
  'Logistik & Rantai Pasok',
  'Surabaya, Jawa Timur',
  'https://majujayalogistics.co.id',
  'Perusahaan penyedia jasa logistik pergudangan dan distribusi darat terkemuka di Indonesia Timur.'
),
(
  'e291b5c4-72fd-4251-9c88-662f551b9c00',
  'Kopi Kenangan Nusantara',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&auto=format&fit=crop&q=80',
  'Food & Beverage',
  'Jakarta Selatan, DKI Jakarta',
  'https://kopinusantara.id',
  'Jaringan gerai kopi modern menyajikan cita rasa biji kopi asli nusantara dengan standar barista profesional.'
),
(
  'a12bc903-88fe-45a1-bf89-11c7d23f8800',
  'Nusantara Tech Solusindo',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&auto=format&fit=crop&q=80',
  'Teknologi Informasi & SaaS',
  'Bandung, Jawa Barat',
  'https://nusantaratech.id',
  'Startup pengembang platform komputasi awan dan solusi otomasi bisnis untuk UMKM dan enterprise.'
)
ON CONFLICT (name) DO UPDATE SET
  industry = EXCLUDED.industry,
  location = EXCLUDED.location;

-- Insert Jobs
INSERT INTO jobs (
  id,
  company_id,
  company_name,
  company_logo,
  position,
  location,
  salary_min,
  salary_max,
  salary_text,
  employment_type,
  education,
  min_age,
  max_age,
  gender,
  experience,
  skills,
  requirements,
  responsibilities,
  benefits,
  description,
  deadline,
  slug,
  status,
  featured
) VALUES
(
  'f87a38b2-5a21-48e2-b432-8889b76e1a01',
  'f87a38b2-5a21-48e2-b432-8889b76e1a00',
  'PT Maju Jaya Logistics',
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200&auto=format&fit=crop&q=80',
  'Admin Gudang',
  'Surabaya, Jawa Timur',
  3500000,
  5000000,
  'Rp 3.500.000 - Rp 5.000.000',
  'Full-time',
  'Minimal SMA/SMK',
  18,
  30,
  'Pria/Wanita',
  'Tidak wajib (Fresh graduate dipersilakan)',
  '["Microsoft Excel", "Administrasi Stok", "Ketelitian", "Inventori"]'::jsonb,
  '["Pendidikan minimal SMA/SMK sederajat", "Usia 18 - 30 tahun", "Mampu mengoperasikan komputer dan Ms. Excel dasar", "Jujur, teliti, disiplin, dan bertanggung jawab", "Sehat jasmani dan siap bekerja di area gudang"]'::jsonb,
  '["Mencatat data keluar masuk barang gudang secara akurat ke sistem", "Melakukan stock opname fisik berkala bersama tim logistik", "Membuat rekapitulasi laporan inventori harian dan mingguan", "Berkoordinasi dengan tim picker dan driver delivery armada"]'::jsonb,
  '["BPJS Kesehatan & Ketenagakerjaan", "Tunjangan Makan & Transport", "Bonus Kinerja Bulanan", "Jenjang Karir Terbuka"]'::jsonb,
  'PT Maju Jaya Logistics membuka kesempatan berkarir bagi Anda yang berdedikasi untuk bergabung sebagai Staff Admin Gudang di warehouse cabang Surabaya.',
  '2026-11-30',
  'admin-gudang-pt-maju-jaya-surabaya',
  'published',
  true
),
(
  'e291b5c4-72fd-4251-9c88-662f551b9c02',
  'e291b5c4-72fd-4251-9c88-662f551b9c00',
  'Kopi Kenangan Nusantara',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&auto=format&fit=crop&q=80',
  'Barista & Cashier',
  'Jakarta Selatan, DKI Jakarta',
  4200000,
  5200000,
  'Rp 4.200.000 - Rp 5.200.000',
  'Full-time',
  'SMA/SMK / D3',
  19,
  26,
  'Pria/Wanita',
  'Minimal 6 bulan di F&B',
  '["Espresso Brewing", "Customer Service", "POS Cashier", "Latte Art"]'::jsonb,
  '["Pria/Wanita usia 19-26 tahun", "Berpenampilan rapi, bersih, dan ramah komunikatif", "Memiliki pengalaman sebagai barista minimal 6 bulan", "Bersedia bekerja sistem shift termasuk akhir pekan"]'::jsonb,
  '["Menyiapkan dan menyajikan aneka minuman kopi dan non-kopi sesuai SOP", "Melayani transaksi pelanggan dengan ramah menggunakan sistem POS", "Menjaga kebersihan area bar serta dining room outlet"]'::jsonb,
  '["Gaji Pokok & Insentif Target Outlet", "Tips Harian", "Pelatihan Barista Bersertifikat"]'::jsonb,
  'Kami mengundang talenta muda yang dinamis dan ramah untuk menjadi bagian dari keluarga Kopi Kenangan Nusantara di outlet Jakarta Selatan.',
  '2026-12-15',
  'barista-cashier-kopi-kenangan-jakarta-selatan',
  'published',
  true
),
(
  'a12bc903-88fe-45a1-bf89-11c7d23f8803',
  'a12bc903-88fe-45a1-bf89-11c7d23f8800',
  'Nusantara Tech Solusindo',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&auto=format&fit=crop&q=80',
  'Customer Support Specialist',
  'Bandung, Jawa Barat (Hybrid)',
  4500000,
  6500000,
  'Rp 4.500.000 - Rp 6.500.000',
  'Full-time',
  'D3 / S1 Semua Jurusan',
  21,
  32,
  'Pria/Wanita',
  'Minimal 1 tahun di Customer Service / Helpdesk',
  '["Zendesk", "Live Chat Support", "Problem Solving", "Komunikasi Empatik"]'::jsonb,
  '["Pendidikan minimal D3 atau S1 segala jurusan", "Pengalaman menangani tiket pelanggan via chat & email minimal 1 tahun", "Kemampuan mengetik cepat dan berkomunikasi empatik"]'::jsonb,
  '["Merespons tiket kendala pelanggan aplikasi secara ramah dan efisien", "Mendokumentasikan bug atau masalah teknis ke tim product & engineering", "Menjaga SLA waktu respon dan kepuasan pelanggan"]'::jsonb,
  '["Gaji Kompetitif & Tunjangan WFH", "Asuransi Kesehatan Swasta", "Jadwal Kerja Fleksibel Hybrid"]'::jsonb,
  'Nusantara Tech Solusindo mencari Customer Support Specialist yang bersemangat membantu pengguna aplikasi mendapatkan solusi terbaik.',
  '2026-11-20',
  'customer-support-nusantara-tech-bandung',
  'published',
  false
)
ON CONFLICT (slug) DO NOTHING;
