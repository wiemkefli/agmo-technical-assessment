"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Protected } from "@/components/Protected";
import { apiPaginated, apiRequest, getErrorMessage } from "@/lib/api";
import type { Job, PaginatedResponse } from "@/lib/types";
import { useAuthStore } from "@/store/auth";
import { JobCard } from "@/components/JobCard";
import { EmployerJobModal } from "@/components/EmployerJobModal";
import { EmployerApplicationsModal } from "@/components/EmployerApplicationsModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function EmployerJobsPage() {
  const { token } = useAuthStore();
  const [data, setData] = useState<PaginatedResponse<Job> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editJobId, setEditJobId] = useState<number | null>(null);
  const [applicationsJobId, setApplicationsJobId] = useState<number | null>(
    null,
  );
  const [deleteJobId, setDeleteJobId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const selectedDeleteTitle = useMemo(() => {
    if (!deleteJobId || !data) return undefined;
    return data.data.find((j) => j.id === deleteJobId)?.title;
  }, [deleteJobId, data]);

  const confirmDelete = useCallback(async () => {
    if (!token || deleteJobId === null) return;
    setDeleting(true);
    setError(null);
    try {
      await apiRequest(`employer/jobs/${deleteJobId}`, {
        method: "DELETE",
        token,
      });
      setDeleteJobId(null);
      reloadJobs();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Failed to delete job"));
    } finally {
      setDeleting(false);
    }
  }, [token, deleteJobId, reloadJobs]);

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
              <JobCard
                key={job.id}
                job={job}
                onClick={() => setEditJobId(job.id)}
                footer={
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditJobId(job.id);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm ring-1 ring-zinc-200 transition hover:bg-zinc-50"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-4 w-4"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setApplicationsJobId(job.id);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm ring-1 ring-indigo-200 transition hover:bg-indigo-100"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-4 w-4"
                      >
                        <path d="M16 11a4 4 0 1 0-8 0" />
                        <path d="M12 12a5 5 0 0 0-9 3" />
                        <path d="M21 15a5 5 0 0 0-6-3" />
                      </svg>
                      Applications
                    </button>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteJobId(job.id);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-sm ring-1 ring-rose-200 transition hover:bg-rose-100 disabled:opacity-50"
                      disabled={deleting}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-4 w-4"
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M7 6l1 14h8l1-14" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                      Delete
                    </button>
                  </div>
                }
              />
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

      <ConfirmDialog
        open={deleteJobId !== null}
        title="Delete job?"
        description={
          selectedDeleteTitle
            ? `This will permanently delete “${selectedDeleteTitle}”.`
            : "This will permanently delete this job."
        }
        confirmLabel="Delete"
        confirming={deleting}
        onCancel={() => {
          if (deleting) return;
          setDeleteJobId(null);
        }}
        onConfirm={confirmDelete}
      />
    </Protected>
  );
}
