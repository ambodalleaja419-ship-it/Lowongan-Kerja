import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { initialSeedJobs, initialSeedApplications } from '../data/seedJobs';
import { initialSeedCompanies } from '../data/seedCompanies';
import { Application, ApplicationStatus, Company, Job } from '../types/job';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project.supabase.co')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const JOBS_STORAGE_KEY = 'kerjakilat_jobs_v1';
const APPLICATIONS_STORAGE_KEY = 'kerjakilat_applications_v1';
const COMPANIES_STORAGE_KEY = 'kerjakilat_companies_v1';

// Maximum logo upload size (5 MB)
export const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

function getLocalCompanies(): Company[] {
  try {
    const raw = localStorage.getItem(COMPANIES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(COMPANIES_STORAGE_KEY, JSON.stringify(initialSeedCompanies));
      return initialSeedCompanies;
    }
    return JSON.parse(raw);
  } catch {
    return initialSeedCompanies;
  }
}

function saveLocalCompanies(companies: Company[]) {
  try {
    localStorage.setItem(COMPANIES_STORAGE_KEY, JSON.stringify(companies));
  } catch (err) {
    console.error('Failed to save companies to localStorage', err);
  }
}

function getLocalJobs(): Job[] {
  try {
    const raw = localStorage.getItem(JOBS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(initialSeedJobs));
      return initialSeedJobs;
    }
    return JSON.parse(raw);
  } catch {
    return initialSeedJobs;
  }
}

function saveLocalJobs(jobs: Job[]) {
  try {
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
  } catch (err) {
    console.error('Failed to save jobs to localStorage', err);
  }
}

function getLocalApplications(): Application[] {
  try {
    const raw = localStorage.getItem(APPLICATIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(initialSeedApplications));
      return initialSeedApplications;
    }
    return JSON.parse(raw);
  } catch {
    return initialSeedApplications;
  }
}

function saveLocalApplications(apps: Application[]) {
  try {
    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(apps));
  } catch (err) {
    console.error('Failed to save applications to localStorage', err);
  }
}

export function generateSlug(position: string, company: string, location: string): string {
  const base = `${position}-${company}-${location}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base}-${Date.now().toString().slice(-4)}`;
}

export const dataService = {
  isConfiguredWithSupabase: isSupabaseConfigured,
  supabaseUrl,

  // ==========================================
  // COMPANIES & LOGO STORAGE
  // ==========================================

  async getCompanies(): Promise<Company[]> {
    const allJobs = await this.getAllJobsAdmin();
    const jobCountMap = new Map<string, number>();
    allJobs.forEach(j => {
      if (j.company_id) {
        jobCountMap.set(j.company_id, (jobCountMap.get(j.company_id) || 0) + 1);
      }
    });

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .order('name', { ascending: true });
        if (!error && data && data.length > 0) {
          return (data as Company[]).map(c => ({
            ...c,
            jobs_count: jobCountMap.get(c.id) || 0,
          }));
        }
      } catch (err) {
        console.warn('Supabase getCompanies error, using local:', err);
      }
    }

    const local = getLocalCompanies();
    return local.map(c => ({
      ...c,
      jobs_count: jobCountMap.get(c.id) || allJobs.filter(j => j.company_name.toLowerCase() === c.name.toLowerCase()).length,
    }));
  },

  async getCompanyByName(name: string): Promise<Company | null> {
    const cleanName = name.trim().toLowerCase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .ilike('name', cleanName)
          .maybeSingle();
        if (!error && data) {
          return data as Company;
        }
      } catch {
        // Fallback
      }
    }

    const local = getLocalCompanies();
    return local.find(c => c.name.trim().toLowerCase() === cleanName) || null;
  },

  async getCompanyById(id: string): Promise<Company | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) {
          return data as Company;
        }
      } catch {
        // Fallback
      }
    }

    const local = getLocalCompanies();
    return local.find(c => c.id === id) || null;
  },

  /**
   * Upload logo to Supabase Storage bucket 'company-logos'
   * Structure: company-logos/{company_id}/{unique-file-name}.png
   */
  async uploadCompanyLogo(
    companyId: string,
    file: File | Blob,
    originalName = 'logo.png'
  ): Promise<{ url: string; path: string }> {
    // 1. Validation: file size
    if (file.size > MAX_LOGO_SIZE_BYTES) {
      throw new Error('Ukuran logo terlalu besar. Maksimal 5 MB.');
    }

    // 2. Validation: format
    const mimeType = file.type || 'image/png';
    if (!ALLOWED_IMAGE_TYPES.includes(mimeType) && !ALLOWED_IMAGE_TYPES.some(t => originalName.toLowerCase().endsWith(t.replace('image/', '')))) {
      throw new Error('Format file tidak didukung. Harap gunakan format PNG, JPG, JPEG, atau WEBP.');
    }

    const ext = originalName.split('.').pop()?.toLowerCase() || 'png';
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
    const filePath = `${companyId}/${uniqueFileName}`;

    if (supabase) {
      try {
        const { error: uploadError } = await supabase.storage
          .from('company-logos')
          .upload(filePath, file, {
            contentType: mimeType,
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicData } = supabase.storage
            .from('company-logos')
            .getPublicUrl(filePath);

          return {
            url: publicData.publicUrl,
            path: filePath,
          };
        }
        console.warn('Supabase storage upload failed, falling back to Data URL:', uploadError);
      } catch (err) {
        console.warn('Supabase storage error:', err);
      }
    }

    // Fallback: convert to base64 Data URL for local / offline preview
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    return {
      url: dataUrl,
      path: filePath,
    };
  },

  async createCompany(data: {
    name: string;
    logo_url?: string | null;
    logo_path?: string | null;
    industry?: string | null;
    location?: string | null;
    website?: string | null;
    description?: string | null;
  }): Promise<Company> {
    const existing = await this.getCompanyByName(data.name);
    if (existing) {
      // If company already exists, update logo if provided
      if (data.logo_url && data.logo_url !== existing.logo_url) {
        return (await this.updateCompany(existing.id, {
          logo_url: data.logo_url,
          logo_path: data.logo_path ?? existing.logo_path,
        })) || existing;
      }
      return existing;
    }

    const newCompany: Company = {
      id: crypto.randomUUID ? crypto.randomUUID() : `comp-${Date.now()}`,
      name: data.name.trim(),
      logo_url: data.logo_url || null,
      logo_path: data.logo_path || null,
      industry: data.industry?.trim() || null,
      location: data.location?.trim() || null,
      website: data.website?.trim() || null,
      description: data.description?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (supabase) {
      try {
        const { data: inserted, error } = await supabase
          .from('companies')
          .insert([newCompany])
          .select()
          .single();
        if (!error && inserted) {
          const current = getLocalCompanies();
          saveLocalCompanies([inserted as Company, ...current]);
          return inserted as Company;
        }
      } catch (err) {
        console.warn('Supabase company insert error, saving locally:', err);
      }
    }

    const current = getLocalCompanies();
    saveLocalCompanies([newCompany, ...current]);
    return newCompany;
  },

  async updateCompany(id: string, updates: Partial<Company>): Promise<Company | null> {
    const patch = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('companies')
          .update(patch)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          const current = getLocalCompanies().map(c => (c.id === id ? { ...c, ...patch } : c));
          saveLocalCompanies(current);

          // Automatically cascade logo update to all jobs of this company
          if (patch.logo_url !== undefined) {
            await this.updateJobsLogoForCompany(id, patch.logo_url);
          }

          return data as Company;
        }
      } catch (err) {
        console.warn('Supabase company update error:', err);
      }
    }

    const current = getLocalCompanies();
    let updatedComp: Company | null = null;
    const next = current.map(c => {
      if (c.id === id) {
        updatedComp = { ...c, ...patch } as Company;
        return updatedComp;
      }
      return c;
    });
    saveLocalCompanies(next);

    // Cascade logo update to all jobs in local store
    if (patch.logo_url !== undefined) {
      await this.updateJobsLogoForCompany(id, patch.logo_url);
    }

    return updatedComp;
  },

  async updateJobsLogoForCompany(companyId: string, newLogoUrl: string | null) {
    if (supabase) {
      try {
        await supabase
          .from('jobs')
          .update({ company_logo: newLogoUrl, updated_at: new Date().toISOString() })
          .eq('company_id', companyId);
      } catch (err) {
        console.warn('Cascade update company_logo in supabase failed:', err);
      }
    }

    const currentJobs = getLocalJobs();
    const company = await this.getCompanyById(companyId);
    const updatedJobs = currentJobs.map(job => {
      if (job.company_id === companyId || (company && job.company_name.toLowerCase() === company.name.toLowerCase())) {
        return { ...job, company_logo: newLogoUrl, updated_at: new Date().toISOString() };
      }
      return job;
    });
    saveLocalJobs(updatedJobs);
  },

  async deleteCompany(id: string): Promise<{ success: boolean; error?: string }> {
    const allJobs = await this.getAllJobsAdmin();
    const hasJobs = allJobs.some(j => j.company_id === id && j.status !== 'archived');
    if (hasJobs) {
      return {
        success: false,
        error: 'Tidak dapat menghapus perusahaan yang masih memiliki lowongan kerja aktif.',
      };
    }

    if (supabase) {
      try {
        await supabase.from('companies').delete().eq('id', id);
      } catch {
        // Fallback
      }
    }

    const current = getLocalCompanies().filter(c => c.id !== id);
    saveLocalCompanies(current);
    return { success: true };
  },

  // ==========================================
  // JOBS DATA METHODS
  // ==========================================

  async getPublishedJobs(params?: {
    search?: string;
    location?: string;
    education?: string;
    employmentType?: string;
    sortBy?: 'newest' | 'relevant';
  }): Promise<Job[]> {
    if (supabase) {
      try {
        let query = supabase
          .from('jobs')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false });

        if (params?.location && params.location !== 'Semua Lokasi') {
          query = query.ilike('location', `%${params.location}%`);
        }
        if (params?.education && params.education !== 'Semua Pendidikan') {
          query = query.ilike('education', `%${params.education}%`);
        }
        if (params?.employmentType && params.employmentType !== 'Semua Tipe') {
          query = query.eq('employment_type', params.employmentType);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          let list = data as Job[];
          if (params?.search) {
            const q = params.search.toLowerCase();
            list = list.filter(
              j =>
                j.position.toLowerCase().includes(q) ||
                j.company_name.toLowerCase().includes(q) ||
                j.location.toLowerCase().includes(q) ||
                (j.skills && j.skills.some(s => s.toLowerCase().includes(q)))
            );
          }
          return list;
        }
      } catch (err) {
        console.warn('Supabase query error, falling back to local database:', err);
      }
    }

    // Local DB fallback
    let list = getLocalJobs().filter(j => j.status === 'published');
    if (params?.location && params.location !== 'Semua Lokasi') {
      list = list.filter(j => j.location.toLowerCase().includes(params.location!.toLowerCase()));
    }
    if (params?.education && params.education !== 'Semua Pendidikan') {
      list = list.filter(j => (j.education || '').toLowerCase().includes(params.education!.toLowerCase()));
    }
    if (params?.employmentType && params.employmentType !== 'Semua Tipe') {
      list = list.filter(j => j.employment_type === params.employmentType);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        j =>
          j.position.toLowerCase().includes(q) ||
          j.company_name.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          (j.skills && j.skills.some(s => s.toLowerCase().includes(q)))
      );
    }

    if (params?.sortBy === 'newest') {
      list.sort((a, b) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime());
    }

    return list;
  },

  async getAllJobsAdmin(): Promise<Job[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data as Job[];
        }
      } catch (err) {
        console.warn('Supabase error, using local jobs:', err);
      }
    }
    return getLocalJobs().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getJobBySlug(slug: string): Promise<Job | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('slug', slug)
          .single();
        if (!error && data) return data as Job;
      } catch {
        // Fallback
      }
    }
    const jobs = getLocalJobs();
    return jobs.find(j => j.slug === slug || j.id === slug) || null;
  },

  async createJob(jobData: Partial<Job>): Promise<Job> {
    // Automatically link or create company record if company_name provided
    let companyId = jobData.company_id || null;
    let companyLogo = jobData.company_logo || null;

    if (jobData.company_name) {
      const company = await this.createCompany({
        name: jobData.company_name,
        logo_url: companyLogo,
      });
      companyId = company.id;
      if (!companyLogo && company.logo_url) {
        companyLogo = company.logo_url;
      }
    }

    const slug = jobData.slug || generateSlug(jobData.position || 'Loker', jobData.company_name || 'Perusahaan', jobData.location || 'Indonesia');
    const newJob: Job = {
      id: crypto.randomUUID ? crypto.randomUUID() : `job-${Date.now()}`,
      company_id: companyId,
      company_name: jobData.company_name || 'Perusahaan Mitra',
      company_logo: companyLogo,
      position: jobData.position || 'Lowongan Kerja',
      location: jobData.location || 'Indonesia',
      salary_min: jobData.salary_min ?? null,
      salary_max: jobData.salary_max ?? null,
      salary_text: jobData.salary_text || (jobData.salary_min && jobData.salary_max ? `Rp ${jobData.salary_min.toLocaleString('id-ID')} - Rp ${jobData.salary_max.toLocaleString('id-ID')}` : null),
      employment_type: jobData.employment_type || 'Full-time',
      education: jobData.education || null,
      min_age: jobData.min_age ?? null,
      max_age: jobData.max_age ?? null,
      gender: jobData.gender || null,
      experience: jobData.experience || null,
      skills: jobData.skills || [],
      requirements: jobData.requirements || [],
      responsibilities: jobData.responsibilities || [],
      benefits: jobData.benefits || [],
      description: jobData.description || 'Deskripsi pekerjaan belum diisi.',
      deadline: jobData.deadline || null,
      application_url: jobData.application_url || null,
      slug,
      status: jobData.status || 'published',
      featured: jobData.featured ?? false,
      published_at: jobData.status === 'published' ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (supabase) {
      try {
        const { data, error } = await supabase.from('jobs').insert([newJob]).select().single();
        if (!error && data) {
          const current = getLocalJobs();
          saveLocalJobs([data as Job, ...current]);
          return data as Job;
        }
      } catch (err) {
        console.warn('Supabase insert failed, saving to local store:', err);
      }
    }

    const current = getLocalJobs();
    const updated = [newJob, ...current];
    saveLocalJobs(updated);
    return newJob;
  },

  async updateJob(id: string, updates: Partial<Job>): Promise<Job | null> {
    const patch = {
      ...updates,
      updated_at: new Date().toISOString(),
      ...(updates.status === 'published' && !updates.published_at ? { published_at: new Date().toISOString() } : {})
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .update(patch)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          const current = getLocalJobs().map(j => (j.id === id ? { ...j, ...patch } : j));
          saveLocalJobs(current);
          return data as Job;
        }
      } catch {
        // Fallback
      }
    }

    const current = getLocalJobs();
    let updatedJob: Job | null = null;
    const next = current.map(j => {
      if (j.id === id) {
        updatedJob = { ...j, ...patch } as Job;
        return updatedJob;
      }
      return j;
    });
    saveLocalJobs(next);
    return updatedJob;
  },

  async deleteJob(id: string): Promise<boolean> {
    if (supabase) {
      try {
        await supabase.from('jobs').delete().eq('id', id);
      } catch {
        // Fallback
      }
    }
    const current = getLocalJobs().filter(j => j.id !== id);
    saveLocalJobs(current);
    return true;
  },

  // ==========================================
  // APPLICATIONS METHODS
  // ==========================================

  async submitApplication(applicationData: {
    job_id: string;
    full_name: string;
    domicile: string;
    age: number;
    applied_position: string;
    telegram_username: string;
    telegram_number?: string;
    consent: boolean;
  }): Promise<{ success: boolean; application: Application; error?: string }> {
    const newApp: Application = {
      id: crypto.randomUUID ? crypto.randomUUID() : `app-${Date.now()}`,
      job_id: applicationData.job_id,
      full_name: applicationData.full_name.trim(),
      domicile: applicationData.domicile.trim(),
      age: Number(applicationData.age),
      applied_position: applicationData.applied_position.trim(),
      telegram_username: applicationData.telegram_username.startsWith('@')
        ? applicationData.telegram_username.trim()
        : `@${applicationData.telegram_username.trim()}`,
      telegram_number: applicationData.telegram_number?.trim() || null,
      consent: applicationData.consent,
      status: 'NEW',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (supabase) {
      try {
        const { data, error } = await supabase.from('applications').insert([newApp]).select().single();
        if (!error && data) {
          const current = getLocalApplications();
          saveLocalApplications([data as Application, ...current]);
        }
      } catch (err) {
        console.warn('Supabase application submission failed, storing locally:', err);
      }
    }

    const current = getLocalApplications();
    saveLocalApplications([newApp, ...current]);

    // Send Telegram Notification to Admin via API
    try {
      fetch('/api/applications/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application: newApp }),
      }).catch(err => console.log('Telegram notify silent err:', err));
    } catch {
      // Ignore background notification error
    }

    return { success: true, application: newApp };
  },

  async getApplications(): Promise<Application[]> {
    const jobs = getLocalJobs();
    const jobMap = new Map(jobs.map(j => [j.id, j]));

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return (data as Application[]).map(app => ({
            ...app,
            job: jobMap.get(app.job_id),
          }));
        }
      } catch {
        // Fallback
      }
    }

    const list = getLocalApplications().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list.map(app => ({
      ...app,
      job: jobMap.get(app.job_id),
    }));
  },

  async updateApplicationStatus(id: string, status: ApplicationStatus): Promise<boolean> {
    if (supabase) {
      try {
        await supabase.from('applications').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
      } catch {
        // Fallback
      }
    }
    const current = getLocalApplications();
    const next = current.map(app => (app.id === id ? { ...app, status, updated_at: new Date().toISOString() } : app));
    saveLocalApplications(next);
    return true;
  }
};
