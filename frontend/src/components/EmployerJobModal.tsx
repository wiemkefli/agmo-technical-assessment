"use client";

import { useEffect, useState } from "react";
import { apiRequest, getErrorMessage } from "@/lib/api";
import type { Job, JobFormPayload } from "@/lib/types";
import { useAuthStore } from "@/store/auth";
import { JobForm } from "@/components/JobForm";
import { useLockBodyScroll } from "@/lib/useLockBodyScroll";
import { formatSalary } from "@/lib/salary";

export function EmployerJobModal({
  mode,
  jobId,
  onClose,
  onDone,
}: {
  mode: "create" | "edit";
  jobId?: number;
  onClose: () => void;
  onDone: () => void;
}) {
  const { token } = useAuthStore();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(mode === "edit");
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useLockBodyScroll(true);

  useEffect(() => {
    if (mode !== "edit" || !jobId || !token) return;
    let alive = true;
    setLoading(true);
    setError(null);
    apiRequest<{ data: Job }>(`employer/jobs/${jobId}`, { token })
      .then((res) => alive && setJob(res.data))
      .catch((e: unknown) =>
        alive && setError(getErrorMessage(e, "Failed to load job")),
      )
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [mode, jobId, token]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = async (payload: JobFormPayload) => {
    if (!token) throw new Error("Not authenticated");

    if (mode === "create") {
      await apiRequest("employer/jobs", {
        method: "POST",
        token,
        body: JSON.stringify(payload),
      });
    } else if (jobId) {
      await apiRequest(`employer/jobs/${jobId}`, {
        method: "PATCH",
        token,
        body: JSON.stringify(payload),
      });
    }

    onDone();
    onClose();
  };

  const handleDelete = async () => {
    if (!token || !jobId) return;
    setDeleting(true);
    setError(null);
    try {
      await apiRequest(`employer/jobs/${jobId}`, { method: "DELETE", token });
      onDone();
      onClose();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Failed to delete job"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 line-clamp-2">
              {mode === "create" ? "Create Job" : job?.title ?? "Edit Job"}
            </h2>
            {mode === "edit" && job && (
              <p className="mt-1 text-sm text-zinc-600 break-words [overflow-wrap:anywhere]">
                {job.location ?? "Remote / Flexible"}
                {job.is_remote ? "  Remote" : ""}
                {formatSalary(job) ? `  ${formatSalary(job)}` : ""}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {mode === "edit" && (
              <button
                onClick={handleDelete}
                disabled={deleting || loading}
                className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
              aria-label="Close"
            >
              x
            </button>
          </div>
        </div>

        {loading && <p className="mt-4 text-sm text-zinc-600">Loading.</p>}
        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && mode === "create" && (
          <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
            <JobForm key="new" onSubmit={handleSubmit} submitLabel="Create" />
          </div>
        )}

        {!loading && mode === "edit" && job && (
          <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
            <JobForm
              key={job.id}
              initial={job}
              onSubmit={handleSubmit}
              submitLabel="Update"
            />
          </div>
        )}
      </div>
    </div>
  );
}
