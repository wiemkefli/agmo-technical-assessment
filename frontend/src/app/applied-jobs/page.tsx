"use client";

import { useCallback, useMemo, useState } from "react";
import { Protected } from "@/components/Protected";
import { JobCard } from "@/components/JobCard";
import { JobModal } from "@/components/JobModal";
import { PaginationControls } from "@/components/PaginationControls";
import * as appliedJobsClient from "@/lib/clients/appliedJobs";
import type { Application, Job } from "@/lib/types";
import { useAuthStore } from "@/store/auth";
import { usePaginatedResource } from "@/lib/hooks/usePaginatedResource";

export default function AppliedJobsPage() {
  const { token } = useAuthStore();

  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const perPage = 10;

  const fetcher = useCallback(
    (params: { page: number; per_page: number }, ctx: { signal: AbortSignal }) => {
      if (!token) throw new Error("Not authenticated");
      return appliedJobsClient.list(params, token, { signal: ctx.signal });
    },
    [token],
  );

  const {
    data,
    loading,
    error,
    setPage,
    currentPage,
    lastPage,
    total,
  } = usePaginatedResource<Application>({
    enabled: Boolean(token),
    fetcher,
    perPage,
    deps: [perPage],
  });

  const appsWithJobs = useMemo(() => {
    return (data?.data ?? []).filter((a): a is Application & { job: Job } =>
      Boolean(a.job),
    );
  }, [data]);

  return (
    <Protected roles={["applicant"]}>
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Applied jobs</h1>
            {data && (
              <p className="mt-1 text-sm text-zinc-600">
                {total} applied job{total === 1 ? "" : "s"}
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

        {!loading && !error && data && appsWithJobs.length === 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 shadow-sm sm:p-6">
            You haven&apos;t applied to any jobs yet.
          </div>
        )}

        {data && (
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
