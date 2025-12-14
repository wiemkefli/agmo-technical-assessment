import { apiPaginated, apiRequest } from "@/lib/api";
import type { Job, PaginatedResponse } from "@/lib/types";
import { buildQuery } from "@/lib/clients/query";

export async function list(params: { page?: number; per_page?: number }, token: string): Promise<PaginatedResponse<Job>> {
  const qs = buildQuery(params);
  return apiPaginated<Job>(`saved-jobs${qs}`, { token });
}

export async function listPreview(params: { per_page?: number }, token: string): Promise<PaginatedResponse<Job>> {
  const qs = buildQuery(params);
  return apiPaginated<Job>(`saved-jobs${qs}`, { token });
}

export async function ids(token: string) {
  return apiRequest<{ data: number[] }>("saved-jobs/ids", { token });
}

export async function save(jobId: number, token: string) {
  return apiRequest(`jobs/${jobId}/save`, { method: "POST", token });
}

export async function unsave(jobId: number, token: string) {
  return apiRequest(`jobs/${jobId}/save`, { method: "DELETE", token });
}

