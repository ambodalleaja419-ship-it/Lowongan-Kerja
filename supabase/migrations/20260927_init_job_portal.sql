-- =====================================================================
-- KERJAKILAT JOB PORTAL & TELEGRAM BOT AI MIGRATION SCRIPT
-- Database: PostgreSQL / Supabase
-- Target: Tables, RLS, Triggers, Indexes, and Seed Data
-- =====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if needed (Clean migration)
-- DROP TABLE IF EXISTS applications CASCADE;
-- DROP TABLE IF EXISTS jobs CASCADE;
-- DROP TABLE IF EXISTS admins CASCADE;
-- DROP TABLE IF EXISTS telegram_sessions CASCADE;

-- 3. Create 'admins' table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create 'jobs' table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
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

-- 5. Create 'applications' table
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

-- 6. Create 'telegram_sessions' table (stores bot conversation state)
CREATE TABLE IF NOT EXISTS telegram_sessions (
  chat_id BIGINT PRIMARY KEY,
  step TEXT NOT NULL DEFAULT 'idle', -- 'idle', 'awaiting_job_text', 'editing_field'
  active_field TEXT,
  draft_payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Indexes for High Performance Search & Filtering
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_slug ON jobs(slug);
CREATE INDEX IF NOT EXISTS idx_jobs_published_at ON jobs(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);

-- 8. Trigger to update 'updated_at' column automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_jobs_updated_at ON jobs;
CREATE TRIGGER trigger_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_applications_updated_at ON applications;
CREATE TRIGGER trigger_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 9. Trigger for Auto Slug Generation if slug is missing
CREATE OR REPLACE FUNCTION generate_job_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := lower(regexp_replace(NEW.position || '-' || NEW.company_name || '-' || NEW.location, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from base_slug);
    final_slug := base_slug;
    
    WHILE EXISTS (SELECT 1 FROM jobs WHERE slug = final_slug AND id != NEW.id) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_jobs_slug ON jobs;
CREATE TRIGGER trigger_jobs_slug
  BEFORE INSERT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION generate_job_slug();

-- 10. ROW LEVEL SECURITY (RLS)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_sessions ENABLE ROW LEVEL SECURITY;

-- 10a. JOBS Policies:
-- Anyone can view published jobs
CREATE POLICY "Public jobs are viewable by everyone" 
  ON jobs FOR SELECT 
  USING (status = 'published');

-- Admins / Service Role have full access to jobs
CREATE POLICY "Service role can perform all actions on jobs" 
  ON jobs FOR ALL 
  USING (true)
  WITH CHECK (true);

-- 10b. APPLICATIONS Policies:
-- Public can INSERT their application
CREATE POLICY "Public candidates can submit application" 
  ON applications FOR INSERT 
  WITH CHECK (true);

-- Candidates cannot view applications of others (Only Admin / Service Role can view)
CREATE POLICY "Only service role and admins can view applications" 
  ON applications FOR SELECT 
  USING (auth.role() = 'service_role' OR auth.uid() IN (SELECT id FROM admins));

CREATE POLICY "Only service role and admins can update applications" 
  ON applications FOR UPDATE 
  USING (auth.role() = 'service_role' OR auth.uid() IN (SELECT id FROM admins));

-- 11. Initial Seed Data
INSERT INTO jobs (
  company_name,
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
  slug,
  status,
  featured,
  published_at
) VALUES 
(
  'PT Maju Jaya Logistics',
  'Admin Gudang',
  'Surabaya',
  3500000,
  5000000,
  'Rp 3.500.000 - Rp 5.000.000',
  'Full-time',
  'Minimal SMA/SMK',
  18,
  30,
  'Pria/Wanita',
  'Tidak wajib (Fresh graduate dipersilakan)',
  '["Microsoft Excel", "Administrasi Stok", "Ketelitian Tinggi"]'::jsonb,
  '["Pendidikan minimal SMA/SMK sederajat", "Usia 18 - 30 tahun", "Mampu mengoperasikan komputer dan Ms. Excel dasar", "Jujur, teliti, dan bertanggung jawab", "Sehat jasmani dan rohani"]'::jsonb,
  '["Mencatat data keluar masuk barang gudang secara akurat", "Melakukan stock opname berkala bersama tim logistik", "Membuat rekapitulasi laporan inventori harian dan mingguan", "Berkoordinasi dengan tim picker dan driver delivery"]'::jsonb,
  '["BPJS Kesehatan & Ketenagakerjaan", "Tunjangan Makan & Transport", "Bonus Kinerja Bulanan", "Jenjang Karir Terbuka"]'::jsonb,
  'PT Maju Jaya Logistics membuka kesempatan berkarir bagi Anda yang berdedikasi untuk bergabung sebagai Staff Admin Gudang di warehouse cabang Surabaya. Kami mencari kandidat yang rapi, teliti, dan siap berkembang bersama tim.',
  'admin-gudang-pt-maju-jaya-surabaya',
  'published',
  true,
  NOW()
),
(
  'Kopi Kenangan Nusantara',
  'Barista & Cashier',
  'Jakarta Selatan',
  4000000,
  4800000,
  'Rp 4.000.000 - Rp 4.800.000',
  'Full-time',
  'SMA/SMK / D3',
  19,
  26,
  'Pria/Wanita',
  'Minimal 6 bulan di F&B',
  '["Espresso Brewing", "Customer Service", "POS Cashier", "Kebersihan Bar"]'::jsonb,
  '["Pria/Wanita usia 19-26 tahun", "Berpenampilan rapi dan komunikatif", "Memiliki pengalaman sebagai barista minimal 6 bulan", "Bersedia bekerja dengan sistem shift dan akhir pekan", "Memiliki passion di dunia kopi"]'::jsonb,
  '["Menyiapkan dan menyajikan aneka minuman kopi dan non-kopi sesuai SOP", "Melayani transaksi pelanggan dengan ramah dan akurat menggunakan sistem POS", "Menjaga kebersihan dan higienitas area bar serta outlet", "Melakukan closing kasir dan inventaris bahan baku"]'::jsonb,
  '["Gaji Pokok & Insentif Target", "Tips Harian", "Pelatihan Barista Bersertifikat", "Diskon Karyawan"]'::jsonb,
  'Kami mengundang talenta muda yang dinamis dan ramah untuk menjadi bagian dari keluarga Kopi Kenangan Nusantara di outlet Jakarta Selatan.',
  'barista-cashier-kopi-kenangan-jakarta-selatan',
  'published',
  true,
  NOW()
),
(
  'Nusantara Tech Solusindo',
  'Customer Support Specialist',
  'Bandung (Hybrid)',
  4500000,
  6000000,
  'Rp 4.500.000 - Rp 6.000.000',
  'Full-time',
  'Minimal D3/S1',
  20,
  32,
  'Pria/Wanita',
  'Minimal 1 tahun customer service',
  '["Komunikasi Efektif", "Zendesk/CRM", "Problem Solving", "Bahasa Inggris Pasif"]'::jsonb,
  '["Pendidikan minimal D3/S1 semua jurusan", "Memiliki pengalaman di bidang Customer Care/Support minimal 1 tahun", "Mampu berkomunikasi dengan empati, sopan, dan jelas", "Memiliki laptop pribadi dan koneksi internet stabil untuk sistem kerja hybrid"]'::jsonb,
  '["Merespons pesan dan tiket pertanyaan pengguna melalui chat dan email", "Membantu troubleshooting kendala teknis pengguna aplikasi", "Mencatat feedback pengguna dan berkoordinasi dengan tim product development", "Membuat dokumentasi FAQ dan panduan pengguna"]'::jsonb,
  '["Kerja Hybrid (3 hari WFH, 2 hari WFO)", "Tunjangan Internet Bulanan", "Asuransi Kesehatan Swasta", "Laptop Allowance"]'::jsonb,
  'Nusantara Tech Solusindo merupakan startup SaaS yang berkembang pesat. Kami membutuhkan Customer Support Specialist yang berorientasi pada kepuasan pelanggan untuk memperkuat tim support kami.',
  'customer-support-specialist-nusantara-tech-bandung',
  'published',
  false,
  NOW()
);
