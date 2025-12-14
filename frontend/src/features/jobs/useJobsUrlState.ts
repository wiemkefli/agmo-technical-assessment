"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { JobFilters } from "@/features/jobs/filters";
import { buildJobsQueryString, parseFiltersFromSearchParams } from "@/features/jobs/filters";

function toPositiveInt(value: unknown, fallback: number) {
  const n = typeof value === "string" ? Number.parseInt(value, 10) : Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function useJobsUrlState() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = toPositiveInt(searchParams.get("page"), 1);
  const perPage = toPositiveInt(searchParams.get("per_page"), 10);
  const filters = parseFiltersFromSearchParams(searchParams);
  const filtersKey = JSON.stringify(filters);

  const pushJobs = (params: { page: number; perPage: number; filters: JobFilters }) => {
    router.push(`/jobs?${buildJobsQueryString({ page: params.page, per_page: params.perPage, filters: params.filters })}`);
  };

  const pushCleared = (params: { perPage: number }) => {
    router.push(`/jobs?page=1&per_page=${toPositiveInt(params.perPage, 10)}`);
  };

  return { page, perPage, filters, filtersKey, pushJobs, pushCleared };
}

