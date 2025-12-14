"use client";

import { useEffect, useState } from "react";
import { APIError, getErrorMessage } from "@/lib/api";
import * as jobsClient from "@/lib/clients/jobs";
import type { Job } from "@/lib/types";
import { useAuthStore } from "@/store/auth";
import { ApplicationForm } from "./ApplicationForm";
import { useLockBodyScroll } from "@/lib/useLockBodyScroll";
import { formatSalary } from "@/lib/salary";
import { useAsyncEffect } from "@/lib/hooks/useAsyncEffect";

export function JobModal({
  jobId,
  onClose,
  alreadyApplied = false,
  onApplied,
}: {
  jobId: number;
  onClose: () => void;
  alreadyApplied?: boolean;
  onApplied?: (jobId: number) => void;
}) {
  const { token, role, user } = useAuthStore();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useLockBodyScroll(true);

  useAsyncEffect(
    async ({ signal, isActive }) => {
      setLoading(true);
      setError(null);
      try {
        const res = await jobsClient.show(jobId, { signal });
        if (!isActive()) return;
        setJob(res.data);
      } catch (e: unknown) {
        if (!isActive()) return;
        setError(getErrorMessage(e, "Not found"));
      } finally {
        if (!isActive()) return;
        setLoading(false);
      }
    },
    [jobId],
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleApply = async ({
    message,
    resume,
    use_profile_resume,
  }: {
    message: string;
    resume?: File | null;
    use_profile_resume?: boolean;
  }) => {
    if (!token) {
      onClose();
      window.location.href = "/login";
      return;
    }

    try {
      await jobsClient.apply(jobId, { message, resume, use_profile_resume }, token);
      onApplied?.(jobId);
    } catch (e: unknown) {
      if (
        e instanceof APIError &&
        e.status === 422 &&
        e.errors?.job?.some((m) => m.toLowerCase().includes("already applied"))
      ) {
        onApplied?.(jobId);
        return;
      }
      throw e;
    }
  };

  const salary = job ? formatSalary(job) : null;

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
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 line-clamp-2 break-words [overflow-wrap:anywhere]">
              {job?.title ?? "Job Details"}
            </h2>
            {job?.employer && (
              <p
                className="mt-1 text-sm font-medium text-zinc-800 truncate"
                title={job.employer.company ?? job.employer.name}
              >
                {job.employer.company ?? job.employer.name}
              </p>
            )}
            {job && (
              <p className="mt-1 text-sm text-zinc-600 line-clamp-2 break-words [overflow-wrap:anywhere]">
                {job.location ?? "Remote / Flexible"}
                {job.is_remote ? " - Remote" : ""}
                {salary ? ` - ${salary}` : ""}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
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

        {loading && <p className="mt-4 text-sm text-zinc-600">Loading.</p>}
        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {job && (
          <div className="mt-4 space-y-6">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="max-h-[22rem] overflow-y-auto pr-1">
                <p className="whitespace-pre-wrap leading-relaxed text-zinc-800 break-words [overflow-wrap:anywhere]">
                  {job.description}
                </p>
              </div>
            </div>

            {role === "applicant" && (
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                {alreadyApplied ? (
                  <div className="rounded-md border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-800">
                    You have already applied to this job.
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-zinc-900">
                      Apply to this job
                    </h3>
                    <div className="mt-3">
                      <ApplicationForm
                        onSubmit={handleApply}
                        savedResume={user?.resume ?? null}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {!token && (
              <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
                Please login as an applicant to apply.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}



