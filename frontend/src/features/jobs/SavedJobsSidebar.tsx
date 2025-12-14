"use client";

import type { Job, Role } from "@/lib/types";
import { JobCard } from "@/components/JobCard";

export function SavedJobsSidebar(props: {
  token: string | null;
  role: Role | null;
  savedJobs: Job[];
  savedJobsCount: number;
  savingJobIds: Set<number>;
  appliedJobIds: Set<number>;
  applicationStatusByJobId: Map<number, string>;
  onSelectJob: (jobId: number) => void;
  onViewAll: () => void;
  onRemoveSaved: (job: Job) => void;
}) {
  return (
    <aside className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900">Saved jobs</h3>
        {props.role === "applicant" && props.token && (
          <button
            type="button"
            onClick={props.onViewAll}
            className="text-sm font-medium text-emerald-700 hover:underline underline-offset-4"
          >
            View all ({props.savedJobsCount})
          </button>
        )}
      </div>

      {!props.token && (
        <p className="text-sm text-zinc-600">Login as an applicant to save jobs.</p>
      )}

      {props.token && props.role !== "applicant" && (
        <p className="text-sm text-zinc-600">Saved jobs are available for applicants only.</p>
      )}

      {props.token && props.role === "applicant" && (
        <div className="space-y-4">
          {props.savedJobs.length === 0 ? (
            <p className="text-sm text-zinc-600">You haven&apos;t saved any jobs yet.</p>
          ) : (
            props.savedJobs.map((job) => (
              <div key={job.id} className="relative">
                <JobCard
                  job={job}
                  applied={props.appliedJobIds.has(job.id)}
                  applicationStatus={props.applicationStatusByJobId.get(job.id)}
                  showStatus={false}
                  variant="compact"
                  onClick={() => props.onSelectJob(job.id)}
                />

                <button
                  type="button"
                  aria-label="Remove saved job"
                  title="Remove"
                  disabled={props.savingJobIds.has(job.id)}
                  onClick={() => props.onRemoveSaved(job)}
                  className="absolute right-1 top-1 rounded-md p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40 disabled:opacity-50"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4"
                  >
                    <path d="M18 6 6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </aside>
  );
}

