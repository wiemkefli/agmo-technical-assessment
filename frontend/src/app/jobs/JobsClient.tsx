"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiPaginated, apiRequest, getErrorMessage } from "@/lib/api";
import type { AppliedJobStatus, Job, PaginatedResponse } from "@/lib/types";
import { JobCard } from "@/components/JobCard";
import { JobModal } from "@/components/JobModal";
import { PaginationControls } from "@/components/PaginationControls";
import { useAuthStore } from "@/store/auth";

type WorkArrangement = "any" | "remote" | "onsite";
type Sort = "newest" | "oldest";

type JobFilters = {
  q: string;
  location: string;
  work_arrangement: WorkArrangement;
  salary_min: string;
  salary_max: string;
  sort: Sort;
};

function parseFiltersFromSearchParams(searchParams: { get: (key: string) => string | null }): JobFilters {
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

export function JobsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, role } = useAuthStore();
  const isApplicant = role === "applicant" && !!token;
  const [hideAppliedJobs, setHideAppliedJobs] = useState(true);

  const toPositiveInt = (value: unknown, fallback: number) => {
    const n =
      typeof value === "string" ? Number.parseInt(value, 10) : Number(value);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const initialPage = toPositiveInt(searchParams.get("page"), 1);
  const initialPerPage = toPositiveInt(searchParams.get("per_page"), 10);

  const [pageState, setPageState] = useState(initialPage);
  const [perPageState, setPerPageState] = useState(initialPerPage);

  const [filters, setFilters] = useState<JobFilters>(() =>
    parseFiltersFromSearchParams(searchParams),
  );
  const [draft, setDraft] = useState<JobFilters>(() =>
    parseFiltersFromSearchParams(searchParams),
  );
  const [moreOpen, setMoreOpen] = useState(false);

  const [data, setData] = useState<PaginatedResponse<Job> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<number>>(new Set());
  const [applicationStatusByJobId, setApplicationStatusByJobId] = useState<Map<number, string>>(
    () => new Map(),
  );
  const [savedJobIds, setSavedJobIds] = useState<Set<number>>(new Set());
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const savingJobIdsRef = useRef<Set<number>>(new Set());
  const [savingJobIds, setSavingJobIds] = useState<Set<number>>(new Set());

  const currentPage = toPositiveInt(
    String(data?.meta.current_page ?? pageState),
    pageState,
  );
  const lastPage = toPositiveInt(
    String(data?.meta.last_page ?? currentPage),
    currentPage,
  );

  useEffect(() => {
    const nextPage = toPositiveInt(searchParams.get("page"), 1);
    const nextPerPage = toPositiveInt(searchParams.get("per_page"), 10);
    const nextFilters = parseFiltersFromSearchParams(searchParams);

    // Sync local state from URL only when URL changes.
    setPageState((prev) => (prev === nextPage ? prev : nextPage));
    setPerPageState((prev) => (prev === nextPerPage ? prev : nextPerPage));
    setFilters((prev) =>
      JSON.stringify(prev) === JSON.stringify(nextFilters) ? prev : nextFilters,
    );
    setDraft((prev) =>
      JSON.stringify(prev) === JSON.stringify(nextFilters) ? prev : nextFilters,
    );
  }, [searchParams]);

  const buildQuery = ({
    page,
    per_page,
    nextFilters,
  }: {
    page: number;
    per_page: number;
    nextFilters: JobFilters;
  }) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("per_page", String(per_page));

    const q = nextFilters.q.trim();
    const location = nextFilters.location.trim();

    if (q) params.set("q", q);
    if (location) params.set("location", location);

    if (nextFilters.work_arrangement === "remote") params.set("is_remote", "1");
    if (nextFilters.work_arrangement === "onsite") params.set("is_remote", "0");

    if (nextFilters.salary_min.trim()) params.set("salary_min", nextFilters.salary_min.trim());
    if (nextFilters.salary_max.trim()) params.set("salary_max", nextFilters.salary_max.trim());

    if (nextFilters.sort) params.set("sort", nextFilters.sort);

    return params.toString();
  };

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    const qs = buildQuery({
      page: pageState,
      per_page: perPageState,
      nextFilters: filters,
    });

    const endpoint =
      `jobs?${qs}`;

    apiPaginated<Job>(endpoint, token ? { token } : undefined)
      .then((res) => alive && setData(res))
      .catch((e: unknown) =>
        alive && setError(getErrorMessage(e, "Failed to load jobs")),
      )
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [pageState, perPageState, filters, token, role]);

  useEffect(() => {
    if (!token || role !== "applicant") return;
    let alive = true;
    apiRequest<{ data: AppliedJobStatus[] }>("applied-jobs/ids", { token })
      .then((res) => {
        if (!alive) return;
        setAppliedJobIds(new Set(res.data.map((a) => a.job_id)));
        setApplicationStatusByJobId(new Map(res.data.map((a) => [a.job_id, a.status])));
      })
      .catch(() => {
        if (!alive) return;
        setAppliedJobIds(new Set());
        setApplicationStatusByJobId(new Map());
      });
    return () => {
      alive = false;
    };
  }, [token, role]);

  const reloadSavedJobs = () => {
    if (!token || role !== "applicant") return;
    apiPaginated<Job>("saved-jobs?per_page=5", { token })
      .then((res) => {
        setSavedJobs(res.data);
      })
      .catch(() => {
        setSavedJobs([]);
      });
  };

  const reloadSavedJobIds = () => {
    if (!token || role !== "applicant") return;
    apiRequest<{ data: number[] }>("saved-jobs/ids", { token })
      .then((res) => setSavedJobIds(new Set(res.data)))
      .catch(() => setSavedJobIds(new Set()));
  };

  useEffect(() => {
    if (!token || role !== "applicant") return;
    reloadSavedJobs();
    reloadSavedJobIds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, role]);

const markApplied = (jobId: number) => {
  setAppliedJobIds((prev) => {
    const next = new Set(prev);
    next.add(jobId);
    return next;
  });
  setApplicationStatusByJobId((prev) => {
    const next = new Map(prev);
    next.set(jobId, next.get(jobId) ?? "submitted");
    return next;
  });
};

  const toggleSave = async (job: Job) => {
    if (!token || role !== "applicant") return;
    if (savingJobIdsRef.current.has(job.id)) return;

    const isSaved = savedJobIds.has(job.id);
    savingJobIdsRef.current.add(job.id);
    setSavingJobIds(new Set(savingJobIdsRef.current));

    try {
      if (isSaved) {
        await apiRequest(`jobs/${job.id}/save`, { method: "DELETE", token });
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(job.id);
          return next;
        });
        setSavedJobs((prev) => prev.filter((j) => j.id !== job.id));
      } else {
        await apiRequest(`jobs/${job.id}/save`, { method: "POST", token });
        setSavedJobIds((prev) => new Set(prev).add(job.id));
        setSavedJobs((prev) => [job, ...prev.filter((j) => j.id !== job.id)].slice(0, 5));
      }

      reloadSavedJobs();
      reloadSavedJobIds();
    } finally {
      savingJobIdsRef.current.delete(job.id);
      setSavingJobIds(new Set(savingJobIdsRef.current));
    }
  };

  const applyFilters = () => {
    setMoreOpen(false);
    setPageState(1);
    setFilters(draft);
    const safePerPage = toPositiveInt(String(perPageState), 10);
    router.push(`/jobs?${buildQuery({ page: 1, per_page: safePerPage, nextFilters: draft })}`);
  };

  const clearFilters = () => {
    const cleared: JobFilters = {
      q: "",
      location: "",
      work_arrangement: "any",
      salary_min: "",
      salary_max: "",
      sort: "newest",
    };
    setMoreOpen(false);
    setDraft(cleared);
    setFilters(cleared);
    setPageState(1);
    const safePerPage = toPositiveInt(String(perPageState), 10);
    router.push(`/jobs?page=1&per_page=${safePerPage}`);
  };

  const goTo = (nextPage: number) => {
    const safeNext = toPositiveInt(String(nextPage), 1);
    const minPage = Math.max(1, safeNext);
    const bounded = data ? Math.min(minPage, lastPage) : minPage;
    setPageState(bounded);
    const safePerPage = toPositiveInt(String(perPageState), 10);
    router.push(`/jobs?${buildQuery({ page: bounded, per_page: safePerPage, nextFilters: filters })}`);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 px-5 py-5 text-white shadow-md ring-1 ring-emerald-400/10">
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div>
            <p className="text-sm font-semibold text-white/90">What</p>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                value={draft.q}
                onChange={(e) => setDraft((p) => ({ ...p, q: e.target.value }))}
                placeholder="Enter keywords"
                className="h-11 w-full rounded-md bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none ring-1 ring-white/10 placeholder:text-zinc-400 focus:ring-2 focus:ring-emerald-400"
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyFilters();
                }}
              />
              <select
                value={draft.work_arrangement}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    work_arrangement: e.target.value as WorkArrangement,
                  }))
                }
                className="h-11 w-full rounded-md bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-emerald-400"
              >
                <option value="any">Any work arrangement</option>
                <option value="remote">Remote only</option>
                <option value="onsite">On-site only</option>
              </select>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-white/90">Where</p>
            <input
              value={draft.location}
              onChange={(e) => setDraft((p) => ({ ...p, location: e.target.value }))}
              placeholder="Enter suburb, city, or region"
              className="mt-2 h-11 w-full rounded-md bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none ring-1 ring-white/10 placeholder:text-zinc-400 focus:ring-2 focus:ring-emerald-400"
              onKeyDown={(e) => {
                if (e.key === "Enter") applyFilters();
              }}
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={applyFilters}
              className="h-11 rounded-md bg-emerald-500 px-5 text-sm font-semibold text-emerald-950 shadow-sm transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              Search
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-white/70 underline-offset-4 hover:text-white hover:underline"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className="text-sm font-medium text-white/85 underline-offset-4 hover:text-white hover:underline"
          >
            More options
          </button>
        </div>

        {moreOpen && (
          <div className="mt-4 grid gap-3 rounded-xl bg-white/10 p-4 ring-1 ring-emerald-300/20 backdrop-blur sm:grid-cols-2 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-white/90">Salary min</p>
              <input
                value={draft.salary_min}
                onChange={(e) => setDraft((p) => ({ ...p, salary_min: e.target.value }))}
                inputMode="numeric"
                placeholder="e.g. 3000"
                className="mt-1 h-10 w-full rounded-md bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none ring-1 ring-white/10 placeholder:text-zinc-400 focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-white/90">Salary max</p>
              <input
                value={draft.salary_max}
                onChange={(e) => setDraft((p) => ({ ...p, salary_max: e.target.value }))}
                inputMode="numeric"
                placeholder="e.g. 8000"
                className="mt-1 h-10 w-full rounded-md bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none ring-1 ring-white/10 placeholder:text-zinc-400 focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-2">
              <p className="text-xs font-semibold text-white/90">Sort</p>
              <select
                value={draft.sort}
                onChange={(e) => setDraft((p) => ({ ...p, sort: e.target.value as Sort }))}
                className="mt-1 h-10 w-full rounded-md bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-emerald-400"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {loading && <p className="text-sm text-zinc-600">Loading.</p>}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {data && (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            <section className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-zinc-900">Jobs</h2>
                {isApplicant && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-zinc-700">
                      Hide applied
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={hideAppliedJobs}
                      onClick={() => setHideAppliedJobs((v) => !v)}
                      className={[
                        "relative inline-flex h-5 w-9 items-center rounded-full border shadow-sm transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/30",
                        hideAppliedJobs
                          ? "border-emerald-600/40 bg-emerald-600"
                          : "border-zinc-200 bg-zinc-100",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "inline-flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm transition-transform",
                          hideAppliedJobs ? "translate-x-[1.05rem]" : "translate-x-0.5",
                        ].join(" ")}
                      >
                        {hideAppliedJobs ? (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-3 w-3 text-emerald-700"
                            aria-hidden="true"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-3 w-3 text-zinc-500"
                            aria-hidden="true"
                          >
                            <path d="M18 6 6 18" />
                            <path d="M6 6l12 12" />
                          </svg>
                        )}
                      </span>
                      <span className="sr-only">
                        {hideAppliedJobs ? "Hiding applied jobs" : "Showing applied jobs"}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                {data.data
                  .filter((job) => {
                    if (!isApplicant) return true;
                    if (!hideAppliedJobs) return true;
                    return !appliedJobIds.has(job.id);
                  })
                  .map((job) => {
                  const applied = isApplicant && appliedJobIds.has(job.id);
                  const saved = isApplicant && savedJobIds.has(job.id);

                  return (
                    <div key={job.id} className="relative">
                      <button
                        type="button"
                        onClick={() => setSelectedJobId(job.id)}
                        className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/30"
                      >
                  <JobCard
                    job={job}
                    applied={applied}
                    applicationStatus={applicationStatusByJobId.get(job.id)}
                    showStatus={false}
                  />
                      </button>

                      {isApplicant && (
                        <button
                          type="button"
                          aria-label={saved ? "Unsave job" : "Save job"}
                          title={saved ? "Saved" : "Save"}
                          disabled={savingJobIds.has(job.id)}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleSave(job);
                          }}
                          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-zinc-700 shadow-sm ring-1 ring-zinc-200 transition hover:bg-white hover:text-emerald-700 disabled:opacity-50"
                        >
                          {saved ? (
                            <svg
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="h-5 w-5 text-emerald-600"
                            >
                              <path d="M6 2a2 2 0 0 0-2 2v18l8-5 8 5V4a2 2 0 0 0-2-2H6z" />
                            </svg>
                          ) : (
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="h-5 w-5"
                            >
                              <path d="M6 2h12a2 2 0 0 1 2 2v18l-8-5-8 5V4a2 2 0 0 1 2-2z" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <PaginationControls
                className="pt-2"
                currentPage={currentPage}
                lastPage={lastPage}
                disabled={loading}
                onPrev={() => goTo(currentPage - 1)}
                onNext={() => goTo(currentPage + 1)}
              />
            </section>

            <aside className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900">Saved jobs</h3>
                {role === "applicant" && token && (
                  <button
                    type="button"
                    onClick={() => router.push("/saved-jobs")}
                    className="text-sm font-medium text-emerald-700 hover:underline underline-offset-4"
                  >
                    View all ({savedJobIds.size})
                  </button>
                )}
              </div>

              {!token && (
                <p className="text-sm text-zinc-600">
                  Login as an applicant to save jobs.
                </p>
              )}

              {token && role !== "applicant" && (
                <p className="text-sm text-zinc-600">
                  Saved jobs are available for applicants only.
                </p>
              )}

              {token && role === "applicant" && (
                <div className="space-y-4">
                  {savedJobs.length === 0 ? (
                    <p className="text-sm text-zinc-600">
                      You haven&apos;t saved any jobs yet.
                    </p>
                  ) : (
                    savedJobs.map((job) => (
                      <div key={job.id} className="relative">
                        <button
                          type="button"
                          onClick={() => setSelectedJobId(job.id)}
                          className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/30"
                        >
                          <JobCard
                            job={job}
                            applied={appliedJobIds.has(job.id)}
                            applicationStatus={applicationStatusByJobId.get(job.id)}
                            showStatus={false}
                            variant="compact"
                          />
                        </button>
                        <button
                          type="button"
                          aria-label="Remove saved job"
                          title="Remove"
                          disabled={savingJobIds.has(job.id)}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleSave(job);
                          }}
                          className="absolute right-1 top-1 rounded-md p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40 disabled:opacity-50"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-4 w-4"
                          >
                            <path d="M18 6 6 18" />
                            <path d="M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </aside>
          </div>
        </>
      )}
      {selectedJobId !== null && (
        <JobModal
          jobId={selectedJobId}
          alreadyApplied={appliedJobIds.has(selectedJobId)}
          onApplied={markApplied}
          onClose={() => setSelectedJobId(null)}
        />
      )}
    </div>
  );
}
