"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiPaginated, apiRequest, getErrorMessage } from "@/lib/api";
import type { Application, Job, PaginatedResponse } from "@/lib/types";
import { JobCard } from "@/components/JobCard";
import { JobModal } from "@/components/JobModal";
import { useAuthStore } from "@/store/auth";

export function JobsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, role } = useAuthStore();

  const toPositiveInt = (value: unknown, fallback: number) => {
    const n =
      typeof value === "string" ? Number.parseInt(value, 10) : Number(value);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const initialPage = toPositiveInt(searchParams.get("page"), 1);
  const initialPerPage = toPositiveInt(searchParams.get("per_page"), 10);

  const [pageState, setPageState] = useState(initialPage);
  const [perPageState, setPerPageState] = useState(initialPerPage);

  const [data, setData] = useState<PaginatedResponse<Job> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<number>>(new Set());

  const currentPage = toPositiveInt(
    String(data?.meta.current_page ?? pageState),
    pageState,
  );
  const lastPage = toPositiveInt(
    String(data?.meta.last_page ?? currentPage),
    currentPage,
  );
  const prevDisabled = loading || currentPage <= 1;
  const nextDisabled = loading || (data ? currentPage >= lastPage : false);

  useEffect(() => {
    const nextPage = toPositiveInt(searchParams.get("page"), 1);
    const nextPerPage = toPositiveInt(searchParams.get("per_page"), 10);

    // Sync local state from URL only when URL changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPageState((prev) => (prev === nextPage ? prev : nextPage));
    setPerPageState((prev) => (prev === nextPerPage ? prev : nextPerPage));
  }, [searchParams]);

  useEffect(() => {
    let alive = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    apiPaginated<Job>(`jobs?page=${pageState}&per_page=${perPageState}`)
      .then((res) => alive && setData(res))
      .catch((e: unknown) =>
        alive && setError(getErrorMessage(e, "Failed to load jobs")),
      )
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [pageState, perPageState]);

  useEffect(() => {
    if (!token || role !== "applicant") return;
    let alive = true;
    apiRequest<{ data: Application[] }>("applications", { token })
      .then((res) => {
        if (!alive) return;
        setAppliedJobIds(new Set(res.data.map((a) => a.job_id)));
      })
      .catch(() => {
        if (!alive) return;
        setAppliedJobIds(new Set());
      });
    return () => {
      alive = false;
    };
  }, [token, role]);

  const markApplied = (jobId: number) => {
    setAppliedJobIds((prev) => {
      const next = new Set(prev);
      next.add(jobId);
      return next;
    });
  };

  const goTo = (nextPage: number) => {
    const safeNext = toPositiveInt(String(nextPage), 1);
    const minPage = Math.max(1, safeNext);
    const bounded = data ? Math.min(minPage, lastPage) : minPage;
    setPageState(bounded);
    const safePerPage = toPositiveInt(String(perPageState), 10);
    router.push(`/jobs?page=${bounded}&per_page=${safePerPage}`);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
      {loading && <p className="text-sm text-zinc-600">Loading.</p>}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {data && (
        <>
          <div className="grid grid-cols-1 gap-4">
            {data.data.map((job) => (
              <button
                key={job.id}
                type="button"
                onClick={() => setSelectedJobId(job.id)}
                className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/30"
              >
                <JobCard
                  job={job}
                  applied={role === "applicant" && !!token && appliedJobIds.has(job.id)}
                />
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => goTo(currentPage - 1)}
              disabled={prevDisabled}
              className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-zinc-600">
              Page {currentPage} of {lastPage}
            </span>
            <button
              onClick={() => goTo(currentPage + 1)}
              disabled={nextDisabled}
              className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Next
            </button>
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
