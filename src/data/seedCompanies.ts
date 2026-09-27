import { Company } from '../types/job';

// High quality crisp corporate SVG logos encoded as data URIs for initial demo/seed data
const LOGO_MAJU_JAYA = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%232563eb"/><path d="M25 70 L25 35 L40 52 L55 35 L55 70 M65 35 L80 35 L80 58 Q80 70 70 70 Q62 70 62 62" stroke="white" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;

const LOGO_KOPI_KENANGAN = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%2378350f"/><path d="M30 42 C30 65 42 75 52 75 C62 75 74 65 74 42 Z M74 48 C82 48 86 54 86 58 C86 64 80 66 74 66" stroke="%23fef3c7" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M42 32 Q46 24 42 18 M52 32 Q56 24 52 18 M62 32 Q66 24 62 18" stroke="%23fef3c7" stroke-width="4" stroke-linecap="round" fill="none"/></svg>`;

const LOGO_NUSANTARA_TECH = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%230f172a"/><path d="M30 70 L30 30 L70 70 L70 30" stroke="%2338bdf8" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="50" cy="50" r="6" fill="%2338bdf8"/></svg>`;

const LOGO_BINA_SEHAT = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%23059669"/><rect x="42" y="22" width="16" height="56" rx="4" fill="white"/><rect x="22" y="42" width="56" height="16" rx="4" fill="white"/></svg>`;

const LOGO_CAHAYA_RITEL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%23ea580c"/><circle cx="50" cy="50" r="24" fill="none" stroke="white" stroke-width="7"/><path d="M50 14 L50 22 M50 78 L50 86 M14 50 L22 50 M78 50 L86 50 M25 25 L31 31 M69 69 L75 75 M25 75 L31 69 M69 31 L75 25" stroke="white" stroke-width="5" stroke-linecap="round"/></svg>`;

const LOGO_CREATIVE_CRAFT = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%237c3aed"/><path d="M26 68 C26 40 40 28 50 28 C60 28 74 40 74 68 Z" stroke="white" stroke-width="6" fill="none"/><circle cx="50" cy="52" r="10" fill="%23f472b6"/></svg>`;

export const initialSeedCompanies: Company[] = [
  {
    id: 'comp-maju-jaya',
    name: 'PT Maju Jaya Logistics',
    logo_url: LOGO_MAJU_JAYA,
    industry: 'Logistik & Rantai Pasok',
    location: 'Surabaya, Jawa Timur',
    website: 'https://majujayalogistics.co.id',
    description: 'Perusahaan penyedia jasa logistik pergudangan dan distribusi darat terkemuka di Indonesia Timur.',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    jobs_count: 1,
  },
  {
    id: 'comp-kopi-kenangan',
    name: 'Kopi Kenangan Nusantara',
    logo_url: LOGO_KOPI_KENANGAN,
    industry: 'Food & Beverage',
    location: 'Jakarta Selatan, DKI Jakarta',
    website: 'https://kopinusantara.id',
    description: 'Jaringan gerai kopi modern menyajikan cita rasa biji kopi asli nusantara dengan standar barista profesional.',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    jobs_count: 1,
  },
  {
    id: 'comp-nusantara-tech',
    name: 'Nusantara Tech Solusindo',
    logo_url: LOGO_NUSANTARA_TECH,
    industry: 'Teknologi Informasi & SaaS',
    location: 'Bandung, Jawa Barat',
    website: 'https://nusantaratech.id',
    description: 'Startup pengembang platform komputasi awan dan solusi otomasi bisnis untuk UMKM dan enterprise.',
    created_at: new Date(Date.now() - 3600000 * 100).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 10).toISOString(),
    jobs_count: 1,
  },
  {
    id: 'comp-bina-sehat',
    name: 'Bina Sehat Medika Hospital',
    logo_url: LOGO_BINA_SEHAT,
    industry: 'Kesehatan & Rumah Sakit',
    location: 'Semarang, Jawa Tengah',
    website: 'https://binasehatmedika.com',
    description: 'Layanan rumah sakit dan klinik terpadu dengan standar pelayanan medis modern dan ramah pasien.',
    created_at: new Date(Date.now() - 3600000 * 120).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    jobs_count: 1,
  },
  {
    id: 'comp-cahaya-ritel',
    name: 'Cahaya Ritel Indonesia',
    logo_url: LOGO_CAHAYA_RITEL,
    industry: 'Ritel & FMCG',
    location: 'Medan, Sumatera Utara',
    website: 'https://cahayaritel.co.id',
    description: 'Jaringan supermarket modern yang menyediakan berbagai kebutuhan harian masyarakat dengan harga terjangkau.',
    created_at: new Date(Date.now() - 3600000 * 150).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 30).toISOString(),
    jobs_count: 1,
  },
  {
    id: 'comp-creative-craft',
    name: 'Creative Craft Studio',
    logo_url: LOGO_CREATIVE_CRAFT,
    industry: 'Desain Kreatif & Multimedia',
    location: 'Yogyakarta, D.I. Yogyakarta',
    website: 'https://creativecraft.id',
    description: 'Agensi kreatif yang berfokus pada branding digital, animasi, dan produksi konten visual media sosial.',
    created_at: new Date(Date.now() - 3600000 * 200).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 50).toISOString(),
    jobs_count: 1,
  },
];
