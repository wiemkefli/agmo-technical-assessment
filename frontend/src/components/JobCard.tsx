import type { Job } from "@/lib/types";

export function JobCard({
  job,
  applied = false,
}: {
  job: Job;
  applied?: boolean;
}) {
  const badgeClass =
    job.status === "published"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-amber-50 text-amber-700";

  return (
    <div className="group rounded-xl border border-zinc-200/70 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-zinc-900 transition-colors group-hover:text-indigo-700">
              {job.title}
            </h3>
            {applied && (
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                Applied
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-zinc-600">
            {job.location ?? "Remote / Flexible"}
            {job.is_remote ? "  Remote" : ""}
          </p>
          {job.salary_range && (
            <p className="mt-1 text-sm text-zinc-700">{job.salary_range}</p>
          )}
        </div>
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${badgeClass}`}>
          {job.status}
        </span>
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-800">
        {job.description}
      </p>
    </div>
  );
}

