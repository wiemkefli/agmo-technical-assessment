"use client";

import type { Job } from "@/lib/types";
import { JobCard } from "@/components/JobCard";
import { PaginationControls } from "@/components/PaginationControls";

export function JobsListSection(props: {
  jobs: Job[];
  isApplicant: boolean;
  hideAppliedJobs: boolean;
  onToggleHideApplied: () => void;
  appliedJobIds: Set<number>;
  applicationStatusByJobId: Map<number, string>;
  savedJobIds: Set<number>;
  savingJobIds: Set<number>;
  toggleSave: (job: Job) => void;
  onSelectJob: (jobId: number) => void;
  loading: boolean;
  currentPage: number;
  lastPage: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-zinc-900">Jobs</h2>
        {props.isApplicant && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-zinc-700">Hide applied</span>
            <button
              type="button"
              role="switch"
              aria-checked={props.hideAppliedJobs}
              onClick={props.onToggleHideApplied}
              className={[
                "relative inline-flex h-5 w-9 items-center rounded-full border shadow-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/30",
                props.hideAppliedJobs
                  ? "border-emerald-600/40 bg-emerald-600"
                  : "border-zinc-200 bg-zinc-100",
              ].join(" ")}
            >
              <span
                className={[
                  "inline-flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm transition-transform",
                  props.hideAppliedJobs ? "translate-x-[1.05rem]" : "translate-x-0.5",
                ].join(" ")}
              >
                {props.hideAppliedJobs ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-3 w-3 text-emerald-700"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-3 w-3 text-zinc-500"
                    aria-hidden="true"
                  >
                    <path d="M18 6 6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                )}
              </span>
              <span className="sr-only">
                {props.hideAppliedJobs ? "Hiding applied jobs" : "Showing applied jobs"}
              </span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {props.jobs
          .filter((job) => {
            if (!props.isApplicant) return true;
            if (!props.hideAppliedJobs) return true;
            return !props.appliedJobIds.has(job.id);
          })
          .map((job) => {
            const applied = props.isApplicant && props.appliedJobIds.has(job.id);
            const saved = props.isApplicant && props.savedJobIds.has(job.id);

            return (
              <div key={job.id} className="relative">
                <JobCard
                  job={job}
                  applied={applied}
                  applicationStatus={props.applicationStatusByJobId.get(job.id)}
                  showStatus={false}
                  onClick={() => props.onSelectJob(job.id)}
                />

                {props.isApplicant && (
                  <button
                    type="button"
                    aria-label={saved ? "Unsave job" : "Save job"}
                    title={saved ? "Saved" : "Save"}
                    disabled={props.savingJobIds.has(job.id)}
                    onClick={() => props.toggleSave(job)}
                    className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-zinc-700 shadow-sm ring-1 ring-zinc-200 transition hover:bg-white hover:text-emerald-700 disabled:opacity-50"
                  >
                    {saved ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5 text-emerald-600"
                      >
                        <path d="M6 2a2 2 0 0 0-2 2v18l8-5 8 5V4a2 2 0 0 0-2-2H6z" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-5 w-5"
                      >
                        <path d="M6 2h12a2 2 0 0 1 2 2v18l-8-5-8 5V4a2 2 0 0 1 2-2z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            );
          })}
      </div>

      <PaginationControls
        className="pt-2"
        currentPage={props.currentPage}
        lastPage={props.lastPage}
        disabled={props.loading}
        onPrev={props.onPrev}
        onNext={props.onNext}
      />
    </section>
  );
}

