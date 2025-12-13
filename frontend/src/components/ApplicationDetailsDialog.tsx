"use client";

import type { Application } from "@/lib/types";
import { useEffect } from "react";
import { useLockBodyScroll } from "@/lib/useLockBodyScroll";

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
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-6 py-4">
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
            className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
            aria-label="Close"
          >
            x
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
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

          <div>
            <div className="text-xs font-medium text-zinc-500">Message</div>
            <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-sm leading-relaxed text-zinc-800">
                {application.message}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-zinc-200 bg-white px-6 py-4">
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
