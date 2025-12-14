import { apiPaginated, apiRequest } from "@/lib/api";
import type { Application, Job, JobFormPayload, PaginatedResponse } from "@/lib/types";
import { buildQuery } from "@/lib/clients/query";

export async function list(params: { page?: number; per_page?: number }, token: string): Promise<PaginatedResponse<Job>> {
  const qs = buildQuery(params);
  return apiPaginated<Job>(`employer/jobs${qs}`, { token });
}

export async function show(jobId: number | string, token: string) {
  return apiRequest<{ data: Job }>(`employer/jobs/${String(jobId)}`, { token });
}

export async function create(payload: JobFormPayload, token: string) {
  return apiRequest("employer/jobs", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function update(jobId: number | string, payload: JobFormPayload, token: string) {
  return apiRequest(`employer/jobs/${String(jobId)}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export async function remove(jobId: number | string, token: string) {
  return apiRequest(`employer/jobs/${String(jobId)}`, { method: "DELETE", token });
}

export async function applications(jobId: number | string, token: string) {
  return apiRequest<{ data: Application[] }>(`employer/jobs/${String(jobId)}/applications`, { token });
}
