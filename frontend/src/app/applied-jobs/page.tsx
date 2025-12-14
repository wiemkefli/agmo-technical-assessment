"use client";

import { useEffect, useMemo, useState } from "react";
import { Protected } from "@/components/Protected";
import { JobCard } from "@/components/JobCard";
import { JobModal } from "@/components/JobModal";
import { PaginationControls } from "@/components/PaginationControls";
import { apiPaginated, getErrorMessage } from "@/lib/api";
import type { Application, Job, PaginatedResponse } from "@/lib/types";
import { useAuthStore } from "@/store/auth";

export default function AppliedJobsPage() {
  const { token } = useAuthStore();

  const [data, setData] = useState<PaginatedResponse<Application> | null>(null);
  const [resolvedKey, setResolvedKey] = useState<string | null>(null);
  const [error, setError] = useState<{ key: string; message: string } | null>(
    null,
  );
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const requestKey = token ? `${token}:${page}:${perPage}` : null;
  const loading = Boolean(token) && resolvedKey !== requestKey;
  const activeData = requestKey && resolvedKey === requestKey ? data : null;
  const activeError = requestKey && error?.key === requestKey ? error.message : null;

  useEffect(() => {
    if (!token) return;
    let alive = true;
    const key = `${token}:${page}:${perPage}`;
    apiPaginated<Application>(`applied-jobs?page=${page}&per_page=${perPage}`, {
      token,
    })
      .then((res) => {
        if (!alive) return;
        setData(res);
        setResolvedKey(key);
        setError(null);
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setData(null);
        setResolvedKey(key);
        setError({ key, message: getErrorMessage(e, "Failed to load applied jobs") });
      });

    return () => {
      alive = false;
    };
  }, [page, token]);

  const appsWithJobs = useMemo(() => {
    return (activeData?.data ?? []).filter((a): a is Application & { job: Job } =>
      Boolean(a.job),
    );
  }, [activeData]);

  const currentPage = activeData?.meta.current_page ?? page;
  const lastPage = activeData?.meta.last_page ?? currentPage;

  return (
    <Protected roles={["applicant"]}>
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Applied jobs</h1>
            {activeData && (
              <p className="mt-1 text-sm text-zinc-600">
                {activeData.meta.total} applied job{activeData.meta.total === 1 ? "" : "s"}
              </p>
            )}
          </div>
        </div>

        {loading && <p className="text-sm text-zinc-600">Loading.</p>}
        {activeError && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {activeError}
          </div>
        )}

        {!loading && !activeError && activeData && appsWithJobs.length === 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 shadow-sm sm:p-6">
            You haven&apos;t applied to any jobs yet.
          </div>
        )}

        {activeData && (
          <>
            {appsWithJobs.length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                {appsWithJobs.map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => setSelectedJobId(app.job.id)}
                    className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/30"
                  >
                    <JobCard
                      job={app.job}
                      applicationStatus={app.status}
                      showStatus={false}
                    />
                  </button>
                ))}
              </div>
            )}

            <PaginationControls
              className="pt-2"
              currentPage={currentPage}
              lastPage={lastPage}
              disabled={loading}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(lastPage, p + 1))}
            />
          </>
        )}
      </div>

      {selectedJobId !== null && (
        <JobModal
          jobId={selectedJobId}
          alreadyApplied
          onApplied={() => {}}
          onClose={() => setSelectedJobId(null)}
        />
      )}
    </Protected>
  );
}
