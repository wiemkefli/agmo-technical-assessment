"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Protected } from "@/components/Protected";
import { JobCard } from "@/components/JobCard";
import { JobModal } from "@/components/JobModal";
import { apiRequest, getErrorMessage } from "@/lib/api";
import type { Application, Job } from "@/lib/types";
import { useAuthStore } from "@/store/auth";

export default function ApplicationsPage() {
  const { token } = useAuthStore();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const reload = useCallback(() => {
    if (!token) return;
    let alive = true;
    setLoading(true);
    setError(null);

    apiRequest<{ data: Application[] }>("applications", { token })
      .then((res) => alive && setApplications(res.data))
      .catch((e: unknown) =>
        alive && setError(getErrorMessage(e, "Failed to load applications")),
      )
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    const cleanup = reload();
    return cleanup;
  }, [reload]);

  const appsWithJobs = useMemo(() => {
    return applications.filter((a): a is Application & { job: Job } => Boolean(a.job));
  }, [applications]);

  return (
    <Protected roles={["applicant"]}>
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Job applications</h1>
            <p className="mt-1 text-sm text-zinc-600">
              {applications.length} application{applications.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {loading && <p className="text-sm text-zinc-600">Loading.</p>}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && appsWithJobs.length === 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-sm">
            You haven&apos;t applied to any jobs yet.
          </div>
        )}

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
