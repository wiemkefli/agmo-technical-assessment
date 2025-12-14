import { apiPaginated, apiRequest } from "@/lib/api";
import type { Application, AppliedJobStatus, PaginatedResponse } from "@/lib/types";
import { buildQuery } from "@/lib/clients/query";

export async function list(
  params: { page?: number; per_page?: number },
  token: string,
  options?: { signal?: AbortSignal },
): Promise<PaginatedResponse<Application>> {
  const qs = buildQuery(params);
  return apiPaginated<Application>(`applied-jobs${qs}`, { token, signal: options?.signal });
}

export async function ids(token: string, options?: { signal?: AbortSignal }) {
  return apiRequest<{ data: AppliedJobStatus[] }>("applied-jobs/ids", { token, signal: options?.signal });
}
