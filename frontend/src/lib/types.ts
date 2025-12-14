export type Role = "employer" | "applicant";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  company: string | null;
  website?: string | null;
  phone?: string | null;
  location?: string | null;
  resume?: {
    exists: boolean;
    original_name: string | null;
    mime: string | null;
    size: number | null;
  };
  created_at: string;
  updated_at: string;
}

export type JobStatus = "draft" | "published";

export interface Job {
  id: number;
  employer_id: number;
  title: string;
  description: string;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  is_remote: boolean;
  status: JobStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  employer?: User;
}

export interface Application {
  id: number;
  job_id: number;
  applicant_id: number;
  message: string;
  status: string;
  has_resume: boolean;
  resume_original_name: string | null;
  resume_mime: string | null;
  resume_size: number | null;
  created_at: string;
  updated_at: string;
  applicant?: User;
  job?: Job;
}

export interface AppliedJobStatus {
  job_id: number;
  status: string;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface JobFormPayload {
  title: string;
  description: string;
  location: string;
  salary_min: number;
  salary_max: number;
  is_remote: boolean;
  status: JobStatus;
}
