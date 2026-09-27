import React from 'react';
import { MapPin, Building2, Banknote, GraduationCap, Clock, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Job } from '../types/job';
import { CompanyLogo } from './CompanyLogo';

interface JobCardProps {
  job: Job;
  onSelect: (job: Job) => void;
  onQuickApply: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onSelect, onQuickApply }) => {
  // Format date calculation
  const getPostingTimeText = (dateString?: string | null) => {
    if (!dateString) return 'Baru saja';
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Baru saja';
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 30) return `${diffDays} hari yang lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const isRecent = () => {
    if (!job.published_at) return true;
    const diffHours = (Date.now() - new Date(job.published_at).getTime()) / (1000 * 60 * 60);
    return diffHours < 72; // Within 3 days
  };

  // Avatar initial color generator
  const getAvatarBg = (name: string) => {
    const colors = [
      'bg-blue-600',
      'bg-indigo-600',
      'bg-emerald-600',
      'bg-violet-600',
      'bg-sky-600',
      'bg-amber-600',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-400/80 hover:shadow-lg hover:shadow-blue-500/5 transition-all p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden">
      {/* Top indicator bar for featured */}
      {job.featured && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
      )}

      <div>
        {/* Header: Company, Logo, Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <CompanyLogo
              src={job.company_logo}
              name={job.company_name}
              size="md"
            />
            <div>
              <h4 className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate max-w-[200px]">{job.company_name}</span>
                <span title="Terverifikasi">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                </span>
              </h4>
              <h3
                onClick={() => onSelect(job)}
                className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer mt-0.5 line-clamp-1"
              >
                {job.position}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isRecent() && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Sparkles className="w-2.5 h-2.5" />
                Baru
              </span>
            )}
            {job.featured && (
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                Unggulan
              </span>
            )}
          </div>
        </div>

        {/* Location & Meta info tags */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            {job.location}
          </span>

          {job.employment_type && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
              {job.employment_type}
            </span>
          )}

          {job.education && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
              <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
              {job.education}
            </span>
          )}
        </div>

        {/* Salary tag */}
        <div className="mt-3.5 py-2 px-3 rounded-xl bg-slate-50 border border-slate-150/70 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-900">
            <Banknote className="w-4 h-4 text-emerald-600" />
            <span>
              {job.salary_text
                ? job.salary_text
                : job.salary_min && job.salary_max
                ? `Rp ${job.salary_min.toLocaleString('id-ID')} - Rp ${job.salary_max.toLocaleString('id-ID')}`
                : 'Gaji tidak dicantumkan'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-normal">/ bulan</span>
        </div>

        {/* Requirements Snippet */}
        {job.requirements && job.requirements.length > 0 && (
          <ul className="mt-3 space-y-1 text-xs text-slate-600 line-clamp-2">
            {job.requirements.slice(0, 2).map((req, idx) => (
              <li key={idx} className="flex items-center gap-1.5 truncate">
                <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                <span className="truncate">{req}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer: Date & Buttons */}
      <div className="mt-5 pt-4 border-t border-slate-150 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{getPostingTimeText(job.published_at)}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelect(job)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors"
          >
            Lihat Detail
          </button>
          <button
            onClick={() => onQuickApply(job)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs flex items-center gap-1"
          >
            <span>Lamar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
