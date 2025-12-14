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
  sort?: "newest" | "oldest";
};

export async function list(params: JobListParams, options?: { token?: string | null }) {
  const qs = buildQuery(params);
  return apiPaginated<Job>(`jobs${qs}`, options?.token ? { token: options.token } : undefined);
}

export async function show(jobId: number | string) {
  return apiRequest<{ data: Job }>(`jobs/${String(jobId)}`);
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

export async function appliedIds(token: string) {
  return apiRequest<{ data: AppliedJobStatus[] }>("applied-jobs/ids", { token });
}
