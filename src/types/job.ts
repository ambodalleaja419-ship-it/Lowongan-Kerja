export type JobStatus = 'draft' | 'published' | 'archived';

export type EmploymentType =
  | 'Full-time'
  | 'Part-time'
  | 'Kontrak'
  | 'Magang'
  | 'Freelance'
  | 'Remote';

export type ApplicationStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'CV_REQUESTED'
  | 'CV_RECEIVED'
  | 'INTERVIEW'
  | 'ACCEPTED'
  | 'REJECTED';

export interface Company {
  id: string;
  name: string;
  logo_url: string | null;
  logo_path?: string | null;
  description?: string | null;
  industry?: string | null;
  location?: string | null;
  website?: string | null;
  created_at: string;
  updated_at: string;
  jobs_count?: number;
}

export interface Job {
  id: string;
  company_id?: string | null;
  company_name: string;
  company_logo?: string | null;
  position: string;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_text: string | null;
  employment_type: string | null;
  education: string | null;
  min_age: number | null;
  max_age: number | null;
  gender: string | null;
  experience: string | null;
  skills: string[];
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  description: string;
  deadline: string | null;
  application_url: string | null;
  slug: string;
  status: JobStatus;
  featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  full_name: string;
  domicile: string;
  age: number;
  applied_position: string;
  telegram_username: string;
  telegram_number: string | null;
  consent: boolean;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  job?: Partial<Job>;
}

export interface AIParseResult {
  company: string | null;
  company_id?: string | null;
  company_logo?: string | null;
  position: string | null;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_text: string | null;
  employment_type: string | null;
  education: string | null;
  min_age: number | null;
  max_age: number | null;
  gender: string | null;
  experience: string | null;
  skills: string[];
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  deadline: string | null;
  application_url: string | null;
  description: string;
  is_valid: boolean;
  missing_fields: string[];
  telegram_preview?: string;
}

export interface TelegramBotMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  imageUrl?: string;
  imageFile?: File | null;
  parsedJob?: AIParseResult;
  actions?: Array<{
    label: string;
    action: string;
    variant?: 'primary' | 'secondary' | 'danger' | 'warning';
  }>;
}
