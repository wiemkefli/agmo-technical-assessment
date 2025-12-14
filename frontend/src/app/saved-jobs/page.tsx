"use client";

import { useCallback, useEffect, useState } from "react";
import { Protected } from "@/components/Protected";
import { JobCard } from "@/components/JobCard";
import { JobModal } from "@/components/JobModal";
import { apiPaginated, apiRequest, getErrorMessage } from "@/lib/api";
import type { Application, Job, PaginatedResponse } from "@/lib/types";
import { useAuthStore } from "@/store/auth";

export default function SavedJobsPage() {
  const { token } = useAuthStore();

  const [data, setData] = useState<PaginatedResponse<Job> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<number>>(new Set());
  const [applicationStatusByJobId, setApplicationStatusByJobId] = useState<Map<number, string>>(
    () => new Map(),
  );

  const [page, setPage] = useState(1);
  const perPage = 10;

  const currentPage = data?.meta.current_page ?? page;
  const lastPage = data?.meta.last_page ?? currentPage;
  const prevDisabled = loading || !data || currentPage <= 1;
  const nextDisabled = loading || !data || currentPage >= lastPage;

  const reloadSavedJobs = useCallback(() => {
    if (!token) return;
    let alive = true;
    setLoading(true);
    setError(null);

    apiPaginated<Job>(`saved-jobs?page=${page}&per_page=${perPage}`, { token })
      .then((res) => alive && setData(res))
      .catch((e: unknown) =>
        alive && setError(getErrorMessage(e, "Failed to load saved jobs")),
      )
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [page, token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    const cleanup = reloadSavedJobs();
    return cleanup;
  }, [reloadSavedJobs]);

  useEffect(() => {
    if (!token) return;
    let alive = true;
    apiRequest<{ data: Application[] }>("applied-jobs", { token })
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
  }, [token]);

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

  const unsave = async (jobId: number) => {
    if (!token) return;
    await apiRequest(`jobs/${jobId}/save`, { method: "DELETE", token });
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        data: prev.data.filter((j) => j.id !== jobId),
        meta: { ...prev.meta, total: Math.max(0, prev.meta.total - 1) },
      };
    });
  };

  return (
    <Protected roles={["applicant"]}>
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Saved Jobs</h1>
            {data && (
              <p className="mt-1 text-sm text-zinc-600">
                {data.meta.total} saved job{data.meta.total === 1 ? "" : "s"}
              </p>
            )}
          </div>
        </div>

        {loading && <p className="text-sm text-zinc-600">Loading.</p>}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {data && (
          <>
            {data.data.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 shadow-sm sm:p-6">
                You haven&apos;t saved any jobs yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {data.data.map((job) => (
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
                      />
                    </button>

                    <button
                      type="button"
                      aria-label="Remove saved job"
                      title="Remove"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        unsave(job.id).catch(() => {});
                      }}
                      className="absolute right-1 top-1 rounded-md p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40"
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
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={prevDisabled}
                className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <div className="text-sm text-zinc-600">
                Page {currentPage} of {lastPage}
              </div>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={nextDisabled}
                className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {selectedJobId !== null && (
        <JobModal
          jobId={selectedJobId}
          alreadyApplied={appliedJobIds.has(selectedJobId)}
          onApplied={markApplied}
          onClose={() => setSelectedJobId(null)}
        />
      )}
    </Protected>
  );
}
