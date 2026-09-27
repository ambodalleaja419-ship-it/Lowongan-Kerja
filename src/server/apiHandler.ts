import { GoogleGenAI, Type } from '@google/genai';
import { formatTelegramPreview, validateParsedJob } from '../services/aiJobParser';
import { AIParseResult } from '../types/job';

// Initialize Gemini client server-side
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function handleParseJob(rawText: string): Promise<AIParseResult> {
  const ai = getGeminiClient();

  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured on the server');
  }

  const systemInstruction = `Kamu adalah AI Recruitment Content Parser.

Tugas kamu adalah membaca informasi lowongan kerja yang diberikan admin, kemudian:
1. Ekstrak informasi faktual.
2. Jangan mengarang informasi.
3. Jangan mengubah angka gaji.
4. Jangan membuat kualifikasi yang tidak diberikan.
5. Jangan mengubah nama perusahaan.
6. Jangan mengubah lokasi.
7. Jika informasi tidak tersedia, gunakan null.
8. Rapikan grammar Bahasa Indonesia.
9. Buat deskripsi profesional.
10. Pertahankan makna asli lowongan.
11. Jangan memberikan janji bahwa kandidat pasti diterima.
12. Jangan menghilangkan informasi penting.`;

  const prompt = `Ekstrak dan rapikan teks lowongan kerja berikut menjadi JSON terstruktur sesuai skema:

---
${rawText}
---`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          company: { type: Type.STRING, description: 'Nama perusahaan / toko / instansi. Gunakan null jika tidak disebutkan.' },
          position: { type: Type.STRING, description: 'Nama posisi atau jabatan pekerjaan. Gunakan null jika tidak disebutkan.' },
          location: { type: Type.STRING, description: 'Kota atau daerah penempatan kerja. Gunakan null jika tidak disebutkan.' },
          salary_min: { type: Type.NUMBER, description: 'Batas bawah gaji dalam angka Rupiah (misal 3500000). null jika tidak ada.' },
          salary_max: { type: Type.NUMBER, description: 'Batas atas gaji dalam angka Rupiah (misal 5000000). null jika tidak ada.' },
          salary_text: { type: Type.STRING, description: 'Format teks gaji yang rapi (contoh: Rp 3.500.000 - Rp 5.000.000). null jika tidak ada.' },
          employment_type: { type: Type.STRING, description: 'Jenis pekerjaan: Full-time, Part-time, Kontrak, Magang, Freelance. null jika tidak ada.' },
          education: { type: Type.STRING, description: 'Kualifikasi pendidikan minimum (misal Minimal SMA/SMK). null jika tidak ada.' },
          min_age: { type: Type.INTEGER, description: 'Batas minimal usia dalam angka. null jika tidak ada.' },
          max_age: { type: Type.INTEGER, description: 'Batas maksimal usia dalam angka. null jika tidak ada.' },
          gender: { type: Type.STRING, description: 'Gender yang dicari: Pria, Wanita, atau Pria/Wanita. null jika tidak ada.' },
          experience: { type: Type.STRING, description: 'Syarat pengalaman kerja. null jika tidak ada.' },
          skills: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Daftar keahlian atau keterampilan spesifik yang disebutkan.'
          },
          requirements: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Daftar butir kualifikasi dan syarat kandidat.'
          },
          responsibilities: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Daftar tugas dan tanggung jawab pekerjaan.'
          },
          benefits: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Daftar benefit atau fasilitas yang didapatkan.'
          },
          deadline: { type: Type.STRING, description: 'Batas waktu lamaran jika ada format YYYY-MM-DD. null jika tidak ada.' },
          application_url: { type: Type.STRING, description: 'Link lamaran jika ada. null jika tidak ada.' },
          description: { type: Type.STRING, description: 'Deskripsi dan pengantar lowongan yang profesional dan rapi dalam Bahasa Indonesia.' },
        },
        required: ['skills', 'requirements', 'responsibilities', 'benefits', 'description'],
      },
    },
  });

  const rawJson = response.text?.trim() || '{}';
  const parsed = JSON.parse(rawJson);

  const validation = validateParsedJob(parsed);
  const result: AIParseResult = {
    company: parsed.company || null,
    position: parsed.position || null,
    location: parsed.location || null,
    salary_min: typeof parsed.salary_min === 'number' ? parsed.salary_min : null,
    salary_max: typeof parsed.salary_max === 'number' ? parsed.salary_max : null,
    salary_text: parsed.salary_text || (parsed.salary_min && parsed.salary_max ? `Rp ${parsed.salary_min.toLocaleString('id-ID')} - Rp ${parsed.salary_max.toLocaleString('id-ID')}` : null),
    employment_type: parsed.employment_type || null,
    education: parsed.education || null,
    min_age: typeof parsed.min_age === 'number' ? parsed.min_age : null,
    max_age: typeof parsed.max_age === 'number' ? parsed.max_age : null,
    gender: parsed.gender || null,
    experience: parsed.experience || null,
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    requirements: Array.isArray(parsed.requirements) ? parsed.requirements : [],
    responsibilities: Array.isArray(parsed.responsibilities) ? parsed.responsibilities : [],
    benefits: Array.isArray(parsed.benefits) ? parsed.benefits : [],
    deadline: parsed.deadline || null,
    application_url: parsed.application_url || null,
    description: parsed.description || rawText,
    is_valid: validation.isValid,
    missing_fields: validation.missingFields,
  };

  result.telegram_preview = formatTelegramPreview(result);
  return result;
}

export async function sendTelegramNotification(text: string, replyMarkup?: any): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.ADMIN_TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.log('[Telegram Notification Skipped] TELEGRAM_BOT_TOKEN or ADMIN_TELEGRAM_CHAT_ID not configured.');
    return false;
  }

  try {
    const payload: any = {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    };
    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    return Boolean(result.ok);
  } catch (err) {
    console.error('Error sending Telegram notification:', err);
    return false;
  }
}

export async function sendTelegramPhoto(photoUrl: string, caption?: string, replyMarkup?: any): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.ADMIN_TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.log('[Telegram Photo Skipped] TELEGRAM_BOT_TOKEN or ADMIN_TELEGRAM_CHAT_ID not configured.');
    return false;
  }

  try {
    const payload: any = {
      chat_id: chatId,
      photo: photoUrl,
      caption,
      parse_mode: 'HTML',
    };
    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    return Boolean(result.ok);
  } catch (err) {
    console.error('Error sending Telegram photo:', err);
    return false;
  }
}

