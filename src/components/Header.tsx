import React, { useState } from 'react';
import { Briefcase, Menu, X, Search, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  activeView: 'home' | 'jobs' | 'about' | 'contact' | 'privacy';
  onNavigate: (view: 'home' | 'jobs' | 'about' | 'contact' | 'privacy') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view: 'home' | 'jobs' | 'about' | 'contact' | 'privacy') => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Kerja<span className="text-blue-600">Kilat</span>
                </span>
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                  Resmi
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Portal Lowongan Kerja Terpercaya
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => handleNav('home')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'home'
                  ? 'text-blue-600 bg-blue-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Beranda
            </button>
            <button
              onClick={() => handleNav('jobs')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'jobs'
                  ? 'text-blue-600 bg-blue-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Cari Lowongan
            </button>
            <button
              onClick={() => handleNav('about')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'about'
                  ? 'text-blue-600 bg-blue-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Tentang
            </button>
            <button
              onClick={() => handleNav('contact')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'contact'
                  ? 'text-blue-600 bg-blue-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Kontak
            </button>
          </nav>

          {/* Action CTA */}
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              onClick={() => handleNav('jobs')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 active:scale-98 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Telusuri Lowongan</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => handleNav('jobs')}
              className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg shadow-xs"
            >
              Cari Loker
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          <button
            onClick={() => handleNav('home')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium ${
              activeView === 'home' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700'
            }`}
          >
            Beranda
          </button>
          <button
            onClick={() => handleNav('jobs')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium ${
              activeView === 'jobs' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700'
            }`}
          >
            Cari Lowongan
          </button>
          <button
            onClick={() => handleNav('about')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium ${
              activeView === 'about' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700'
            }`}
          >
            Tentang KerjaKilat
          </button>
          <button
            onClick={() => handleNav('contact')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium ${
              activeView === 'contact' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700'
            }`}
          >
            Kontak Kami
          </button>
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => handleNav('jobs')}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white shadow-xs"
            >
              <Search className="w-4 h-4" />
              <span>Lihat Semua Lowongan</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
