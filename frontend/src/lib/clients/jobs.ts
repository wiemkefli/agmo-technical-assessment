import { apiPaginated, apiRequest } from "@/lib/api";
import type { AppliedJobStatus, Job } from "@/lib/types";
import { buildQuery } from "@/lib/clients/query";

export type JobListParams = {
  page?: number;
  per_page?: number;
  q?: string;
  location?: string;
  is_remote?: 1 | 0;
  salary_min?: string | number;
  salary_max?: string | number;
  exclude_applied?: 1 | 0;
  sort?: "newest" | "oldest";
};

export async function list(
  params: JobListParams,
  options?: { token?: string | null; signal?: AbortSignal },
) {
  const qs = buildQuery(params);
  const token = options?.token ?? null;
  return apiPaginated<Job>(`jobs${qs}`, token ? { token, signal: options?.signal } : { signal: options?.signal });
}

export async function show(jobId: number | string, options?: { signal?: AbortSignal }) {
  return apiRequest<{ data: Job }>(`jobs/${String(jobId)}`, { signal: options?.signal });
}

export async function apply(
  jobId: number | string,
  params: { message: string; resume?: File | null; use_profile_resume?: boolean },
  token: string,
) {
  const form = new FormData();
  form.append("message", params.message);
  if (params.resume) form.append("resume", params.resume);
  else if (params.use_profile_resume) form.append("use_profile_resume", "1");

  return apiRequest(`jobs/${String(jobId)}/apply`, {
    method: "POST",
    body: form,
    token,
    isFormData: true,
  });
}

export async function appliedIds(token: string, options?: { signal?: AbortSignal }) {
  return apiRequest<{ data: AppliedJobStatus[] }>("applied-jobs/ids", { token, signal: options?.signal });
}
