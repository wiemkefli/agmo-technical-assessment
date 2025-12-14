import { apiPaginated, apiRequest } from "@/lib/api";
import type { Job, PaginatedResponse } from "@/lib/types";
import { buildQuery } from "@/lib/clients/query";

export async function list(
  params: { page?: number; per_page?: number },
  token: string,
  options?: { signal?: AbortSignal },
): Promise<PaginatedResponse<Job>> {
  const qs = buildQuery(params);
  return apiPaginated<Job>(`saved-jobs${qs}`, { token, signal: options?.signal });
}

export async function listPreview(
  params: { per_page?: number },
  token: string,
  options?: { signal?: AbortSignal },
): Promise<PaginatedResponse<Job>> {
  const qs = buildQuery(params);
  return apiPaginated<Job>(`saved-jobs${qs}`, { token, signal: options?.signal });
}

export async function ids(token: string, options?: { signal?: AbortSignal }) {
  return apiRequest<{ data: number[] }>("saved-jobs/ids", { token, signal: options?.signal });
}

export async function save(jobId: number, token: string) {
  return apiRequest(`jobs/${jobId}/save`, { method: "POST", token });
}

export async function unsave(jobId: number, token: string) {
  return apiRequest(`jobs/${jobId}/save`, { method: "DELETE", token });
}
