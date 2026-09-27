import React, { useState } from 'react';
import {
  X,
  Send,
  Building2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  User,
  MapPin,
  Calendar,
  Briefcase,
  Phone,
  ArrowRight
} from 'lucide-react';
import { Job } from '../types/job';
import { dataService } from '../services/dataService';

interface ApplicationModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccessSubmitted?: () => void;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  job,
  isOpen,
  onClose,
  onSuccessSubmitted,
}) => {
  const [fullName, setFullName] = useState('');
  const [domicile, setDomicile] = useState('');
  const [age, setAge] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [telegramNumber, setTelegramNumber] = useState('');
  const [consent, setConsent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !job) return null;

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (!fullName.trim()) {
      errs.fullName = 'Nama lengkap wajib diisi.';
    } else if (fullName.trim().length < 3) {
      errs.fullName = 'Nama minimal 3 karakter.';
    }

    if (!domicile.trim()) {
      errs.domicile = 'Domisili kota/kabupaten wajib diisi.';
    }

    const ageNum = parseInt(age, 10);
    if (!age || isNaN(ageNum)) {
      errs.age = 'Usia harus berupa angka.';
    } else if (ageNum < 17 || ageNum > 70) {
      errs.age = 'Usia harus masuk akal untuk pelamar kerja (17 - 70 tahun).';
    }

    if (!telegramUsername.trim()) {
      errs.telegramUsername = 'Username Telegram aktif wajib diisi.';
    } else if (telegramUsername.includes(' ') || telegramUsername.length < 3) {
      errs.telegramUsername = 'Format username Telegram tidak valid (contoh: @namauser).';
    }

    if (!consent) {
      errs.consent = 'Anda harus menyetujui pemrosesan data rekrutmen.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await dataService.submitApplication({
        job_id: job.id,
        full_name: fullName,
        domicile,
        age: parseInt(age, 10),
        applied_position: job.position,
        telegram_username: telegramUsername,
        telegram_number: telegramNumber,
        consent,
      });

      if (res.success) {
        setIsSuccess(true);
        if (onSuccessSubmitted) onSuccessSubmitted();
      }
    } catch (err: any) {
      setErrors({ form: err?.message || 'Terjadi kesalahan sistem saat mengirim lamaran.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setFullName('');
    setDomicile('');
    setAge('');
    setTelegramUsername('');
    setTelegramNumber('');
    setConsent(false);
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-150 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Formulir Lamaran Kerja
              </h2>
              <p className="text-xs text-slate-500 truncate max-w-[240px]">
                {job.position} • {job.company_name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            aria-label="Keluar dan pilih loker lain"
            title="Keluar dan pilih loker lain"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="hidden sm:inline text-xs font-semibold text-slate-500">Batal</span>
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          /* Success Screen */
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Lamaran Berhasil Dikirim!
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              Terima kasih <strong>{fullName}</strong>. Data lamaran Anda untuk posisi{' '}
              <strong>{job.position}</strong> di <strong>{job.company_name}</strong> telah
              diteruskan ke sistem rekrutmen.
            </p>

            <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 text-left text-xs text-blue-900 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-blue-950">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Tahapan Selanjutnya:</span>
              </div>
              <p>
                Jika Anda sesuai dengan kualifikasi, tim rekrutmen akan menghubungi Anda secara
                resmi melalui Telegram ke akun <strong>{telegramUsername}</strong>.
              </p>
              <p className="text-slate-500 italic">
                *Rekruter tidak akan pernah meminta password atau kode OTP akun Telegram Anda.
              </p>
            </div>

            <button
              onClick={handleResetAndClose}
              className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
            >
              Kembali ke Lowongan
            </button>
          </div>
        ) : (
          /* Application Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
            {errors.form && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.form}</span>
              </div>
            )}

            {/* Posisi (Disabled/Pre-filled) with Quick Exit/Change button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Posisi yang Dilamar *
                </label>
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-red-600 transition-colors cursor-pointer"
                  title="Keluar untuk memilih lowongan lain"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Pilih Loker Lain</span>
                </button>
              </div>
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-100 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium">
                <div className="flex items-center gap-2 truncate">
                  <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{job.position}</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-red-600 transition-colors shrink-0"
                  title="Ganti / Keluar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.fullName ? 'border-red-400 bg-red-50/30' : 'border-slate-200 bg-white'
                  } focus:outline-none focus:border-blue-500`}
                />
              </div>
              {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
            </div>

            {/* Domisili & Usia Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Domisili Kota/Kab *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={domicile}
                    onChange={(e) => setDomicile(e.target.value)}
                    placeholder="Contoh: Surabaya"
                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border ${
                      errors.domicile ? 'border-red-400 bg-red-50/30' : 'border-slate-200 bg-white'
                    } focus:outline-none focus:border-blue-500`}
                  />
                </div>
                {errors.domicile && <p className="text-xs text-red-500 mt-1">{errors.domicile}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Usia (Tahun) *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="number"
                    min="17"
                    max="70"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Contoh: 23"
                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border ${
                      errors.age ? 'border-red-400 bg-red-50/30' : 'border-slate-200 bg-white'
                    } focus:outline-none focus:border-blue-500`}
                  />
                </div>
                {errors.age && <p className="text-xs text-red-500 mt-1">{errors.age}</p>}
              </div>
            </div>

            {/* Telegram Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username Telegram *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">@</span>
                <input
                  type="text"
                  value={telegramUsername.replace(/^@/, '')}
                  onChange={(e) => setTelegramUsername(`@${e.target.value.replace(/^@/, '')}`)}
                  placeholder="username_telegram_anda"
                  className={`w-full pl-8 pr-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.telegramUsername ? 'border-red-400 bg-red-50/30' : 'border-slate-200 bg-white'
                  } focus:outline-none focus:border-blue-500`}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Pastikan pengaturan privasi Telegram Anda memperbolehkan rekruter menemukan username Anda.
              </p>
              {errors.telegramUsername && (
                <p className="text-xs text-red-500 mt-0.5">{errors.telegramUsername}</p>
              )}
            </div>

            {/* Nomor Telepon / WhatsApp (Opsional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Telepon / WhatsApp <span className="text-slate-400 font-normal">(Opsional)</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={telegramNumber}
                  onChange={(e) => setTelegramNumber(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Consent Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-slate-600 leading-snug">
                  Saya menyetujui bahwa data yang saya berikan digunakan untuk proses rekrutmen.
                </span>
              </label>
              {errors.consent && <p className="text-xs text-red-500 mt-1">{errors.consent}</p>}
            </div>

            {/* Action Buttons: Cancel/Pilih Loker Lain & Submit */}
            <div className="pt-3 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full sm:w-auto order-2 sm:order-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-500" />
                <span>Batal & Pilih Loker Lain</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 order-1 sm:order-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim Lamaran</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
