import type { Job } from "@/lib/types";
import { formatSalary } from "@/lib/salary";

export function JobCard({
  job,
  applied = false,
  showStatus = true,
  variant = "default",
}: {
  job: Job;
  applied?: boolean;
  showStatus?: boolean;
  variant?: "default" | "compact";
}) {
  const badgeClass =
    job.status === "published"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-amber-50 text-amber-700";

  const salary = formatSalary(job);
  const isCompact = variant === "compact";

  const salaryNode = salary ? (
    <p
      className={[
        "mt-1 text-zinc-700",
        isCompact ? "text-xs leading-4 min-h-[1rem]" : "text-sm leading-5 min-h-[1.25rem]",
      ].join(" ")}
    >
      {salary}
    </p>
  ) : (
    <p
      className={[
        "mt-1 select-none text-zinc-700 invisible",
        isCompact ? "text-xs leading-4 min-h-[1rem]" : "text-sm leading-5 min-h-[1.25rem]",
      ].join(" ")}
    >
      .
    </p>
  );

  return (
    <div
      className={[
        "group flex w-full flex-col overflow-hidden rounded-xl border border-zinc-200/70 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
        isCompact ? "h-[8.5rem] p-4" : "h-[16rem] p-5",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3
              className={[
                "min-h-[3rem] font-semibold leading-6 text-zinc-900 transition-colors group-hover:text-indigo-700 line-clamp-2",
                isCompact ? "text-base" : "text-lg",
              ].join(" ")}
            >
              {job.title}
            </h3>
            {applied && (
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                Applied
              </span>
            )}
          </div>
          <p className="mt-1 min-h-[1.25rem] text-sm leading-5 text-zinc-600">
            {job.location ?? "Remote / Flexible"}
            {job.is_remote ? " - Remote" : ""}
          </p>
          {salaryNode}
        </div>
        {showStatus && (
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${badgeClass}`}>
            {job.status}
          </span>
        )}
      </div>
      {!isCompact && (
        <p className="mt-3 min-h-[4.5rem] line-clamp-3 text-sm leading-relaxed text-zinc-800">
          {job.description}
        </p>
      )}
    </div>
  );
}
