"use client";

import type { Application } from "@/lib/types";
import { useEffect, useState } from "react";
import { useLockBodyScroll } from "@/lib/useLockBodyScroll";
import { useAuthStore } from "@/store/auth";
import { getErrorMessage } from "@/lib/api";

const STATUSES: Array<{ value: string; label: string }> = [
  { value: "submitted", label: "Submitted" },
  { value: "reviewed", label: "Reviewed" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "rejected", label: "Rejected" },
];

export function ApplicationDetailsDialog({
  open,
  application,
  onClose,
  onUpdateStatus,
  updating,
}: {
  open: boolean;
  application: Application | null;
  onClose: () => void;
  onUpdateStatus?: (applicationId: number, status: string) => void;
  updating?: boolean;
}) {
  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !application) return null;

  const applicantName = application.applicant?.name ?? `Applicant #${application.applicant_id}`;
  const applicantEmail = application.applicant?.email ?? "-";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-zinc-900 truncate" title={applicantName}>
              {applicantName}
            </h3>
            <p className="mt-1 text-sm text-zinc-600 break-words [overflow-wrap:anywhere]">
              {applicantEmail}
            </p>
          </div>
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

        <div className="space-y-4 px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="text-xs font-medium text-zinc-500">Status</div>
              {onUpdateStatus ? (
                <select
                  className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                  value={application.status}
                  disabled={updating}
                  onChange={(e) => onUpdateStatus(application.id, e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="mt-1 inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 capitalize">
                  {application.status}
                </div>
              )}
            </div>
            <div>
              <div className="text-xs font-medium text-zinc-500">Applied at</div>
              <div className="mt-1 text-sm text-zinc-800 break-words [overflow-wrap:anywhere]">
                {new Date(application.created_at).toLocaleString()}
              </div>
            </div>
          </div>

          <ResumeSection application={application} />

          <div>
            <div className="text-xs font-medium text-zinc-500">Message</div>
            <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="max-h-[22rem] overflow-y-auto pr-1">
                <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-sm leading-relaxed text-zinc-800">
                  {application.message}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-zinc-200 bg-white px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ResumeSection({ application }: { application: Application }) {
  const { token, role } = useAuthStore();
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (role !== "employer") return null;

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const hasResume = Boolean(application.has_resume);

  const canDownloadOrView =
    Boolean(token) && Boolean(apiBaseUrl) && hasResume && !downloading;

  const fetchResumeBlob = async (): Promise<Blob> => {
    if (!token || !apiBaseUrl) {
      throw new Error("Missing auth token or API base URL");
    }

    const res = await fetch(
      `${apiBaseUrl}/employer/applications/${application.id}/resume`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!res.ok) {
      throw new Error(`Download failed (${res.status})`);
    }

    return res.blob();
  };

  const download = async () => {
    if (!token || !apiBaseUrl) return;
    setDownloading(true);
    setError(null);

    try {
      const blob = await fetchResumeBlob();
      const url = URL.createObjectURL(blob);
      const filename =
        application.resume_original_name ?? `resume-${application.id}`;

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Failed to download resume"));
    } finally {
      setDownloading(false);
    }
  };

  const view = async () => {
    if (!token || !apiBaseUrl) return;
    setDownloading(true);
    setError(null);

    try {
      const blob = await fetchResumeBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Failed to view resume"));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <div className="text-xs font-medium text-zinc-500">Resume</div>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        {hasResume ? (
          <>
            <div className="text-sm text-zinc-800 break-words [overflow-wrap:anywhere]">
              {application.resume_original_name ?? "Resume attached"}
            </div>
            <button
              type="button"
              onClick={view}
              disabled={!canDownloadOrView}
              className="inline-flex items-center rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50"
            >
              {downloading ? "Loading..." : "View"}
            </button>
            <button
              type="button"
              onClick={download}
              disabled={!canDownloadOrView}
              className="inline-flex items-center rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50"
            >
              {downloading ? "Downloading..." : "Download"}
            </button>
          </>
        ) : (
          <div className="text-sm text-zinc-600">No resume uploaded.</div>
        )}
      </div>
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      {!apiBaseUrl && (
        <div className="mt-2 text-xs text-zinc-500">
          Set `NEXT_PUBLIC_API_BASE_URL` to enable downloads.
        </div>
      )}
    </div>
  );
}
