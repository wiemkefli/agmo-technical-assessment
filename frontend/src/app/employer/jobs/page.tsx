"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Protected } from "@/components/Protected";
import { apiPaginated } from "@/lib/api";
import type { Job, PaginatedResponse } from "@/lib/types";
import { useAuthStore } from "@/store/auth";
import { JobCard } from "@/components/JobCard";
import { EmployerJobModal } from "@/components/EmployerJobModal";
import { EmployerApplicationsModal } from "@/components/EmployerApplicationsModal";

export default function EmployerJobsPage() {
  const { token } = useAuthStore();
  const [data, setData] = useState<PaginatedResponse<Job> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editJobId, setEditJobId] = useState<number | null>(null);
  const [applicationsJobId, setApplicationsJobId] = useState<number | null>(
    null,
  );

  const reloadJobs = useCallback(() => {
    if (!token) return;
    let alive = true;
    setLoading(true);
    setError(null);
    apiPaginated<Job>("employer/jobs", { token })
      .then((res) => alive && setData(res))
      .catch((e: unknown) =>
        alive && setError((e as Error)?.message ?? "Failed to load jobs"),
      )
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    const cleanup = reloadJobs();
    return cleanup;
  }, [reloadJobs]);

  const selectedApplicationsTitle = useMemo(() => {
    if (!applicationsJobId || !data) return undefined;
    return data.data.find((j) => j.id === applicationsJobId)?.title;
  }, [applicationsJobId, data]);

  return (
    <Protected roles={["employer"]}>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">My Jobs</h1>
        {loading && <p className="text-sm text-zinc-600">Loading.</p>}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {data && (
          <div className="grid grid-cols-1 gap-4">
            {data.data.map((job) => (
              <div key={job.id} className="space-y-2">
                <button
                  type="button"
                  onClick={() => setEditJobId(job.id)}
                  className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/30"
                >
                  <JobCard job={job} />
                </button>
                <div className="flex gap-2 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setEditJobId(job.id)}
                    className="inline-flex items-center rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-zinc-700 shadow-sm transition hover:bg-zinc-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setApplicationsJobId(job.id)}
                    className="inline-flex items-center rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-zinc-700 shadow-sm transition hover:bg-zinc-50"
                  >
                    Applications
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editJobId !== null && (
        <EmployerJobModal
          mode="edit"
          jobId={editJobId}
          onClose={() => setEditJobId(null)}
          onDone={reloadJobs}
        />
      )}

      {applicationsJobId !== null && (
        <EmployerApplicationsModal
          jobId={applicationsJobId}
          jobTitle={selectedApplicationsTitle}
          onClose={() => setApplicationsJobId(null)}
        />
      )}
    </Protected>
  );
}
