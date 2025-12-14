"use client";

import { useEffect, useState } from "react";
import { apiRequest, getErrorMessage } from "@/lib/api";
import type { Job, JobFormPayload } from "@/lib/types";
import { useAuthStore } from "@/store/auth";
import { JobForm } from "@/components/JobForm";
import { useLockBodyScroll } from "@/lib/useLockBodyScroll";

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
  const [loadedJobId, setLoadedJobId] = useState<number | null>(null);
  const [error, setError] = useState<{ jobId: number; message: string } | null>(
    null,
  );

  useLockBodyScroll(true);

  useEffect(() => {
    if (mode !== "edit" || !jobId || !token) return;
    let alive = true;
    apiRequest<{ data: Job }>(`employer/jobs/${jobId}`, { token })
      .then((res) => {
        if (!alive) return;
        setJob(res.data);
        setLoadedJobId(jobId);
        setError(null);
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setJob(null);
        setLoadedJobId(jobId);
        setError({ jobId, message: getErrorMessage(e, "Failed to load job") });
      });
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

  const loading = mode === "edit" && !!jobId && !!token && loadedJobId !== jobId;
  const errorMessage =
    mode === "edit" && !!jobId && error?.jobId === jobId ? error.message : null;
  const jobToEdit = mode === "edit" && loadedJobId === jobId ? job : null;

  return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        onClick={onClose}
      >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 line-clamp-2">
              {mode === "create" ? "Create Job" : job?.title ?? "Edit Job"}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
              aria-label="Close"
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path strokeLinecap="round" d="M6 6l8 8M14 6l-8 8" />
              </svg>
            </button>
          </div>
        </div>

        {loading && <p className="mt-4 text-sm text-zinc-600">Loading.</p>}
        {errorMessage && (
          <div className="mt-4 max-h-40 overflow-y-auto rounded-md border border-red-200 bg-red-50 p-3 pr-1 text-sm text-red-700 break-words [overflow-wrap:anywhere]">
            {errorMessage}
          </div>
        )}

        {!loading && mode === "create" && (
          <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
            <JobForm key="new" onSubmit={handleSubmit} submitLabel="Create" />
          </div>
        )}

        {!loading && mode === "edit" && jobToEdit && (
          <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
            <JobForm
              key={jobToEdit.id}
              initial={jobToEdit}
              onSubmit={handleSubmit}
              submitLabel="Update"
            />
          </div>
        )}
      </div>
    </div>
  );
}
