import React from 'react';
import { Briefcase, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'home' | 'jobs' | 'about' | 'contact' | 'privacy') => void;
  onOpenOnboarding?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenOnboarding }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs sm:text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3 text-white">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Kerja<span className="text-blue-500">Kilat</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Portal lowongan kerja modern dan terpercaya di Indonesia. Membantu para pencari kerja menemukan karir impian dengan proses seleksi yang cepat, transparan, dan terverifikasi.
            </p>
            <div className="flex items-center gap-2 pt-1 text-slate-400 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Lowongan Resmi & Terverifikasi Bebas Penipuan</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Pencari Kerja
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors"
                >
                  Beranda
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('jobs')}
                  className="hover:text-white transition-colors"
                >
                  Semua Lowongan Kerja
                </button>
              </li>
              {onOpenOnboarding && (
                <li>
                  <button
                    onClick={onOpenOnboarding}
                    className="hover:text-white transition-colors text-blue-400 font-medium"
                  >
                    Panduan Pelamar
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-white transition-colors"
                >
                  Pasang Lowongan Perusahaan
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Informasi & Bantuan
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors"
                >
                  Tentang KerjaKilat
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-white transition-colors"
                >
                  Hubungi Rekruter & Bantuan
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-white transition-colors"
                >
                  Kebijakan Privasi
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} KerjaKilat. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex items-center gap-1">
            <span>Platform portal lowongan kerja terpercaya untuk talenta Indonesia</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
