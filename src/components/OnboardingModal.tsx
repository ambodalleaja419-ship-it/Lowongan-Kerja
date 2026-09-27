import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Building2,
  MapPin,
  Banknote,
  GraduationCap,
  Calendar,
  Briefcase,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Send,
  User,
  Clock,
  Gift,
  FileText,
  Phone
} from 'lucide-react';
import { Job } from '../types/job';
import { CompanyLogo } from './CompanyLogo';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinishAndExploreJobs: () => void;
  jobs: Job[];
  onOpenActualJobDetail?: (job: Job) => void;
  onApplyActualJob?: (job: Job) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onFinishAndExploreJobs,
  jobs,
  onOpenActualJobDetail,
  onApplyActualJob,
}) => {
  // Step 0: Welcome / First Visit
  // Step 1: Cari Lowongan
  // Step 2: Periksa Detail Lowongan
  // Step 3: Isi Data Lamaran
  // Step 4: Setelah Melamar
  // Step 5: Cara Kerja & Keamanan Data
  const [currentStep, setCurrentStep] = useState(0);

  // Search input preview inside Step 1
  const [searchPreview, setSearchPreview] = useState('');

  // Interactive sample form fields for Step 3
  const [formName, setFormName] = useState('');
  const [formDomicile, setFormDomicile] = useState('');
  const [formAge, setFormAge] = useState('');
  const [formTelegram, setFormTelegram] = useState('');
  const [formConsent, setFormConsent] = useState(true);

  // Pick the first available real job from Supabase database
  const sampleJob: Job | undefined = jobs && jobs.length > 0 ? jobs[0] : undefined;

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setSearchPreview('');
      setFormName('');
      setFormDomicile('');
      setFormAge('');
      setFormTelegram('');
      setFormConsent(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalSteps = 6;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem('job_portal_onboarding_completed', 'true');
    } catch {
      // Ignore localStorage errors
    }
    onFinishAndExploreJobs();
  };

  const handleSkip = () => {
    try {
      localStorage.setItem('job_portal_onboarding_completed', 'true');
    } catch {
      // Ignore localStorage errors
    }
    onClose();
  };

  // Filter actual jobs in Step 1 based on real search
  const previewJobsList = (jobs || []).filter(j => {
    if (!searchPreview.trim()) return true;
    const q = searchPreview.toLowerCase();
    return (
      j.position.toLowerCase().includes(q) ||
      j.company_name.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header bar with progress indicator */}
        <div className="px-5 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
              Langkah {currentStep + 1} dari {totalSteps}
            </span>
            {/* Progress Dots */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentStep
                      ? 'w-6 bg-blue-600'
                      : idx < currentStep
                      ? 'w-2 bg-blue-400'
                      : 'w-2 bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleSkip}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-200/60 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Lewati</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">

          {/* 1. FIRST VISIT (STEP 0) */}
          {currentStep === 0 && (
            <div className="text-center py-6 sm:py-10 space-y-6 max-w-lg mx-auto">
              <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
                <Briefcase className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Selamat Datang 👋
                </h2>
                <p className="text-base sm:text-lg font-bold text-blue-600">
                  Temukan peluang kerja yang sesuai dengan kamu.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto pt-2">
                  Website ini membantu kamu menemukan informasi lowongan kerja, melihat detail posisi, dan mengirim lamaran dengan mudah.
                </p>
              </div>

              {/* Highlights cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-4">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-blue-600 font-bold block text-sm">1. Cari Lowongan</span>
                  <span className="text-xs text-slate-500 mt-1 block">Telusuri posisi & kota yang kamu inginkan.</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-indigo-600 font-bold block text-sm">2. Baca Syarat</span>
                  <span className="text-xs text-slate-500 mt-1 block">Pahami kualifikasi lengkap dari perusahaan.</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-emerald-600 font-bold block text-sm">3. Kirim Lamaran</span>
                  <span className="text-xs text-slate-500 mt-1 block">Kirim langsung formulir secara cepat & mudah.</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. STEP 1 — CARI LOWONGAN (STEP 1) */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                  <span>🔎 Cari Lowongan</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Gunakan pencarian untuk menemukan lowongan berdasarkan posisi, perusahaan, atau lokasi yang kamu inginkan.
                </p>
              </div>

              {/* Search bar */}
              <div className="p-3 bg-slate-100/80 rounded-2xl border border-slate-200">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Coba ketik kata kunci lowongan atau lokasi:
                </label>
                <div className="flex items-center px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchPreview}
                    onChange={(e) => setSearchPreview(e.target.value)}
                    placeholder="Contoh: Barista, Admin, Surabaya..."
                    className="w-full text-xs sm:text-sm bg-transparent focus:outline-none"
                  />
                  {searchPreview && (
                    <button
                      onClick={() => setSearchPreview('')}
                      className="text-xs text-slate-400 hover:text-slate-600 ml-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Actual Lowongan from Supabase */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold text-slate-700">Daftar Lowongan dari Database:</span>
                  <span>{previewJobsList.length} lowongan</span>
                </div>

                {previewJobsList.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                    <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs sm:text-sm font-semibold text-slate-700">
                      Belum ada lowongan tersedia saat ini.
                    </p>
                    <p className="text-xs text-slate-500">
                      Silakan periksa kembali nanti untuk melihat lowongan yang baru dipublikasikan.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {previewJobsList.slice(0, 3).map((job) => (
                      <div
                        key={job.id}
                        className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 transition-colors flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <CompanyLogo src={job.company_logo} name={job.company_name} size="sm" />
                          <div className="truncate">
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                              {job.position}
                            </h4>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 truncate">
                              <span>{job.company_name}</span>
                              <span>•</span>
                              <span>{job.location}</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-600 shrink-0 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                          {job.salary_text || (job.salary_min ? `Rp ${job.salary_min.toLocaleString('id-ID')}` : 'Gaji tertera')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. STEP 2 — LIHAT DETAIL LOWONGAN (STEP 2) */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                  <span>📋 Periksa Detail Lowongan</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Sebelum melamar, baca informasi lowongan dengan teliti agar kamu memahami posisi dan persyaratan yang dibutuhkan.
                </p>
              </div>

              {sampleJob ? (
                <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs sm:text-sm">
                  {/* Perusahaan & Posisi */}
                  <div className="flex items-start gap-3.5 border-b border-slate-100 pb-3">
                    <CompanyLogo
                      src={sampleJob.company_logo}
                      name={sampleJob.company_name}
                      size="lg"
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                        {sampleJob.company_name}
                      </span>
                      <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                        {sampleJob.position}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-1.5">
                        <span className="inline-flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {sampleJob.location}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-emerald-600">
                          {sampleJob.salary_text || (sampleJob.salary_min ? `Rp ${sampleJob.salary_min.toLocaleString('id-ID')}` : 'Gaji tidak dicantumkan')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Facts Grid (Pendidikan, Usia, Pengalaman) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Pendidikan</span>
                      <span className="font-medium text-slate-800">{sampleJob.education || 'Tidak dicantumkan'}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Usia</span>
                      <span className="font-medium text-slate-800">
                        {sampleJob.min_age && sampleJob.max_age
                          ? `${sampleJob.min_age} - ${sampleJob.max_age} thn`
                          : sampleJob.min_age
                          ? `Min. ${sampleJob.min_age} thn`
                          : 'Tidak dicantumkan'}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Pengalaman</span>
                      <span className="font-medium text-slate-800 truncate block">
                        {sampleJob.experience || 'Tidak dicantumkan'}
                      </span>
                    </div>
                  </div>

                  {/* Kualifikasi (Hanya tampil jika ada) */}
                  {sampleJob.requirements && sampleJob.requirements.length > 0 && (
                    <div>
                      <h5 className="font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Kualifikasi:</span>
                      </h5>
                      <ul className="space-y-1 text-slate-600 pl-1 text-xs">
                        {sampleJob.requirements.slice(0, 3).map((req, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Deskripsi (Hanya tampil jika ada) */}
                  {sampleJob.description && (
                    <div>
                      <h5 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-600" />
                        <span>Deskripsi:</span>
                      </h5>
                      <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                        {sampleJob.description}
                      </p>
                    </div>
                  )}

                  {/* Benefit (Hanya tampil jika ada) */}
                  {sampleJob.benefits && sampleJob.benefits.length > 0 && (
                    <div>
                      <h5 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <Gift className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Benefit:</span>
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {sampleJob.benefits.map((b, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[11px]">
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Deadline (Hanya tampil jika ada) */}
                  {sampleJob.deadline && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 p-2 rounded-xl">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Batas Lamaran: <strong>{new Date(sampleJob.deadline).toLocaleDateString('id-ID')}</strong></span>
                    </div>
                  )}

                  {/* Tombol Lamar Sekarang */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <span>🚀 Lamar Sekarang</span>
                    </button>
                    {onApplyActualJob && (
                      <button
                        type="button"
                        onClick={() => {
                          handleComplete();
                          onApplyActualJob(sampleJob);
                        }}
                        className="w-full text-center text-xs text-blue-600 hover:underline py-1 cursor-pointer"
                      >
                        Atau lamar langsung lowongan ini di portal →
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                  <p className="text-xs sm:text-sm font-semibold text-slate-700">
                    Belum ada lowongan tersedia saat ini.
                  </p>
                  <p className="text-xs text-slate-500">
                    Ketika lowongan telah tersedia, kamu dapat membaca informasi posisi dan persyaratan lengkap sebelum mengirim lamaran.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 4. STEP 3 — ISI DATA LAMARAN (STEP 3) */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                  <span>📝 Kirim Lamaran</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Jika lowongan sesuai dengan kualifikasi dan minat kamu, kamu dapat mengirim data lamaran melalui formulir.
                </p>
              </div>

              {/* Form Interaktif */}
              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3.5 text-xs sm:text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Domisili *
                    </label>
                    <input
                      type="text"
                      value={formDomicile}
                      onChange={(e) => setFormDomicile(e.target.value)}
                      placeholder="Contoh: Surabaya"
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Usia *
                    </label>
                    <input
                      type="number"
                      value={formAge}
                      onChange={(e) => setFormAge(e.target.value)}
                      placeholder="Contoh: 23"
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Posisi yang Dilamar *
                  </label>
                  <div className="px-3 py-2.5 bg-slate-100 rounded-xl border border-slate-200 text-slate-800 text-xs font-semibold">
                    {sampleJob ? sampleJob.position : 'Posisi Lowongan yang Dipilih'}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username Telegram *
                  </label>
                  <input
                    type="text"
                    value={formTelegram}
                    onChange={(e) => setFormTelegram(e.target.value)}
                    placeholder="@username_kamu"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formConsent}
                    onChange={(e) => setFormConsent(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-[11px] text-slate-600 leading-tight">
                    Saya menyetujui bahwa data yang saya berikan digunakan untuk proses rekrutmen.
                  </span>
                </label>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Kirim Lamaran</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. STEP 4 — SETELAH MELAMAR (STEP 4) */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                  <span>📨 Lamaran Terkirim</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Ketahui apa yang terjadi setelah kamu mengirimkan lamaran pekerjaan.
                </p>
              </div>

              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3 text-xs sm:text-sm text-emerald-950">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                    ✓
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm">Data Kamu Diterima Pengelola Lowongan</h4>
                    <p className="text-emerald-900 leading-relaxed text-xs">
                      Setelah mengirim lamaran, data kamu akan diterima oleh pihak pengelola lowongan untuk ditinjau berdasarkan kesesuaian kualifikasi.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200/80">
                  <p className="text-emerald-900 text-xs leading-relaxed">
                    Jika pihak rekrutmen membutuhkan informasi tambahan atau ingin melanjutkan proses, kamu dapat dihubungi melalui <strong>Telegram</strong> yang kamu cantumkan.
                  </p>
                </div>
              </div>

              {/* Tips Telegram */}
              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 space-y-1.5 text-xs text-sky-950">
                <h5 className="font-bold flex items-center gap-1.5 text-sky-900">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Tips Kontak Telegram:</span>
                </h5>
                <p className="leading-relaxed">
                  • Pastikan username Telegram yang kamu masukkan <strong>aktif dan dapat dihubungi</strong>.
                </p>
                <p className="leading-relaxed">
                  • Atur privasi Telegram kamu agar dapat menerima pesan dari nomor baru untuk keperluan komunikasi seleksi kerja.
                </p>
                <p className="leading-relaxed text-slate-500 italic text-[11px] pt-1">
                  *Catatan: KerjaKilat tidak menjamin bahwa semua pelamar pasti dipanggil atau diterima kerja. Keputusan seleksi sepenuhnya merupakan kewenangan pihak perusahaan.
                </p>
              </div>
            </div>
          )}

          {/* 6. STEP 5 — CARA KERJA & KEAMANAN DATA (STEP 5) */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Bagaimana Cara Kerjanya?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Ringkasan langkah mudah mencari pekerjaan di KerjaKilat.
                </p>
              </div>

              {/* Steps List */}
              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-start gap-3 shadow-2xs">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                    01
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900">🔎 Cari Lowongan</h5>
                    <p className="text-slate-600 text-xs">Temukan pekerjaan berdasarkan posisi atau lokasi yang kamu tuju.</p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-start gap-3 shadow-2xs">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                    02
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900">📋 Baca Detail</h5>
                    <p className="text-slate-600 text-xs">Periksa persyaratan dan informasi pekerjaan dengan teliti.</p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-start gap-3 shadow-2xs">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                    03
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900">📝 Isi Data</h5>
                    <p className="text-slate-600 text-xs">Lengkapi data diri dan kontak Telegram pada formulir.</p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-start gap-3 shadow-2xs">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                    04
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900">📨 Kirim Lamaran</h5>
                    <p className="text-slate-600 text-xs">Kirim data lamaran melalui website secara aman.</p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-start gap-3 shadow-2xs">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                    05
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900">📱 Tunggu Informasi</h5>
                    <p className="text-slate-600 text-xs">Jika diperlukan, pihak rekrutmen dapat menghubungi kamu melalui Telegram.</p>
                  </div>
                </div>
              </div>

              {/* Keamanan Data Section */}
              <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-2 text-xs text-amber-950">
                <h4 className="font-bold text-amber-900 flex items-center gap-1.5 text-sm">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>🔐 Jaga Keamanan Data Kamu</span>
                </h4>
                <div className="space-y-1 text-xs">
                  <p>
                    • <strong>Jangan pernah memberikan password, PIN, OTP, atau kode keamanan</strong> akun kamu kepada pihak lain.
                  </p>
                  <p>
                    • <strong>⚠️ Waspadai Permintaan Biaya:</strong> Jangan memberikan uang kepada pihak yang mengaku dapat menjamin penerimaan kerja.
                  </p>
                  <p>
                    • <strong>📋 Periksa Informasi:</strong> Pastikan membaca detail lowongan sebelum mengirim lamaran.
                  </p>
                </div>
              </div>

              {/* Ready Box */}
              <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-center space-y-2">
                <h4 className="font-extrabold text-base sm:text-lg">Siap mencari pekerjaan?</h4>
                <p className="text-xs text-blue-100">
                  Temukan lowongan yang sesuai dengan posisi dan lokasi yang kamu inginkan.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Nav / CTA Bar */}
        <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <div>
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep < totalSteps - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer active:scale-98"
              >
                <span>{currentStep === 0 ? '🚀 Mulai' : 'Berikutnya →'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer active:scale-98"
              >
                <Search className="w-4 h-4" />
                <span>🔎 Cari Lowongan Sekarang</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
