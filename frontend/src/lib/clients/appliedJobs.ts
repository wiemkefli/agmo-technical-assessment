import { apiPaginated, apiRequest } from "@/lib/api";
import type { Application, AppliedJobStatus, PaginatedResponse } from "@/lib/types";
import { buildQuery } from "@/lib/clients/query";

export async function list(params: { page?: number; per_page?: number }, token: string): Promise<PaginatedResponse<Application>> {
  const qs = buildQuery(params);
  return apiPaginated<Application>(`applied-jobs${qs}`, { token });
}

export async function ids(token: string) {
  return apiRequest<{ data: AppliedJobStatus[] }>("applied-jobs/ids", { token });
}

