import React from 'react';
import { Search, MapPin, Sparkles, Building2, Users2, Send } from 'lucide-react';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
  onSearchSubmit: () => void;
  onSelectTag: (tag: string) => void;
  totalJobsCount: number;
}

const POPULAR_LOCATIONS = [
  'Semua Lokasi',
  'Jakarta Selatan',
  'Surabaya',
  'Bandung',
  'Semarang',
  'Yogyakarta',
  'Medan',
  'Remote',
];

const POPULAR_TAGS = [
  'Admin Gudang',
  'Barista',
  'Kasir Retail',
  'Customer Support',
  'Content Creator',
  'SMA/SMK',
];

export const Hero: React.FC<HeroProps> = ({
  searchQuery,
  onSearchChange,
  selectedLocation,
  onLocationChange,
  onSearchSubmit,
  onSelectTag,
  totalJobsCount,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit();
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-slate-50 to-white pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-200">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-blue-400/10 via-indigo-400/10 to-cyan-400/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs font-semibold mb-6 border border-blue-200/60 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Portal Peluang Karir Terpercaya di Indonesia</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-tight">
          Temukan Lowongan Kerja yang{' '}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
            Tepat untuk Anda
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          Cari dan temukan berbagai peluang kerja terbaru dengan mudah. Melamar langsung dan terhubung dengan tim rekruter via Telegram.
        </p>

        {/* Search Box */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 sm:mt-10 p-2 sm:p-2.5 bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200 max-w-3xl mx-auto flex flex-col md:flex-row items-stretch gap-2.5"
        >
          {/* Position / Keyword input */}
          <div className="flex-1 flex items-center px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 focus-within:border-blue-400 focus-within:bg-white transition-all">
            <Search className="w-5 h-5 text-slate-400 mr-2.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Contoh: Admin, Kasir, Staff Gudang..."
              className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Location Dropdown */}
          <div className="flex items-center px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 min-w-[180px] focus-within:border-blue-400 focus-within:bg-white transition-all">
            <MapPin className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
            <select
              value={selectedLocation}
              onChange={(e) => onLocationChange(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-700 focus:outline-none cursor-pointer"
            >
              {POPULAR_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm sm:text-base transition-colors shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-98"
          >
            <Search className="w-4 h-4" />
            <span>Cari Lowongan</span>
          </button>
        </form>

        {/* Popular Tags */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500">
          <span className="font-medium text-slate-600 mr-1">Populer:</span>
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onSelectTag(tag)}
              className="px-2.5 py-1 rounded-md bg-white hover:bg-blue-50 hover:text-blue-600 text-slate-600 border border-slate-200 transition-colors shadow-2xs"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Quick Highlights Stats */}
        <div className="mt-10 grid grid-cols-3 max-w-lg mx-auto pt-6 border-t border-slate-200/80 gap-4 text-center">
          <div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900">{totalJobsCount}+</div>
            <div className="text-xs text-slate-500 mt-0.5">Lowongan Aktif</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-600">100%</div>
            <div className="text-xs text-slate-500 mt-0.5">Faktual & Real</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-sky-600">&lt; 1 Menit</div>
            <div className="text-xs text-slate-500 mt-0.5">Kirim Lamaran</div>
          </div>
        </div>
      </div>
    </div>
  );
};
