import React, { useState } from 'react';
import {
  X,
  Building2,
  MapPin,
  Banknote,
  GraduationCap,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  Share2,
  Sparkles,
  Send,
  Briefcase,
  Check
} from 'lucide-react';
import { Job } from '../types/job';
import { CompanyLogo } from './CompanyLogo';

interface JobDetailModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (job: Job) => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  isOpen,
  onClose,
  onApply,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !job) return null;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/#job-${job.slug}`;
    try {
      navigator.clipboard?.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const getSalaryDisplay = () => {
    if (job.salary_text) return job.salary_text;
    if (job.salary_min && job.salary_max) {
      return `Rp ${job.salary_min.toLocaleString('id-ID')} - Rp ${job.salary_max.toLocaleString('id-ID')}`;
    }
    if (job.salary_min) {
      return `Mulai Rp ${job.salary_min.toLocaleString('id-ID')}`;
    }
    return 'Tidak dicantumkan';
  };

  const getAgeDisplay = () => {
    if (job.min_age && job.max_age) return `${job.min_age} - ${job.max_age} tahun`;
    if (job.min_age) return `Minimal ${job.min_age} tahun`;
    if (job.max_age) return `Maksimal ${job.max_age} tahun`;
    return 'Tidak dicantumkan';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="relative px-6 pt-6 pb-5 border-b border-slate-150 bg-gradient-to-r from-slate-50 via-blue-50/30 to-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <CompanyLogo
              src={job.company_logo}
              name={job.company_name}
              size="xl"
            />
            <div className="pr-10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {job.company_name}
                </span>
                <span title="Terverifikasi">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                </span>
                {job.featured && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Unggulan
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                {job.position}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600">
                <span className="inline-flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {job.location}
                </span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                  <Banknote className="w-4 h-4" />
                  {getSalaryDisplay()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="px-6 py-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-sm sm:text-base">
          {/* Key Facts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-medium">Tipe Pekerjaan</span>
              <span className="text-sm font-semibold text-slate-800 mt-0.5 block">
                {job.employment_type || 'Tidak dicantumkan'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-medium">Pendidikan</span>
              <span className="text-sm font-semibold text-slate-800 mt-0.5 block">
                {job.education || 'Tidak dicantumkan'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-medium">Kriteria Usia</span>
              <span className="text-sm font-semibold text-slate-800 mt-0.5 block">
                {getAgeDisplay()}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-medium">Gender</span>
              <span className="text-sm font-semibold text-slate-800 mt-0.5 block">
                {job.gender || 'Pria / Wanita'}
              </span>
            </div>
          </div>

          {/* Pengalaman */}
          {job.experience && (
            <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center gap-2.5 text-xs sm:text-sm text-blue-900">
              <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Pengalaman Kerja:</strong> {job.experience}
              </span>
            </div>
          )}

          {/* Kualifikasi */}
          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Kualifikasi & Persyaratan</span>
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 pl-1">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tanggung Jawab */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2.5 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span>Tanggung Jawab Pekerjaan</span>
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 pl-1">
                {job.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 shrink-0" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Deskripsi Pekerjaan */}
          {job.description && (
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2">
                Deskripsi Pekerjaan
              </h3>
              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                {job.description}
              </div>
            </div>
          )}

          {/* Benefit & Fasilitas */}
          {job.benefits && job.benefits.length > 0 && (
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2.5 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Benefit & Fasilitas</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.benefits.map((benefit, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-medium border border-emerald-200"
                  >
                    ✓ {benefit}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Keahlian yang Dibutuhkan
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Deadline & Meta info */}
          <div className="pt-4 border-t border-slate-150 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>
                Batas Lamaran: <strong>{job.deadline ? new Date(job.deadline).toLocaleDateString('id-ID', { dateStyle: 'long' }) : 'Tidak ditentukan'}</strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>
                Dipublikasikan: {job.published_at ? new Date(job.published_at).toLocaleDateString('id-ID') : 'Hari ini'}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Sticky Bottom CTA Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={handleCopyLink}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title="Bagikan Tautan Lowongan"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Tersalin!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Bagikan</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={() => {
                onClose();
                onApply(job);
              }}
              className="px-6 py-2.5 rounded-xl text-sm sm:text-base font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <span>🚀 Lamar Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
