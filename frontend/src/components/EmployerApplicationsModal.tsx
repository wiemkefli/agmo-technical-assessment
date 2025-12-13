"use client";

import { useEffect, useState } from "react";
import { apiRequest, getErrorMessage } from "@/lib/api";
import type { Application } from "@/lib/types";
import { useAuthStore } from "@/store/auth";
import { ApplicantsTable } from "@/components/ApplicantsTable";
import { useLockBodyScroll } from "@/lib/useLockBodyScroll";
import { ApplicationDetailsDialog } from "@/components/ApplicationDetailsDialog";

export function EmployerApplicationsModal({
  jobId,
  jobTitle,
  onClose,
}: {
  jobId: number;
  jobTitle?: string;
  onClose: () => void;
}) {
  const { token } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Application | null>(null);

  useLockBodyScroll(true);

  useEffect(() => {
    if (!token) return;
    let alive = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setLoadError(null);
    setActionError(null);
    apiRequest<{ data: Application[] }>(`employer/jobs/${jobId}/applications`, {
      token,
    })
      .then((res) => alive && setApplications(res.data))
      .catch((e: unknown) =>
        alive && setLoadError(getErrorMessage(e, "Failed to load applications")),
      )
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [jobId, token]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const updateStatus = async (applicationId: number, nextStatus: string) => {
    if (!token) return;

    const prev = applications;
    setUpdatingId(applicationId);
    setActionError(null);
    setApplications((curr) =>
      curr.map((a) => (a.id === applicationId ? { ...a, status: nextStatus } : a)),
    );

    try {
      const res = await apiRequest<{ data: Application }>(
        `employer/applications/${applicationId}`,
        {
          method: "PATCH",
          token,
          body: JSON.stringify({ status: nextStatus }),
        },
      );
      setApplications((curr) =>
        curr.map((a) => (a.id === applicationId ? res.data : a)),
      );
      setSelected((curr) => (curr?.id === applicationId ? res.data : curr));
    } catch (e: unknown) {
      setApplications(prev);
      setActionError(getErrorMessage(e, "Failed to update status"));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        onClick={onClose}
      >
        <div
          className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 break-words [overflow-wrap:anywhere]">
                Applications
              </h2>
              {jobTitle && (
                <p
                  className="mt-1 text-sm text-zinc-600 truncate"
                  title={jobTitle}
                >
                  {jobTitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
              aria-label="Close"
            >
              x
            </button>
          </div>

          {loading && <p className="mt-4 text-sm text-zinc-600">Loading.</p>}
          {loadError && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {loadError}
            </div>
          )}
          {actionError && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {actionError}
            </div>
          )}

          {!loading && (
            <div className="mt-4">
              <ApplicantsTable
                applications={applications}
                updatingId={updatingId}
                onUpdateStatus={updateStatus}
                onSelect={setSelected}
              />
            </div>
          )}
        </div>
      </div>

      <ApplicationDetailsDialog
        open={selected !== null}
        application={selected}
        updating={selected ? updatingId === selected.id : false}
        onUpdateStatus={updateStatus}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
