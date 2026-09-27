import React, { useState, useRef } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  CheckCircle,
  RefreshCw,
  XCircle,
  Edit3,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  FileText,
  CornerDownLeft,
  Image as ImageIcon,
  Upload,
  X,
  Building2,
  Check
} from 'lucide-react';
import { AIParseResult, Company, Job, TelegramBotMessage } from '../types/job';
import { requestParseJobWithAI } from '../services/aiJobParser';
import { dataService, MAX_LOGO_SIZE_BYTES, ALLOWED_IMAGE_TYPES } from '../services/dataService';
import { CompanyLogo } from './CompanyLogo';

interface TelegramBotSimulatorProps {
  onJobPublished?: (job: Job) => void;
  onViewJobDetail?: (job: Job) => void;
}

const SAMPLE_RAW_TEXTS = [
  {
    title: 'Loker + Logo (Surabaya)',
    text: 'PT Maju Jaya Logistics sedang membuka lowongan untuk posisi Admin Gudang di Surabaya. Pria atau wanita, usia 18 sampai 30 tahun, minimal SMA/SMK. Bisa komputer. Pengalaman tidak wajib. Gaji 3,5 sampai 5 juta. Penempatan Surabaya.',
  },
  {
    title: 'Loker Barista Kafe (Bandung)',
    text: 'Kopi Kenangan Nusantara mencari Barista Full Time di Bandung. Pria/Wanita maks 25 tahun, pendidikan min SMA. Ramah, disiplin, pengalaman barista min 6 bulan. Gaji 3,8 - 4,5 juta plus tips harian. Siap kerja shift.',
  },
  {
    title: 'Multi-Loker 1 Perusahaan',
    text: 'PT Cahaya Ritel Indonesia membuka 2 posisi di Medan: 1. Staff Kasir Toko (SMA/SMK, usia 18-25) gaji 3,4 jt. 2. Supervisor Toko (D3/S1, min 1 th pengalaman) gaji 5 jt.',
  },
  {
    title: 'Teks Tidak Lengkap (Uji Validasi)',
    text: 'Dibutuhkan segera karyawan untuk bantu-bantu di toko. Syarat jujur dan rajin, gaji nego.',
  },
];

export const TelegramBotSimulator: React.FC<TelegramBotSimulatorProps> = ({
  onJobPublished,
  onViewJobDetail,
}) => {
  const [messages, setMessages] = useState<TelegramBotMessage[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text:
        'Halo Admin! 👋\n\nSelamat datang di <b>KerjaKilat AI Recruitment Bot</b>.\n\nKirimkan teks lowongan kerja mentah beserta logo perusahaan (foto/dokumen) ke sini. AI akan otomatis mengaitkan logo dengan lowongan, mengekstrak data faktual, dan mempublikasikannya langsung ke website.',
      timestamp: '08:00',
    },
  ]);

  const [inputRawText, setInputRawText] = useState('');
  const [attachedImageFile, setAttachedImageFile] = useState<File | null>(null);
  const [attachedImagePreview, setAttachedImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeDraft, setActiveDraft] = useState<AIParseResult | null>(null);
  const [activeDraftLogo, setActiveDraftLogo] = useState<string | null>(null);
  const [activeDraftLogoFile, setActiveDraftLogoFile] = useState<File | null>(null);
  const [existingCompanyCheck, setExistingCompanyCheck] = useState<{
    company: Company;
    pendingLogo: string;
    pendingFile: File | null;
  } | null>(null);

  const [isEditingField, setIsEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const appendMessage = (msg: Omit<TelegramBotMessage, 'id' | 'timestamp'>) => {
    const newMsg: TelegramBotMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > MAX_LOGO_SIZE_BYTES) {
      appendMessage({
        sender: 'bot',
        text: '⚠️ <b>Ukuran logo terlalu besar.</b> Maksimal ukuran file adalah 5 MB.',
      });
      return;
    }

    // Validate type (PNG, JPG, JPEG, WEBP)
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      appendMessage({
        sender: 'bot',
        text: '⚠️ <b>Format file tidak didukung.</b> Gunakan gambar format PNG, JPG, JPEG, atau WEBP.',
      });
      return;
    }

    setAttachedImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAttachedImagePreview(previewUrl);

    // Reset input
    e.target.value = '';
  };

  const handleSend = async (customText?: string) => {
    const text = (customText !== undefined ? customText : inputRawText).trim();
    const imageFile = attachedImageFile;
    const imagePreview = attachedImagePreview;

    if ((!text && !imageFile) || isProcessing) return;

    // Append user message with attached logo thumbnail if present
    appendMessage({
      sender: 'user',
      text: text || '(Mengirim logo perusahaan)',
      imageUrl: imagePreview || undefined,
      imageFile: imageFile || undefined,
    });

    // Clear inputs
    setInputRawText('');
    setAttachedImageFile(null);
    setAttachedImagePreview(null);
    setIsProcessing(true);

    try {
      // 1. If only image sent and active draft exists, treat as "Ganti / Pasang Logo"
      if (!text && imageFile && activeDraft) {
        setActiveDraftLogo(imagePreview);
        setActiveDraftLogoFile(imageFile);
        appendMessage({
          sender: 'bot',
          text: `🖼️ <b>Logo perusahaan diterima!</b> Logo telah dikaitkan dengan lowongan <b>${activeDraft.company || 'Perusahaan'}</b>.`,
          imageUrl: imagePreview || undefined,
          actions: [
            { label: '✅ PUBLIKASIKAN', action: 'publish', variant: 'primary' },
            { label: '✏️ EDIT', action: 'edit', variant: 'secondary' },
            { label: '🔄 GANTI LOGO', action: 'change_logo', variant: 'warning' },
            { label: '❌ BATAL', action: 'cancel', variant: 'danger' },
          ],
        });
        setIsProcessing(false);
        return;
      }

      // 2. Parse text with Gemini AI
      const parsed = await requestParseJobWithAI(text);
      let logoUrlToUse = imagePreview;
      let logoFileToUse = imageFile;

      // 3. Check if company already exists in database
      if (parsed.company) {
        const existingComp = await dataService.getCompanyByName(parsed.company);

        if (existingComp) {
          if (existingComp.logo_url && imagePreview) {
            // Case: Company already has a logo, AND admin sent a new one -> Ask confirmation
            setExistingCompanyCheck({
              company: existingComp,
              pendingLogo: imagePreview,
              pendingFile: imageFile,
            });
            setActiveDraft(parsed);
            setActiveDraftLogo(existingComp.logo_url);
            setActiveDraftLogoFile(null);

            appendMessage({
              sender: 'bot',
              text: `🏢 <b>Logo perusahaan untuk "${existingComp.name}" sudah tersedia di database.</b>\n\nGunakan logo lama yang sudah tersimpan atau ganti dengan logo baru yang baru saja dikirim?`,
              actions: [
                { label: '✅ Gunakan Logo Lama', action: 'use_existing_logo', variant: 'primary' },
                { label: '🔄 Ganti Logo Baru', action: 'use_new_logo', variant: 'warning' },
                { label: '❌ Batal', action: 'cancel', variant: 'danger' },
              ],
            });
            setIsProcessing(false);
            return;
          } else if (existingComp.logo_url && !imagePreview) {
            // Case: Admin didn't send logo, but company already has a logo -> Auto reuse!
            logoUrlToUse = existingComp.logo_url;
            logoFileToUse = null;
          }
        }
      }

      setActiveDraft(parsed);
      setActiveDraftLogo(logoUrlToUse);
      setActiveDraftLogoFile(logoFileToUse);

      if (!parsed.is_valid) {
        appendMessage({
          sender: 'bot',
          text: `⚠️ <b>Data belum lengkap</b>\n\nInformasi yang belum ditemukan:\n${parsed.missing_fields
            .map((f) => `• ${f}`)
            .join('\n')}\n\nSilakan kirimkan teks dengan informasi lebih spesifik.`,
          actions: [{ label: '🔄 Coba Contoh Lain', action: 'reset' }],
        });
      } else {
        appendMessage({
          sender: 'bot',
          text: parsed.telegram_preview || 'Preview lowongan siap.',
          imageUrl: logoUrlToUse || undefined,
          parsedJob: parsed,
          actions: [
            { label: '✅ PUBLIKASIKAN', action: 'publish', variant: 'primary' },
            { label: '✏️ EDIT', action: 'edit', variant: 'secondary' },
            { label: '🔄 GANTI LOGO', action: 'change_logo', variant: 'warning' },
            { label: '❌ BATAL', action: 'cancel', variant: 'danger' },
          ],
        });
      }
    } catch (err: any) {
      appendMessage({
        sender: 'bot',
        text: `⚠️ Terjadi kendala saat memproses: ${err.message || 'Coba lagi beberapa saat.'}`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActionClick = async (action: string) => {
    if (action === 'publish') {
      if (!activeDraft) return;

      setIsProcessing(true);
      try {
        let finalLogoUrl = activeDraftLogo;

        // Step 1: Create or find company record
        const companyName = activeDraft.company || 'Perusahaan Mitra';
        let company = await dataService.getCompanyByName(companyName);

        if (!company) {
          company = await dataService.createCompany({
            name: companyName,
            logo_url: finalLogoUrl,
          });
        }

        // Step 2: Upload logo file to Supabase Storage if local file provided
        if (activeDraftLogoFile && company) {
          try {
            const uploaded = await dataService.uploadCompanyLogo(
              company.id,
              activeDraftLogoFile,
              activeDraftLogoFile.name
            );
            finalLogoUrl = uploaded.url;
            await dataService.updateCompany(company.id, {
              logo_url: uploaded.url,
              logo_path: uploaded.path,
            });
          } catch (uploadErr: any) {
            console.warn('Storage upload error, using local dataUrl:', uploadErr);
          }
        }

        // Step 3: Create the Job linked to company
        const newJob = await dataService.createJob({
          company_id: company?.id,
          company_name: companyName,
          company_logo: finalLogoUrl || company?.logo_url || null,
          position: activeDraft.position || 'Lowongan Kerja',
          location: activeDraft.location || 'Indonesia',
          salary_min: activeDraft.salary_min,
          salary_max: activeDraft.salary_max,
          salary_text: activeDraft.salary_text,
          employment_type: activeDraft.employment_type || 'Full-time',
          education: activeDraft.education,
          min_age: activeDraft.min_age,
          max_age: activeDraft.max_age,
          gender: activeDraft.gender,
          experience: activeDraft.experience,
          skills: activeDraft.skills,
          requirements: activeDraft.requirements,
          responsibilities: activeDraft.responsibilities,
          benefits: activeDraft.benefits,
          description: activeDraft.description,
          deadline: activeDraft.deadline,
          status: 'published',
          featured: false,
        });

        appendMessage({
          sender: 'bot',
          imageUrl: finalLogoUrl || undefined,
          text: `✅ <b>Lowongan berhasil dipublikasikan!</b>\n\n🏢 <b>${newJob.company_name}</b>\n💼 <b>${newJob.position}</b>\n📍 <b>${newJob.location}</b>\n\n🌐 <i>Lowongan dan logo perusahaan sudah otomatis tersimpan di Supabase dan tampil di website secara real-time.</i>`,
          actions: [
            { label: '👁 Lihat di Website', action: `view_${newJob.slug}`, variant: 'primary' },
            { label: '📢 Tambah Loker Lain', action: 'new_job', variant: 'secondary' },
          ],
        });

        if (onJobPublished) onJobPublished(newJob);
        setActiveDraft(null);
        setActiveDraftLogo(null);
        setActiveDraftLogoFile(null);
        setExistingCompanyCheck(null);
      } catch (err: any) {
        appendMessage({
          sender: 'bot',
          text: `❌ Gagal mempublikasikan ke database: ${err.message}`,
        });
      } finally {
        setIsProcessing(false);
      }
    } else if (action === 'use_existing_logo') {
      if (existingCompanyCheck) {
        setActiveDraftLogo(existingCompanyCheck.company.logo_url);
        setActiveDraftLogoFile(null);
        appendMessage({
          sender: 'bot',
          text: `✅ Menggunakan logo lama yang sudah tersimpan untuk <b>${existingCompanyCheck.company.name}</b>.`,
          imageUrl: existingCompanyCheck.company.logo_url || undefined,
          actions: [
            { label: '✅ PUBLIKASIKAN', action: 'publish', variant: 'primary' },
            { label: '✏️ EDIT', action: 'edit', variant: 'secondary' },
            { label: '❌ BATAL', action: 'cancel', variant: 'danger' },
          ],
        });
        setExistingCompanyCheck(null);
      }
    } else if (action === 'use_new_logo') {
      if (existingCompanyCheck) {
        setActiveDraftLogo(existingCompanyCheck.pendingLogo);
        setActiveDraftLogoFile(existingCompanyCheck.pendingFile);
        appendMessage({
          sender: 'bot',
          text: `🔄 Logo baru dipilih untuk menggantikan logo lama <b>${existingCompanyCheck.company.name}</b> saat dipublikasikan.`,
          imageUrl: existingCompanyCheck.pendingLogo,
          actions: [
            { label: '✅ PUBLIKASIKAN', action: 'publish', variant: 'primary' },
            { label: '✏️ EDIT', action: 'edit', variant: 'secondary' },
            { label: '❌ BATAL', action: 'cancel', variant: 'danger' },
          ],
        });
        setExistingCompanyCheck(null);
      }
    } else if (action === 'change_logo') {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
      appendMessage({
        sender: 'bot',
        text: '📷 Silakan pilih gambar logo baru dari perangkat Anda (PNG, JPG, JPEG, WEBP, maks 5 MB).',
      });
    } else if (action === 'edit') {
      appendMessage({
        sender: 'bot',
        text: 'Pilih bidang yang ingin diedit:',
        actions: [
          { label: '🏢 Perusahaan', action: 'edit_company' },
          { label: '💼 Posisi', action: 'edit_position' },
          { label: '📍 Lokasi', action: 'edit_location' },
          { label: '💰 Gaji', action: 'edit_salary' },
          { label: '🎓 Pendidikan', action: 'edit_education' },
          { label: '🔄 Ganti Logo', action: 'change_logo', variant: 'warning' },
        ],
      });
    } else if (action.startsWith('edit_')) {
      const field = action.replace('edit_', '');
      setIsEditingField(field);
      if (activeDraft) {
        if (field === 'company') setEditValue(activeDraft.company || '');
        if (field === 'position') setEditValue(activeDraft.position || '');
        if (field === 'location') setEditValue(activeDraft.location || '');
        if (field === 'salary') setEditValue(activeDraft.salary_text || '');
        if (field === 'education') setEditValue(activeDraft.education || '');
      }
    } else if (action === 'cancel') {
      setActiveDraft(null);
      setActiveDraftLogo(null);
      setActiveDraftLogoFile(null);
      setExistingCompanyCheck(null);
      appendMessage({
        sender: 'bot',
        text: '❌ Pembuatan lowongan dibatalkan. Silakan kirimkan teks loker dan logo baru kapan saja.',
      });
    } else if (action.startsWith('view_')) {
      const slug = action.replace('view_', '');
      dataService.getJobBySlug(slug).then((job) => {
        if (job && onViewJobDetail) onViewJobDetail(job);
      });
    } else if (action === 'new_job' || action === 'reset') {
      setActiveDraft(null);
      setActiveDraftLogo(null);
      setActiveDraftLogoFile(null);
      setExistingCompanyCheck(null);
      setIsEditingField(null);
    }
  };

  const handleSaveFieldEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingField || !activeDraft) return;

    const updated = { ...activeDraft };
    if (isEditingField === 'company') updated.company = editValue;
    if (isEditingField === 'position') updated.position = editValue;
    if (isEditingField === 'location') updated.location = editValue;
    if (isEditingField === 'salary') updated.salary_text = editValue;
    if (isEditingField === 'education') updated.education = editValue;

    import('../services/aiJobParser').then(({ formatTelegramPreview }) => {
      updated.telegram_preview = formatTelegramPreview(updated);
      setActiveDraft(updated);
      setIsEditingField(null);

      appendMessage({
        sender: 'user',
        text: `Update ${isEditingField}: ${editValue}`,
      });

      appendMessage({
        sender: 'bot',
        imageUrl: activeDraftLogo || undefined,
        text: `Perubahan berhasil disimpan.\n\n${updated.telegram_preview}`,
        actions: [
          { label: '✅ PUBLIKASIKAN', action: 'publish', variant: 'primary' },
          { label: '✏️ EDIT BIDANG LAIN', action: 'edit', variant: 'secondary' },
          { label: '🔄 GANTI LOGO', action: 'change_logo', variant: 'warning' },
          { label: '❌ BATAL', action: 'cancel', variant: 'danger' },
        ],
      });
    });
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl flex flex-col h-[650px] overflow-hidden">
      {/* Bot Chat Header */}
      <div className="px-5 py-4 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                KerjaKilat Admin Bot
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Online
              </span>
            </div>
            <p className="text-xs text-slate-400">@KerjaKilatRecruitmentBot • Telegram Bot API</p>
          </div>
        </div>

        <div className="text-xs text-slate-400 hidden sm:flex items-center gap-2">
          <span>Storage: <strong className="text-emerald-400">company-logos</strong></span>
          <span>•</span>
          <span>AI: <strong className="text-sky-400">Gemini 3.8 Flash</strong></span>
        </div>
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-4 py-2.5 bg-slate-800/40 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-400 shrink-0 font-medium flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Uji Cepat:
        </span>
        {SAMPLE_RAW_TEXTS.map((sample, i) => (
          <button
            key={i}
            onClick={() => handleSend(sample.text)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap transition-colors cursor-pointer"
          >
            {sample.title}
          </button>
        ))}
      </div>

      {/* Message Chat Body */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 font-sans text-sm">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-sky-500 text-white shadow-xs'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-md ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-800/90 text-slate-100 border border-slate-700 rounded-tl-none'
              }`}
            >
              {/* Attached Image / Logo Display */}
              {msg.imageUrl && (
                <div className="mb-3 p-2 bg-white rounded-xl border border-slate-200/50 shadow-xs max-w-[200px]">
                  <img
                    src={msg.imageUrl}
                    alt="Logo Perusahaan"
                    className="w-full h-24 object-contain rounded-lg"
                  />
                  <div className="text-[10px] text-slate-500 text-center font-medium mt-1">
                    Logo Perusahaan
                  </div>
                </div>
              )}

              <div
                className="whitespace-pre-line leading-relaxed text-xs sm:text-sm"
                dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }}
              />

              {/* Inline Action Buttons */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-700/80 flex flex-wrap gap-2">
                  {msg.actions.map((act, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleActionClick(act.action)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                        act.variant === 'primary'
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : act.variant === 'danger'
                          ? 'bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-700/50'
                          : act.variant === 'warning'
                          ? 'bg-amber-600 hover:bg-amber-500 text-white'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                      }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              )}

              <div
                className={`text-[10px] mt-1.5 text-right ${
                  msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-2 text-slate-400 text-xs italic bg-slate-800/50 p-3 rounded-2xl w-fit">
            <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            <span>AI sedang membaca teks dan mengaitkan logo perusahaan...</span>
          </div>
        )}
      </div>

      {/* Field Editor Dialog Overlay if in edit mode */}
      {isEditingField && (
        <form
          onSubmit={handleSaveFieldEdit}
          className="p-3 bg-slate-800 border-t border-slate-700 flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-150"
        >
          <div className="text-xs text-sky-400 font-semibold capitalize shrink-0">
            Edit {isEditingField}:
          </div>
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 bg-slate-900 text-white px-3 py-1.5 text-xs rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Simpan
          </button>
          <button
            type="button"
            onClick={() => setIsEditingField(null)}
            className="px-2 py-1.5 text-slate-400 hover:text-white text-xs cursor-pointer"
          >
            Batal
          </button>
        </form>
      )}

      {/* Attached Image Thumbnail Bar before sending */}
      {attachedImagePreview && (
        <div className="px-4 py-2 bg-slate-800/95 border-t border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white rounded-lg p-1 border border-slate-600 overflow-hidden flex items-center justify-center">
              <img
                src={attachedImagePreview}
                alt="Logo thumbnail"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">
                {attachedImageFile?.name || 'logo.png'}
              </span>
              <span className="text-[10px] text-slate-400">
                Logo siap dikirim bersama teks lowongan
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setAttachedImageFile(null);
              setAttachedImagePreview(null);
            }}
            className="p-1 text-slate-400 hover:text-rose-400 rounded-lg"
            title="Hapus lampiran"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 sm:p-4 bg-slate-800/90 border-t border-slate-700 flex items-center gap-2"
      >
        {/* Hidden File Input for Logo Upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleSelectFile}
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
        />

        {/* Upload Logo Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-3 rounded-2xl bg-slate-700/80 hover:bg-slate-700 text-slate-200 hover:text-sky-300 transition-colors cursor-pointer border border-slate-600/50"
          title="Upload Logo Perusahaan (PNG/JPG/WEBP, Maks 5 MB)"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        <textarea
          rows={1}
          value={inputRawText}
          onChange={(e) => setInputRawText(e.target.value)}
          placeholder="Kirim teks loker mentah di sini (contoh: PT Maju Jaya buka loker Admin di Surabaya...)"
          className="flex-1 bg-slate-900 text-slate-100 placeholder-slate-500 text-xs sm:text-sm px-4 py-3 rounded-2xl border border-slate-700 focus:outline-none focus:border-sky-500 resize-none max-h-24"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />

        <button
          type="submit"
          disabled={(!inputRawText.trim() && !attachedImageFile) || isProcessing}
          className="p-3 rounded-2xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white transition-colors cursor-pointer shadow-md shadow-sky-600/30"
          title="Kirim ke Bot Telegram"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
