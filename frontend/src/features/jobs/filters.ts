import type { JobListParams } from "@/lib/clients/jobs";

export type WorkArrangement = "any" | "remote" | "onsite";
export type Sort = "newest" | "oldest";

export type JobFilters = {
  q: string;
  location: string;
  work_arrangement: WorkArrangement;
  salary_min: string;
  salary_max: string;
  sort: Sort;
};

export function parseFiltersFromSearchParams(searchParams: {
  get: (key: string) => string | null;
}): JobFilters {
  const urlIsRemote = searchParams.get("is_remote");
  const work_arrangement: WorkArrangement =
    urlIsRemote === "1" ? "remote" : urlIsRemote === "0" ? "onsite" : "any";

  const sort = (searchParams.get("sort") as Sort) ?? "newest";
  const safeSort: Sort = sort === "oldest" ? "oldest" : "newest";

  return {
    q: searchParams.get("q") ?? "",
    location: searchParams.get("location") ?? "",
    work_arrangement,
    salary_min: searchParams.get("salary_min") ?? "",
    salary_max: searchParams.get("salary_max") ?? "",
    sort: safeSort,
  };
}

export function buildJobsQueryString(params: {
  page: number;
  per_page: number;
  filters: JobFilters;
}): string {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page));
  sp.set("per_page", String(params.per_page));

  const q = params.filters.q.trim();
  const location = params.filters.location.trim();

  if (q) sp.set("q", q);
  if (location) sp.set("location", location);

  if (params.filters.work_arrangement === "remote") sp.set("is_remote", "1");
  if (params.filters.work_arrangement === "onsite") sp.set("is_remote", "0");

  if (params.filters.salary_min.trim()) sp.set("salary_min", params.filters.salary_min.trim());
  if (params.filters.salary_max.trim()) sp.set("salary_max", params.filters.salary_max.trim());

  if (params.filters.sort) sp.set("sort", params.filters.sort);

  return sp.toString();
}

export function toJobListParams(params: {
  page: number;
  per_page: number;
  filters: JobFilters;
}): JobListParams {
  const q = params.filters.q.trim();
  const location = params.filters.location.trim();

  const is_remote =
    params.filters.work_arrangement === "remote"
      ? 1
      : params.filters.work_arrangement === "onsite"
        ? 0
        : undefined;

  return {
    page: params.page,
    per_page: params.per_page,
    q: q || undefined,
    location: location || undefined,
    is_remote,
    salary_min: params.filters.salary_min.trim() || undefined,
    salary_max: params.filters.salary_max.trim() || undefined,
    sort: params.filters.sort,
  };
}

