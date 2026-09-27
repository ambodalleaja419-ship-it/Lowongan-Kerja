import React from 'react';
import { Sparkles, ShieldCheck, Zap, Users, CheckCircle2, ArrowRight } from 'lucide-react';

interface AboutViewProps {
  onExploreJobs: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onExploreJobs }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Tentang Platform KerjaKilat</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Menghubungkan Pencari Kerja & Perusahaan Secara Cepat dan Aman
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          KerjaKilat adalah platform portal lowongan kerja terpercaya di Indonesia. Kami mempermudah kandidat menemukan pekerjaan impian serta membantu perusahaan menemukan talenta yang tepat dengan alur rekrutmen yang efisien, transparan, dan profesional.
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Lowongan Terverifikasi</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Setiap lowongan kerja diperiksa keakuratan data dan kredibilitas perusahaannya untuk mencegah penipuan serta menjamin kenyamanan pelamar.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Proses Cepat & Ringkas</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Kandidat dapat melamar pekerjaan dalam hitungan detik tanpa harus mengisi formulir panjang yang membingungkan.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Keamanan Data Terjamin</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Privasi kandidat terjaga sepenuhnya. Kami tidak pernah membagikan data Anda kepada pihak ketiga di luar proses rekrutmen resmi.
          </p>
        </div>
      </div>

      {/* CTA Box */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 text-white text-center space-y-5 shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-bold">
          Siap Memulai Langkah Karir Berikutnya?
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Temukan ratusan lowongan kerja aktif dari berbagai industri di seluruh kota di Indonesia.
        </p>
        <div className="flex items-center justify-center">
          <button
            onClick={onExploreJobs}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors shadow-md flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <span>Telusuri Lowongan Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
