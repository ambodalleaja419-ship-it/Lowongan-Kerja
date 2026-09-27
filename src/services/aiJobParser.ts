import { AIParseResult } from '../types/job';

export function formatTelegramPreview(parsed: AIParseResult): string {
  const parts: string[] = [
    '━━━━━━━━━━━━━━━━━━',
    '📢 PREVIEW LOWONGAN',
    '━━━━━━━━━━━━━━━━━━',
    '',
    `🏢 ${parsed.company || 'Perusahaan tidak dicantumkan'}`,
    `💼 ${parsed.position || 'Posisi tidak dicantumkan'}`,
    `📍 ${parsed.location || 'Lokasi tidak dicantumkan'}`,
  ];

  if (parsed.salary_min || parsed.salary_max || parsed.salary_text) {
    if (parsed.salary_min && parsed.salary_max) {
      parts.push(`💰 Rp ${parsed.salary_min.toLocaleString('id-ID')} - Rp ${parsed.salary_max.toLocaleString('id-ID')}`);
    } else if (parsed.salary_text) {
      parts.push(`💰 ${parsed.salary_text}`);
    } else if (parsed.salary_min) {
      parts.push(`💰 Mulai Rp ${parsed.salary_min.toLocaleString('id-ID')}`);
    }
  } else {
    parts.push('💰 Gaji: Tidak dicantumkan');
  }

  if (parsed.education) {
    parts.push(`🎓 ${parsed.education}`);
  }

  if (parsed.gender) {
    parts.push(`👤 ${parsed.gender}`);
  }

  if (parsed.min_age && parsed.max_age) {
    parts.push(`🎂 Usia ${parsed.min_age} - ${parsed.max_age} tahun`);
  } else if (parsed.min_age) {
    parts.push(`🎂 Usia minimal ${parsed.min_age} tahun`);
  } else if (parsed.max_age) {
    parts.push(`🎂 Usia maksimal ${parsed.max_age} tahun`);
  }

  if (parsed.requirements && parsed.requirements.length > 0) {
    parts.push('');
    parts.push('📋 KUALIFIKASI:');
    parsed.requirements.forEach(req => parts.push(`• ${req}`));
  }

  if (parsed.responsibilities && parsed.responsibilities.length > 0) {
    parts.push('');
    parts.push('📌 TANGGUNG JAWAB:');
    parsed.responsibilities.forEach(resp => parts.push(`• ${resp}`));
  }

  if (parsed.benefits && parsed.benefits.length > 0) {
    parts.push('');
    parts.push('🎁 BENEFIT:');
    parsed.benefits.forEach(ben => parts.push(`• ${ben}`));
  }

  parts.push('');
  parts.push('━━━━━━━━━━━━━━━━━━');
  parts.push('Apakah lowongan ini sudah benar?');

  return parts.join('\n');
}

export function validateParsedJob(parsed: Partial<AIParseResult>): {
  isValid: boolean;
  missingFields: string[];
  message: string;
} {
  const missing: string[] = [];

  if (!parsed.company || parsed.company.trim().length < 2) {
    missing.push('Nama Perusahaan');
  }
  if (!parsed.position || parsed.position.trim().length < 2) {
    missing.push('Posisi / Jabatan');
  }
  if (!parsed.location || parsed.location.trim().length < 2) {
    missing.push('Lokasi Penempatan');
  }

  if (missing.length > 0) {
    return {
      isValid: false,
      missingFields: missing,
      message: `⚠️ Data belum lengkap.\n\nInformasi yang belum ditemukan:\n${missing.map(f => `• ${f}`).join('\n')}\n\nSilakan tambahkan informasi tersebut dalam teks lowongan.`
    };
  }

  return {
    isValid: true,
    missingFields: [],
    message: 'Data lowongan lengkap dan valid.'
  };
}

export async function requestParseJobWithAI(rawText: string): Promise<AIParseResult> {
  try {
    const response = await fetch('/api/ai/parse-job', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.result) {
        return data.result;
      }
    }
  } catch (err) {
    console.warn('API /api/ai/parse-job unreachable or error, invoking fallback parsing heuristic:', err);
  }

  // Robust Client-Side Heuristic Fallback in case backend API is warming up
  return fallbackJobParser(rawText);
}

export function fallbackJobParser(text: string): AIParseResult {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  let company: string | null = null;
  let position: string | null = null;
  let location: string | null = null;
  let salary_min: number | null = null;
  let salary_max: number | null = null;
  let salary_text: string | null = null;
  let min_age: number | null = null;
  let max_age: number | null = null;
  let gender: string | null = null;
  let education: string | null = null;
  const skills: string[] = [];
  const requirements: string[] = [];
  const responsibilities: string[] = [];
  const benefits: string[] = [];

  // Match PT / CV / Toko
  const companyMatch = text.match(/(?:PT|CV|Toko|Klinik|Restoran|Cafe|Warung|Yayasan)\s+[\w\s]{2,40}/i);
  if (companyMatch) {
    company = companyMatch[0].trim();
  }

  // Match Posisi
  const posMatch = text.match(/(?:posisi|lowongan|loker|sebagai|mencari)\s+([a-zA-Z\s/&-]{3,30})/i);
  if (posMatch && posMatch[1]) {
    position = posMatch[1].replace(/di\s+.*$/i, '').trim();
  } else if (text.toLowerCase().includes('admin gudang')) {
    position = 'Admin Gudang';
  } else if (text.toLowerCase().includes('barista')) {
    position = 'Barista';
  } else if (text.toLowerCase().includes('kasir')) {
    position = 'Kasir';
  }

  // Match Lokasi
  const indonesianCities = ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar', 'Palembang', 'Yogyakarta', 'Tangerang', 'Bekasi', 'Depok', 'Bogor', 'Malang', 'Solo', 'Denpasar', 'Bali'];
  for (const city of indonesianCities) {
    if (new RegExp(`\\b${city}\\b`, 'i').test(text)) {
      location = city;
      break;
    }
  }

  // Match Usia
  const ageMatch = text.match(/usia\s*(\d{1,2})\s*(?:-|sampai|sd|hingga)\s*(\d{1,2})/i);
  if (ageMatch) {
    min_age = parseInt(ageMatch[1], 10);
    max_age = parseInt(ageMatch[2], 10);
  }

  // Match Gender
  if (/pria\s*atau\s*wanita|pria\/wanita|laki-laki\/perempuan/i.test(text)) {
    gender = 'Pria/Wanita';
  } else if (/khusus\s*wanita|wanita|perempuan/i.test(text)) {
    gender = 'Wanita';
  } else if (/khusus\s*pria|pria|laki-laki/i.test(text)) {
    gender = 'Pria';
  }

  // Match Pendidikan
  if (/sma\/smk|smk|sma sederajat/i.test(text)) {
    education = 'Minimal SMA/SMK';
  } else if (/d3/i.test(text)) {
    education = 'Minimal D3';
  } else if (/s1/i.test(text)) {
    education = 'Minimal S1';
  }

  // Match Gaji
  const salaryMatch = text.match(/(\d(?:[.,]\d)?)\s*(?:-|sampai|sd)\s*(\d(?:[.,]\d)?)\s*juta/i);
  if (salaryMatch) {
    salary_min = parseFloat(salaryMatch[1].replace(',', '.')) * 1000000;
    salary_max = parseFloat(salaryMatch[2].replace(',', '.')) * 1000000;
    salary_text = `Rp ${salary_min.toLocaleString('id-ID')} - Rp ${salary_max.toLocaleString('id-ID')}`;
  }

  if (education) requirements.push(education);
  if (min_age && max_age) requirements.push(`Usia ${min_age}-${max_age} tahun`);
  if (gender) requirements.push(gender);
  if (/komputer|excel/i.test(text)) {
    requirements.push('Mampu mengoperasikan komputer');
    skills.push('Komputer Dasar');
  }
  if (/pengalaman tidak wajib|fresh graduate/i.test(text)) {
    requirements.push('Pengalaman tidak wajib (Fresh graduate welcome)');
  }

  const validation = validateParsedJob({ company, position, location });

  const result: AIParseResult = {
    company,
    position,
    location,
    salary_min,
    salary_max,
    salary_text,
    employment_type: 'Full-time',
    education,
    min_age,
    max_age,
    gender,
    experience: /tidak wajib/i.test(text) ? 'Tidak wajib' : null,
    skills,
    requirements: requirements.length > 0 ? requirements : ['Kualifikasi akan disampaikan saat wawancara'],
    responsibilities,
    benefits,
    deadline: null,
    application_url: null,
    description: text,
    is_valid: validation.isValid,
    missing_fields: validation.missingFields,
  };

  result.telegram_preview = formatTelegramPreview(result);
  return result;
}
