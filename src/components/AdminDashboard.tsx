import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  CheckCircle,
  Clock,
  Plus,
  Trash2,
  Edit,
  Eye,
  Star,
  ExternalLink,
  MessageSquare,
  FileText,
  Copy,
  Check,
  Search,
  Sparkles,
  Bot,
  Database,
  Key,
  Shield,
  Send,
  AlertCircle,
  Building2,
  Image as ImageIcon,
  Upload,
  Globe,
  MapPin,
  X
} from 'lucide-react';
import { Application, ApplicationStatus, Company, Job } from '../types/job';
import { dataService, MAX_LOGO_SIZE_BYTES, ALLOWED_IMAGE_TYPES } from '../services/dataService';
import { TelegramBotSimulator } from './TelegramBotSimulator';
import { CompanyLogo } from './CompanyLogo';

interface AdminDashboardProps {
  onViewJob: (job: Job) => void;
  onNavigateHome: () => void;
}

const STATUS_COLORS: Record<ApplicationStatus, { bg: string; text: string; label: string }> = {
  NEW: { bg: 'bg-amber-100 border-amber-200', text: 'text-amber-800', label: 'Baru' },
  CONTACTED: { bg: 'bg-blue-100 border-blue-200', text: 'text-blue-800', label: 'Dihubungi' },
  CV_REQUESTED: { bg: 'bg-purple-100 border-purple-200', text: 'text-purple-800', label: 'Minta CV' },
  CV_RECEIVED: { bg: 'bg-indigo-100 border-indigo-200', text: 'text-indigo-800', label: 'CV Diterima' },
  INTERVIEW: { bg: 'bg-sky-100 border-sky-200', text: 'text-sky-800', label: 'Interview' },
  ACCEPTED: { bg: 'bg-emerald-100 border-emerald-200', text: 'text-emerald-800', label: 'Diterima' },
  REJECTED: { bg: 'bg-rose-100 border-rose-200', text: 'text-rose-800', label: 'Ditolak' },
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onViewJob,
  onNavigateHome,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'applications' | 'companies' | 'bot' | 'guide'>('overview');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [jobSearch, setJobSearch] = useState('');
  const [appSearch, setAppSearch] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState<string>('ALL');

  // Minta CV modal state
  const [selectedAppForCV, setSelectedAppForCV] = useState<Application | null>(null);
  const [copiedCVText, setCopiedCVText] = useState(false);

  // Company management modal states
  const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);

  // Company Form fields
  const [compFormName, setCompFormName] = useState('');
  const [compFormIndustry, setCompFormIndustry] = useState('');
  const [compFormLocation, setCompFormLocation] = useState('');
  const [compFormWebsite, setCompFormWebsite] = useState('');
  const [compFormDescription, setCompFormDescription] = useState('');
  const [compFormLogoFile, setCompFormLogoFile] = useState<File | null>(null);
  const [compFormLogoPreview, setCompFormLogoPreview] = useState<string | null>(null);
  const [savingCompany, setSavingCompany] = useState(false);

  // New Job modal state
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);
  const [newJobForm, setNewJobForm] = useState<Partial<Job>>({
    company_name: '',
    position: '',
    location: '',
    salary_min: 3000000,
    salary_max: 5000000,
    salary_text: '',
    employment_type: 'Full-time',
    education: 'Minimal SMA/SMK',
    description: '',
    requirements: ['Pria/Wanita', 'Jujur dan teliti'],
  });

  // Copied SQL state
  const [copiedSql, setCopiedSql] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedJobs, fetchedApps, fetchedCompanies] = await Promise.all([
        dataService.getAllJobsAdmin(),
        dataService.getApplications(),
        dataService.getCompanies(),
      ]);
      setJobs(fetchedJobs);
      setApplications(fetchedApps);
      setCompanies(fetchedCompanies);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Metrics
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => j.status === 'published').length;
  const newApplications = applications.filter((a) => a.status === 'NEW').length;
  const inProgressApplications = applications.filter((a) =>
    ['CONTACTED', 'CV_REQUESTED', 'CV_RECEIVED', 'INTERVIEW'].includes(a.status)
  ).length;
  const acceptedApplications = applications.filter((a) => a.status === 'ACCEPTED').length;

  const handleToggleJobStatus = async (job: Job) => {
    const nextStatus = job.status === 'published' ? 'draft' : 'published';
    await dataService.updateJob(job.id, { status: nextStatus });
    await loadData();
  };

  const handleToggleFeatured = async (job: Job) => {
    await dataService.updateJob(job.id, { featured: !job.featured });
    await loadData();
  };

  const handleDeleteJob = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus lowongan ini?')) {
      await dataService.deleteJob(id);
      await loadData();
    }
  };

  const handleUpdateAppStatus = async (id: string, status: ApplicationStatus) => {
    await dataService.updateApplicationStatus(id, status);
    await loadData();
  };

  const handleSaveNewJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobForm.company_name || !newJobForm.position || !newJobForm.location) {
      alert('Nama perusahaan, posisi, dan lokasi wajib diisi.');
      return;
    }

    await dataService.createJob({
      ...newJobForm,
      status: 'published',
    });
    setIsAddJobModalOpen(false);
    await loadData();
  };

  // Company management handlers
  const handleOpenAddCompany = () => {
    setCompFormName('');
    setCompFormIndustry('');
    setCompFormLocation('');
    setCompFormWebsite('');
    setCompFormDescription('');
    setCompFormLogoFile(null);
    setCompFormLogoPreview(null);
    setIsAddCompanyModalOpen(true);
  };

  const handleOpenEditCompany = (c: Company) => {
    setEditingCompany(c);
    setCompFormName(c.name);
    setCompFormIndustry(c.industry || '');
    setCompFormLocation(c.location || '');
    setCompFormWebsite(c.website || '');
    setCompFormDescription(c.description || '');
    setCompFormLogoFile(null);
    setCompFormLogoPreview(c.logo_url || null);
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_LOGO_SIZE_BYTES) {
      alert('Ukuran logo terlalu besar. Maksimal 5 MB.');
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      alert('Format file tidak didukung. Harap gunakan format PNG, JPG, JPEG, atau WEBP.');
      return;
    }

    setCompFormLogoFile(file);
    const preview = URL.createObjectURL(file);
    setCompFormLogoPreview(preview);
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compFormName.trim()) {
      alert('Nama perusahaan wajib diisi.');
      return;
    }

    setSavingCompany(true);
    try {
      let logoUrl = compFormLogoPreview;
      let logoPath: string | undefined = undefined;

      if (editingCompany) {
        if (compFormLogoFile) {
          const uploadRes = await dataService.uploadCompanyLogo(editingCompany.id, compFormLogoFile, compFormLogoFile.name);
          logoUrl = uploadRes.url;
          logoPath = uploadRes.path;
        }
        await dataService.updateCompany(editingCompany.id, {
          name: compFormName.trim(),
          industry: compFormIndustry.trim() || null,
          location: compFormLocation.trim() || null,
          website: compFormWebsite.trim() || null,
          description: compFormDescription.trim() || null,
          logo_url: logoUrl,
          logo_path: logoPath,
        });
        setEditingCompany(null);
      } else {
        const newComp = await dataService.createCompany({
          name: compFormName.trim(),
          industry: compFormIndustry.trim() || null,
          location: compFormLocation.trim() || null,
          website: compFormWebsite.trim() || null,
          description: compFormDescription.trim() || null,
        });

        if (compFormLogoFile) {
          const uploadRes = await dataService.uploadCompanyLogo(newComp.id, compFormLogoFile, compFormLogoFile.name);
          await dataService.updateCompany(newComp.id, {
            logo_url: uploadRes.url,
            logo_path: uploadRes.path,
          });
        }
        setIsAddCompanyModalOpen(false);
      }

      await loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan perusahaan.');
    } finally {
      setSavingCompany(false);
    }
  };

  const handleDeleteCompany = async (c: Company) => {
    if (confirm(`Apakah Anda yakin ingin menghapus perusahaan "${c.name}"?`)) {
      const res = await dataService.deleteCompany(c.id);
      if (!res.success) {
        alert(res.error || 'Gagal menghapus perusahaan.');
        return;
      }
      await loadData();
    }
  };

  // Filtered jobs
  const filteredJobs = jobs.filter((j) => {
    if (!jobSearch.trim()) return true;
    const q = jobSearch.toLowerCase();
    return (
      j.position.toLowerCase().includes(q) ||
      j.company_name.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q)
    );
  });

  // Filtered companies
  const filteredCompanies = companies.filter((c) => {
    if (!companySearch.trim()) return true;
    const q = companySearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.industry && c.industry.toLowerCase().includes(q)) ||
      (c.location && c.location.toLowerCase().includes(q))
    );
  });

  // Filtered applications
  const filteredApplications = applications.filter((app) => {
    const matchStatus = appStatusFilter === 'ALL' || app.status === appStatusFilter;
    if (!matchStatus) return false;
    if (!appSearch.trim()) return true;
    const q = appSearch.toLowerCase();
    return (
      app.full_name.toLowerCase().includes(q) ||
      app.applied_position.toLowerCase().includes(q) ||
      app.telegram_username.toLowerCase().includes(q) ||
      app.domicile.toLowerCase().includes(q)
    );
  });

  const getCVTemplateMessage = (app: Application) => {
    return `Halo Kak ${app.full_name}, kami dari tim rekrutmen ${
      app.job?.company_name || 'KerjaKilat'
    }.\n\nTerima kasih telah melamar untuk posisi *${
      app.applied_position
    }* melalui website KerjaKilat.\n\nData lamaran Anda telah kami terima dengan baik. Untuk melanjutkan ke tahapan seleksi berkas, mohon mengirimkan file dokumen CV (Curriculum Vitae) dan portofolio terbaru Anda melalui balasan chat ini.\n\nTerima kasih!`;
  };

  const handleCopyCVTemplate = (app: Application) => {
    const text = getCVTemplateMessage(app);
    navigator.clipboard?.writeText(text);
    setCopiedCVText(true);
    setTimeout(() => setCopiedCVText(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      {/* Admin Top Navigation */}
      <div className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold shadow-xs">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight">Admin Dashboard</span>
                <span className="text-[10px] ml-2 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  KerjaKilat
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('bot')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bot AI Studio</span>
              </button>
              <button
                onClick={onNavigateHome}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Kembali ke Portal
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center space-x-1 sm:space-x-4 border-t border-slate-800 text-xs sm:text-sm overflow-x-auto py-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'overview' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Ringkasan
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'jobs' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Lowongan</span>
              <span className="text-[10px] bg-slate-700 px-1.5 py-0.2 rounded-full">{jobs.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'companies' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>🏢 Perusahaan</span>
              <span className="text-[10px] bg-slate-700 px-1.5 py-0.2 rounded-full">{companies.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'applications' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Lamaran Pelamar</span>
              {newApplications > 0 && (
                <span className="text-[10px] bg-amber-500 text-slate-900 font-bold px-1.5 py-0.2 rounded-full">
                  {newApplications}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('bot')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'bot' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-sky-400" />
              <span>Telegram Bot AI</span>
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'guide' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              <span>Panduan Setup</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* OVERVIEW METRICS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Lowongan</span>
              <Briefcase className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{totalJobs}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Tercatat di sistem</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Perusahaan Mitra</span>
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-2">{companies.length}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Tersimpan di database</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Lamaran Baru</span>
              <Users className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-2">{newApplications}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Perlu review admin</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Diproses</span>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 mt-2">{inProgressApplications}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">CV / Interview</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Diterima</span>
              <Star className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{acceptedApplications}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Lolos seleksi</span>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions & Recent Jobs */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900">Lowongan Terbaru</h3>
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    Lihat Semua ({jobs.length})
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {jobs.slice(0, 4).map((job) => (
                    <div key={job.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <CompanyLogo src={job.company_logo} name={job.company_name} size="sm" />
                        <div>
                          <div className="font-bold text-sm text-slate-900 hover:text-blue-600 cursor-pointer" onClick={() => onViewJob(job)}>
                            {job.position}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {job.company_name} • {job.location}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            job.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {job.status === 'published' ? 'Aktif' : 'Draft'}
                        </span>
                        <button
                          onClick={() => onViewJob(job)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Applications */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900">Lamaran Masuk Terbaru</h3>
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    Kelola Semua ({applications.length})
                  </button>
                </div>

                {applications.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Belum ada lamaran masuk.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 text-xs">
                    {applications.slice(0, 4).map((app) => (
                      <div key={app.id} className="py-3 flex items-center justify-between gap-4">
                        <div>
                          <div className="font-bold text-sm text-slate-900">{app.full_name}</div>
                          <div className="text-slate-500 mt-0.5">
                            Melamar: <strong>{app.applied_position}</strong> • {app.domicile}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              STATUS_COLORS[app.status]?.bg || 'bg-slate-100'
                            } ${STATUS_COLORS[app.status]?.text || 'text-slate-700'}`}
                          >
                            {STATUS_COLORS[app.status]?.label || app.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="space-y-6">
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-700 text-white p-6 rounded-3xl shadow-lg shadow-blue-500/10 space-y-4">
                <div className="flex items-center gap-2">
                  <Bot className="w-6 h-6 text-sky-300" />
                  <h4 className="font-extrabold text-base">Telegram Bot AI Studio</h4>
                </div>
                <p className="text-xs text-blue-100 leading-relaxed">
                  Admin dapat langsung mengirimkan teks lowongan kerja mentah beserta logo perusahaan ke bot untuk di-parse oleh AI Gemini dan dipublikasikan otomatis.
                </p>
                <button
                  onClick={() => setActiveTab('bot')}
                  className="w-full py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Buka Telegram Bot Simulator →
                </button>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-sm font-bold text-slate-900">Aksi Cepat</h4>
                <div className="space-y-2 text-xs">
                  <button
                    onClick={() => handleOpenAddCompany()}
                    className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 font-semibold flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span>Tambah Perusahaan Baru</span>
                    </span>
                    <span>+</span>
                  </button>
                  <button
                    onClick={() => setIsAddJobModalOpen(true)}
                    className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 font-semibold flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-emerald-600" />
                      <span>Tambah Lowongan Manual</span>
                    </span>
                    <span>+</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('guide')}
                    className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 font-semibold flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-500" />
                      <span>Lihat Script SQL Supabase</span>
                    </span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANAJEMEN LOWONGAN */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Manajemen Lowongan Kerja</h3>
                <p className="text-xs text-slate-500">
                  Kelola, edit, ubah status tayang, atau hapus lowongan pekerjaan.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('bot')}
                  className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Bot className="w-4 h-4" />
                  <span>Tambah via Bot AI</span>
                </button>
                <button
                  onClick={() => setIsAddJobModalOpen(true)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Manual</span>
                </button>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                placeholder="Cari posisi, perusahaan, atau kota..."
                className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Jobs Table */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">Posisi & Perusahaan</th>
                      <th className="py-3.5 px-4">Lokasi & Gaji</th>
                      <th className="py-3.5 px-4">Pendidikan</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredJobs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          Tidak ada lowongan yang sesuai.
                        </td>
                      </tr>
                    ) : (
                      filteredJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <CompanyLogo src={job.company_logo} name={job.company_name} size="sm" />
                              <div>
                                <div className="font-bold text-slate-900">{job.position}</div>
                                <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                  <span>{job.company_name}</span>
                                  {job.featured && (
                                    <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-semibold">
                                      Unggulan
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div>{job.location}</div>
                            <div className="text-xs text-emerald-600 font-medium mt-0.5">
                              {job.salary_text || (job.salary_min ? `Rp ${job.salary_min.toLocaleString('id-ID')}` : 'Tidak dicantumkan')}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-600">
                            {job.education || '-'}
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleToggleJobStatus(job)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border cursor-pointer ${
                                job.status === 'published'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {job.status === 'published' ? '● Tayang' : '○ Draft'}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleToggleFeatured(job)}
                                className={`p-1.5 rounded-lg border cursor-pointer ${
                                  job.featured
                                    ? 'bg-amber-50 text-amber-600 border-amber-200'
                                    : 'text-slate-400 border-slate-200 hover:text-amber-500'
                                }`}
                                title={job.featured ? 'Hapus dari Unggulan' : 'Jadikan Unggulan'}
                              >
                                <Star className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onViewJob(job)}
                                className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"
                                title="Lihat di Portal"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteJob(job.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 cursor-pointer"
                                title="Hapus Lowongan"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MANAJEMEN PERUSAHAAN & LOGO (SECTION 14) */}
        {activeTab === 'companies' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span>Manajemen Perusahaan & Logo</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar perusahaan terdaftar, logo Supabase Storage, dan lowongan aktif yang terhubung.
                </p>
              </div>

              <button
                onClick={handleOpenAddCompany}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Perusahaan</span>
              </button>
            </div>

            {/* Search Box */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
                placeholder="Cari nama perusahaan, industri, atau lokasi..."
                className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Companies Grid */}
            {filteredCompanies.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
                <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700 text-sm">Tidak ada perusahaan ditemukan</h4>
                <p className="text-xs text-slate-400">
                  Tambahkan perusahaan baru atau kirimkan teks loker melalui Bot Telegram.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCompanies.map((comp) => (
                  <div
                    key={comp.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 p-5 flex flex-col justify-between space-y-4 shadow-2xs transition-all"
                  >
                    <div>
                      {/* Top Logo & Title */}
                      <div className="flex items-start gap-3.5">
                        <CompanyLogo src={comp.logo_url} name={comp.name} size="lg" />
                        <div className="truncate">
                          <h4 className="font-bold text-sm text-slate-900 truncate">
                            {comp.name}
                          </h4>
                          <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                            {comp.industry && (
                              <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                                {comp.industry}
                              </span>
                            )}
                            {comp.location && (
                              <span className="text-[11px] text-slate-500 flex items-center gap-0.5">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {comp.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {comp.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 mt-3 leading-relaxed">
                          {comp.description}
                        </p>
                      )}
                    </div>

                    {/* Stats & Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-xs">
                        <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          {comp.jobs_count || 0} Lowongan
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setViewingCompany(comp)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Lihat Detail & Daftar Lowongan"
                        >
                          Lihat
                        </button>
                        <button
                          onClick={() => handleOpenEditCompany(comp)}
                          className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Perusahaan & Ganti Logo"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCompany(comp)}
                          disabled={Boolean(comp.jobs_count && comp.jobs_count > 0)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title={
                            comp.jobs_count && comp.jobs_count > 0
                              ? 'Tidak dapat dihapus karena masih memiliki lowongan aktif'
                              : 'Hapus Perusahaan'
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MANAJEMEN LAMARAN PELAMAR */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Lamaran Kandidat Masuk</h3>
                <p className="text-xs text-slate-500">
                  Kelola data pelamar, ubah status seleksi, dan hubungi via Telegram.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs overflow-x-auto">
                <button
                  onClick={() => setAppStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
                    appStatusFilter === 'ALL' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Semua ({applications.length})
                </button>
                <button
                  onClick={() => setAppStatusFilter('NEW')}
                  className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
                    appStatusFilter === 'NEW' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Baru ({newApplications})
                </button>
                <button
                  onClick={() => setAppStatusFilter('ACCEPTED')}
                  className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
                    appStatusFilter === 'ACCEPTED' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Diterima ({acceptedApplications})
                </button>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                placeholder="Cari nama kandidat, posisi, atau username Telegram..."
                className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">Kandidat</th>
                      <th className="py-3.5 px-4">Posisi & Perusahaan</th>
                      <th className="py-3.5 px-4">Kontak Telegram</th>
                      <th className="py-3.5 px-4">Status Seleksi</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Aksi Tindak Lanjut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          Tidak ada data lamaran yang sesuai filter.
                        </td>
                      </tr>
                    ) : (
                      filteredApplications.map((app) => {
                        const cleanUsername = app.telegram_username.replace('@', '');
                        return (
                          <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3.5 px-4 sm:px-6">
                              <div className="font-bold text-slate-900">{app.full_name}</div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                {app.domicile} • {app.age} tahun
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-slate-900">{app.applied_position}</div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                {app.job?.company_name || 'Perusahaan'}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <a
                                href={`https://t.me/${cleanUsername}`}
                                target="_blank"
                                rel="noreferrer"
                                className="font-mono text-sky-600 hover:underline flex items-center gap-1 font-semibold"
                              >
                                <span>{app.telegram_username}</span>
                                <ExternalLink className="w-3 h-3 text-sky-500" />
                              </a>
                              {app.telegram_number && (
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  {app.telegram_number}
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <select
                                value={app.status}
                                onChange={(e) =>
                                  handleUpdateAppStatus(app.id, e.target.value as ApplicationStatus)
                                }
                                className={`px-2.5 py-1 rounded-xl text-xs font-bold border focus:outline-none cursor-pointer ${
                                  STATUS_COLORS[app.status]?.bg || 'bg-slate-100 text-slate-700'
                                } ${STATUS_COLORS[app.status]?.text || ''}`}
                              >
                                <option value="NEW">Baru</option>
                                <option value="CONTACTED">Dihubungi</option>
                                <option value="CV_REQUESTED">Minta CV</option>
                                <option value="CV_RECEIVED">CV Diterima</option>
                                <option value="INTERVIEW">Interview</option>
                                <option value="ACCEPTED">Diterima</option>
                                <option value="REJECTED">Ditolak</option>
                              </select>
                            </td>
                            <td className="py-3.5 px-4 sm:px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setSelectedAppForCV(app)}
                                  className="px-2.5 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Kirim Template Permintaan CV"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>Minta CV</span>
                                </button>
                                <a
                                  href={`https://t.me/${cleanUsername}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2.5 py-1.5 bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                                  title="Chat di Telegram"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Hubungi</span>
                                </a>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: TELEGRAM BOT AI STUDIO */}
        {activeTab === 'bot' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Telegram Bot & AI Parser Studio</h3>
              <p className="text-xs text-slate-500">
                Uji langsung pengiriman teks lowongan mentah dan upload logo perusahaan sebelum tayang otomatis di website.
              </p>
            </div>
            <TelegramBotSimulator
              onJobPublished={() => loadData()}
              onViewJobDetail={(job) => onViewJob(job)}
            />
          </div>
        )}

        {/* TAB 6: SETUP & DOCUMENTATION GUIDE */}
        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Panduan Lengkap Setup & Integrasi</h3>
              <p className="text-xs text-slate-500">
                Langkah demi langkah bagi pemula untuk menghubungkan Supabase, Storage bucket, Telegram Bot, dan Gemini API.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 text-xs sm:text-sm">
              <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <span>1. Setup Database & Storage Supabase</span>
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Tabel <code>companies</code>, <code>jobs</code>, <code>applications</code>, dan bucket Storage <code>company-logos</code> sudah disiapkan dalam file migration. Anda cukup menyalin script SQL berikut dan mengeksekusinya di menu <strong>SQL Editor</strong> dashboard Supabase Anda.
              </p>
              <div className="relative">
                <button
                  onClick={() => {
                    const sql = `-- Eksekusi di SQL Editor Supabase
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  logo_path TEXT,
  industry TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_logo TEXT;
INSERT INTO storage.buckets (id, name, public) VALUES ('company-logos', 'company-logos', true) ON CONFLICT DO NOTHING;`;
                    navigator.clipboard?.writeText(sql);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2000);
                  }}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Tersalin' : 'Salin SQL'}</span>
                </button>
                <pre className="p-4 bg-slate-900 text-slate-200 rounded-2xl text-xs overflow-x-auto font-mono">
{`-- SQL Migration: Companies & Storage Bucket
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  logo_path TEXT,
  industry TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_logo TEXT;

INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;`}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: TAMBAH PERUSAHAAN (SECTION 14) */}
      {isAddCompanyModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-150 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Tambah Perusahaan Baru</span>
              </h3>
              <button
                onClick={() => setIsAddCompanyModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Perusahaan / PT *
                </label>
                <input
                  type="text"
                  required
                  value={compFormName}
                  onChange={(e) => setCompFormName(e.target.value)}
                  placeholder="Contoh: PT Maju Jaya Logistics"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              {/* Logo Upload Box */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Logo Perusahaan (PNG/JPG/WEBP, Maks 5 MB)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                    {compFormLogoPreview ? (
                      <img
                        src={compFormLogoPreview}
                        alt="Preview"
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleLogoFileChange}
                    className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Industri
                  </label>
                  <input
                    type="text"
                    value={compFormIndustry}
                    onChange={(e) => setCompFormIndustry(e.target.value)}
                    placeholder="Contoh: Logistik"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lokasi Kantor
                  </label>
                  <input
                    type="text"
                    value={compFormLocation}
                    onChange={(e) => setCompFormLocation(e.target.value)}
                    placeholder="Contoh: Surabaya"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Website Perusahaan
                </label>
                <input
                  type="url"
                  value={compFormWebsite}
                  onChange={(e) => setCompFormWebsite(e.target.value)}
                  placeholder="https://perusahaan.co.id"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi Perusahaan
                </label>
                <textarea
                  rows={2}
                  value={compFormDescription}
                  onChange={(e) => setCompFormDescription(e.target.value)}
                  placeholder="Profil singkat perusahaan..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setIsAddCompanyModalOpen(false)}
                  className="px-4 py-2 text-slate-600 text-xs font-semibold hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingCompany}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {savingCompany ? 'Menyimpan...' : 'Simpan Perusahaan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PERUSAHAAN & GANTI LOGO (SECTION 13 & 14) */}
      {editingCompany && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-150 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit className="w-4 h-4 text-amber-600" />
                <span>Edit Perusahaan & Ganti Logo</span>
              </h3>
              <button
                onClick={() => setEditingCompany(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Perusahaan *
                </label>
                <input
                  type="text"
                  required
                  value={compFormName}
                  onChange={(e) => setCompFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              {/* Logo Replacement Box */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-semibold text-slate-700 block">
                  🔄 Ganti Logo Perusahaan
                </span>
                <div className="flex items-center gap-3">
                  <CompanyLogo src={compFormLogoPreview} name={compFormName} size="lg" />
                  <div className="space-y-1">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleLogoFileChange}
                      className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-800 hover:file:bg-blue-200 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-500">
                      Mengganti logo otomatis memperbarui logo pada seluruh lowongan perusahaan ini.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Industri
                  </label>
                  <input
                    type="text"
                    value={compFormIndustry}
                    onChange={(e) => setCompFormIndustry(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lokasi Kantor
                  </label>
                  <input
                    type="text"
                    value={compFormLocation}
                    onChange={(e) => setCompFormLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Website Perusahaan
                </label>
                <input
                  type="url"
                  value={compFormWebsite}
                  onChange={(e) => setCompFormWebsite(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi Perusahaan
                </label>
                <textarea
                  rows={2}
                  value={compFormDescription}
                  onChange={(e) => setCompFormDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setEditingCompany(null)}
                  className="px-4 py-2 text-slate-600 text-xs font-semibold hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingCompany}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {savingCompany ? 'Menyimpan...' : 'Perbarui Perusahaan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL PERUSAHAAN (SECTION 14) */}
      {viewingCompany && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-150 pb-3 shrink-0">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Detail Perusahaan</span>
              </h3>
              <button
                onClick={() => setViewingCompany(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Company Header */}
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <CompanyLogo src={viewingCompany.logo_url} name={viewingCompany.name} size="xl" />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-base text-slate-900">
                    {viewingCompany.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    {viewingCompany.industry && (
                      <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                        {viewingCompany.industry}
                      </span>
                    )}
                    {viewingCompany.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {viewingCompany.location}
                      </span>
                    )}
                    {viewingCompany.website && (
                      <a
                        href={viewingCompany.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        Website
                      </a>
                    )}
                  </div>
                  {viewingCompany.description && (
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {viewingCompany.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Jobs by this company */}
              <div className="space-y-3">
                <h5 className="font-bold text-sm text-slate-900 flex items-center justify-between">
                  <span>Daftar Lowongan Kerja ({jobs.filter(j => j.company_name.toLowerCase() === viewingCompany.name.toLowerCase()).length})</span>
                </h5>

                <div className="space-y-2">
                  {jobs
                    .filter(j => j.company_name.toLowerCase() === viewingCompany.name.toLowerCase())
                    .map((job) => (
                      <div
                        key={job.id}
                        className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div>
                          <h6 className="font-bold text-xs sm:text-sm text-slate-900">
                            {job.position}
                          </h6>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{job.location}</span>
                            <span>•</span>
                            <span className="text-emerald-600 font-semibold">
                              {job.salary_text || (job.salary_min ? `Rp ${job.salary_min.toLocaleString('id-ID')}` : 'Gaji tertera')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            job.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {job.status === 'published' ? 'Tayang' : 'Draft'}
                          </span>
                          <button
                            onClick={() => {
                              setViewingCompany(null);
                              onViewJob(job);
                            }}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-150 flex justify-end shrink-0">
              <button
                onClick={() => setViewingCompany(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MINTA CV */}
      {selectedAppForCV && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-150 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Template Pesan Permintaan CV</span>
              </h3>
              <button
                onClick={() => setSelectedAppForCV(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <p className="text-slate-600">
                Kirimkan pesan template berikut ke Telegram kandidat <strong>{selectedAppForCV.full_name}</strong> ({selectedAppForCV.telegram_username}):
              </p>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 whitespace-pre-line text-xs font-mono">
                {getCVTemplateMessage(selectedAppForCV)}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-150">
              <button
                onClick={() => handleCopyCVTemplate(selectedAppForCV)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {copiedCVText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCVText ? 'Pesan Tersalin!' : 'Salin Pesan'}</span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`https://t.me/${selectedAppForCV.telegram_username.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleUpdateAppStatus(selectedAppForCV.id, 'CV_REQUESTED')}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Buka Telegram & Tandai Minta CV</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH LOKER MANUAL */}
      {isAddJobModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-150 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>Tambah Lowongan Manual</span>
              </h3>
              <button
                onClick={() => setIsAddJobModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewJob} className="space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Perusahaan *
                  </label>
                  <input
                    type="text"
                    required
                    value={newJobForm.company_name || ''}
                    onChange={(e) => setNewJobForm({ ...newJobForm, company_name: e.target.value })}
                    placeholder="Contoh: PT Maju Jaya"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Posisi Pekerjaan *
                  </label>
                  <input
                    type="text"
                    required
                    value={newJobForm.position || ''}
                    onChange={(e) => setNewJobForm({ ...newJobForm, position: e.target.value })}
                    placeholder="Contoh: Staff Gudang"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lokasi Penempatan *
                  </label>
                  <input
                    type="text"
                    required
                    value={newJobForm.location || ''}
                    onChange={(e) => setNewJobForm({ ...newJobForm, location: e.target.value })}
                    placeholder="Contoh: Surabaya, Jawa Timur"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pendidikan Minimal
                  </label>
                  <input
                    type="text"
                    value={newJobForm.education || ''}
                    onChange={(e) => setNewJobForm({ ...newJobForm, education: e.target.value })}
                    placeholder="Contoh: Minimal SMA/SMK"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Format Gaji (Teks Bebas)
                  </label>
                  <input
                    type="text"
                    value={newJobForm.salary_text || ''}
                    onChange={(e) => setNewJobForm({ ...newJobForm, salary_text: e.target.value })}
                    placeholder="Contoh: Rp 3.500.000 - Rp 5.000.000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipe Pekerjaan
                  </label>
                  <select
                    value={newJobForm.employment_type || 'Full-time'}
                    onChange={(e) => setNewJobForm({ ...newJobForm, employment_type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl cursor-pointer"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Kontrak">Kontrak</option>
                    <option value="Magang">Magang</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi Singkat Pekerjaan
                </label>
                <textarea
                  rows={3}
                  value={newJobForm.description || ''}
                  onChange={(e) => setNewJobForm({ ...newJobForm, description: e.target.value })}
                  placeholder="Jelaskan gambaran pekerjaan..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setIsAddJobModalOpen(false)}
                  className="px-4 py-2 text-slate-600 text-xs font-semibold hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Simpan & Publikasikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
