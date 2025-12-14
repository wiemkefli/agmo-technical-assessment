import type { Job } from "@/lib/types";
import { formatSalary } from "@/lib/salary";

export function JobCard({
  job,
  applied = false,
  applicationStatus,
  showStatus = true,
  variant = "default",
  footer,
  onClick,
}: {
  job: Job;
  applied?: boolean;
  applicationStatus?: string;
  showStatus?: boolean;
  variant?: "default" | "compact" | "saved";
  footer?: React.ReactNode;
  onClick?: () => void;
}) {
  const badgeClass =
    job.status === "published"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-amber-50 text-amber-700";

  const salary = formatSalary(job);
  const isCompact = variant === "compact";
  const isSaved = variant === "saved";

  const applicationBadge = (() => {
    const status = applicationStatus?.trim().toLowerCase() || null;
    if (!status && !applied) return null;

    const label = status
      ? status.charAt(0).toUpperCase() + status.slice(1)
      : "Applied";

    const cls =
      status === "submitted"
        ? "bg-indigo-50 text-indigo-700"
        : status === "reviewed"
          ? "bg-amber-50 text-amber-700"
          : status === "shortlisted"
            ? "bg-emerald-50 text-emerald-700"
            : status === "rejected"
              ? "bg-rose-50 text-rose-700"
              : status
                ? "bg-zinc-100 text-zinc-700"
                : "bg-indigo-50 text-indigo-700";

    return (
      <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
        {label}
      </span>
    );
  })();

  const company = job.employer?.company ?? null;
  const metaLine = (() => {
    const location = job.location ?? null;
    const remote = job.is_remote ? "Remote" : null;
    const parts = [company, location, remote].filter((p): p is string => Boolean(p));
    return parts.join(" - ");
  })();

  const salaryNode = salary ? (
    <p
      className={[
        "mt-1 text-zinc-700 truncate",
        isCompact ? "text-xs leading-4 min-h-[1rem]" : "text-sm leading-5 min-h-[1.25rem]",
      ].join(" ")}
    >
      {salary}
    </p>
  ) : (
    <p
      className={[
        "mt-1 select-none text-zinc-700 invisible truncate",
        isCompact ? "text-xs leading-4 min-h-[1rem]" : "text-sm leading-5 min-h-[1.25rem]",
      ].join(" ")}
    >
      .
    </p>
  );

  const interactive = Boolean(onClick);

  const rootPadding = isCompact ? "p-4" : "p-5";
  const heightClass = isCompact
    ? "h-auto sm:h-[9rem]"
    : isSaved
      ? "h-auto sm:h-[16rem]"
      : footer
        ? "h-auto sm:h-[15rem]"
        : "h-auto sm:h-[14rem]";

  return (
    <div
      className={[
        "group flex w-full flex-col overflow-hidden rounded-xl border border-zinc-200/70 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
        heightClass,
        rootPadding,
        interactive
          ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/30"
          : "",
      ].join(" ")}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onClick : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-start gap-2">
            <h3
              className={[
                "font-semibold leading-6 text-zinc-900 transition-colors group-hover:text-indigo-700 line-clamp-2",
                isCompact ? "text-base" : "text-lg",
              ].join(" ")}
            >
              {job.title}
            </h3>
            {applicationBadge}
          </div>

          {isCompact ? (
            <p className="mt-0.5 min-h-[1.25rem] text-sm leading-5 text-zinc-600 truncate">
              {metaLine || "-"}
            </p>
          ) : (
            <>
              <p className="mt-0.5 min-h-[1.25rem] text-sm leading-5 text-zinc-600">
                {company ?? "Unknown company"}
              </p>
              <p className="mt-0.5 min-h-[1.25rem] text-sm leading-5 text-zinc-600">
                {job.location ?? "Remote / Flexible"}
                {job.is_remote ? " - Remote" : ""}
              </p>
            </>
          )}

          {salaryNode}
        </div>

        {showStatus && (
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${badgeClass}`}>
            {job.status}
          </span>
        )}
      </div>

      {!isCompact && (
        <p
          className={[
            "mt-3 text-sm leading-relaxed text-zinc-800",
            isSaved ? "min-h-[3rem] line-clamp-2" : footer ? "min-h-[3rem] line-clamp-2" : "min-h-[4.5rem] line-clamp-3",
          ].join(" ")}
        >
          {job.description}
        </p>
      )}

      {footer && (
        <div className="-mx-5 -mb-5 mt-auto border-t border-zinc-200/70 bg-zinc-50/70 px-5 py-3">
          {footer}
        </div>
      )}
    </div>
  );
}
