import React from 'react';
import { ShieldCheck, Lock, EyeOff, UserCheck } from 'lucide-react';

export const PrivacyView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8 text-slate-800">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Kebijakan Privasi & Perlindungan Data
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Terakhir diperbarui: September 2026 • KerjaKilat Recruitment Platform
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed space-y-6">
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span>1. Komitmen Privasi Pelamar</span>
          </h2>
          <p className="text-slate-600">
            KerjaKilat sangat menghargai privasi dan kerahasiaan informasi pribadi setiap kandidat pelamar kerja. Seluruh data yang Anda masukkan melalui formulir lamaran (Nama Lengkap, Domisili, Usia, Posisi yang Dilamar, dan Username Telegram) hanya digunakan untuk keperluan seleksi kerja oleh perusahaan yang bersangkutan.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            <span>2. Keamanan & Larangan Permintaan Sandi Telegram</span>
          </h2>
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 font-medium">
            <p>
              <strong>PENTING:</strong> Sistem KerjaKilat maupun admin rekrutmen resmi <u>TIDAK AKAN PERNAH</u> meminta password akun Telegram, kode OTP, ataupun informasi autentikasi pribadi Anda.
            </p>
          </div>
          <p className="text-slate-600">
            Username Telegram Anda hanya digunakan sebagai media komunikasi teks dua arah untuk wawancara kerja, penjadwalan, atau pengiriman berkas CV.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-indigo-600" />
            <span>3. Pembatasan Akses Database (Row Level Security)</span>
          </h2>
          <p className="text-slate-600">
            Database lamaran kami dienkripsi menggunakan standar keamanan Supabase PostgreSQL Row Level Security (RLS). Pengguna publik di internet tidak dapat melihat atau mengakses data lamaran kandidat lain. Hanya akun admin dan sistem backend resmi yang memiliki izin akses membaca.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-500" />
            <span>4. Hak Penghapusan Data</span>
          </h2>
          <p className="text-slate-600">
            Kandidat berhak mengajukan permohonan pembatalan lamaran atau penghapusan data kontak sewaktu-waktu dengan menghubungi tim kami melalui saluran kontak resmi yang tersedia.
          </p>
        </section>
      </div>
    </div>
  );
};
