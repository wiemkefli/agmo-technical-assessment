"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { JobCard } from "@/components/JobCard";
import { JobModal } from "@/components/JobModal";
import { PaginationControls } from "@/components/PaginationControls";
import { useAuthStore } from "@/store/auth";
import type { JobFilters, Sort, WorkArrangement } from "@/features/jobs/filters";
import { toJobListParams } from "@/features/jobs/filters";
import { useApplicantJobState } from "@/features/jobs/useApplicantJobState";
import { useJobsListing } from "@/features/jobs/useJobsListing";
import { useJobsUrlState } from "@/features/jobs/useJobsUrlState";

function toPositiveInt(value: unknown, fallback: number) {
  const n = typeof value === "string" ? Number.parseInt(value, 10) : Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function JobsFiltersCard(props: {
  initialFilters: JobFilters;
  perPage: number;
  pushJobs: (params: { page: number; perPage: number; filters: JobFilters }) => void;
  pushCleared: (params: { perPage: number }) => void;
}) {
  const [draft, setDraft] = useState<JobFilters>(props.initialFilters);
  const [moreOpen, setMoreOpen] = useState(false);

  const applyFilters = () => {
    setMoreOpen(false);
    props.pushJobs({ page: 1, perPage: props.perPage, filters: draft });
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
    props.pushCleared({ perPage: props.perPage });
  };

  return (
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
  );
}

export function JobsClient() {
  const router = useRouter();
  const { page, perPage, filters, filtersKey, pushJobs, pushCleared } = useJobsUrlState();
  const { token, role } = useAuthStore();
  const [hideAppliedJobs, setHideAppliedJobs] = useState(true);

  const listParams = toJobListParams({
    page,
    per_page: perPage,
    filters,
  });

  const { data, loading, error } = useJobsListing({ listParams, token });

  const {
    isApplicant,
    appliedJobIds,
    applicationStatusByJobId,
    savedJobIds,
    savedJobs,
    savingJobIds,
    toggleSave,
    markApplied,
  } = useApplicantJobState({ token, role });

  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const currentPage = toPositiveInt(
    String(data?.meta.current_page ?? page),
    page,
  );
  const lastPage = toPositiveInt(
    String(data?.meta.last_page ?? currentPage),
    currentPage,
  );

  const goTo = (nextPage: number) => {
    const safeNext = toPositiveInt(String(nextPage), 1);
    const minPage = Math.max(1, safeNext);
    const bounded = data ? Math.min(minPage, lastPage) : minPage;
    pushJobs({ page: bounded, perPage, filters });
  };

  return (
    <div className="space-y-4">
      <JobsFiltersCard
        key={filtersKey}
        initialFilters={filters}
        perPage={perPage}
        pushJobs={pushJobs}
        pushCleared={pushCleared}
      />

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
