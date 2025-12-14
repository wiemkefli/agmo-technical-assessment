import type { Application } from "@/lib/types";
import { APPLICATION_STATUSES } from "@/lib/applicationStatus";

export function ApplicantsTable({
  applications,
  onSelect,
  onUpdateStatus,
  updatingId,
}: {
  applications: Application[];
  onSelect?: (application: Application) => void;
  onUpdateStatus?: (applicationId: number, status: string) => void;
  updatingId?: number | null;
}) {
  if (!applications.length) {
    return <p className="text-sm text-zinc-600">No applications yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-zinc-200 bg-white shadow-sm">
      <table className="w-full table-fixed text-left text-sm">
        <colgroup>
          <col className="w-48" />
          <col className="w-56" />
          <col className="w-40" />
          <col />
        </colgroup>
        <thead className="bg-zinc-50 text-zinc-700">
          <tr>
            <th className="px-4 py-2 font-medium">Applicant</th>
            <th className="px-4 py-2 font-medium">Email</th>
            <th className="px-4 py-2 font-medium">Status</th>
            <th className="px-4 py-2 font-medium">Message</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr
              key={app.id}
              className={[
                "border-t",
                onSelect ? "cursor-pointer transition hover:bg-zinc-50" : "",
              ].join(" ")}
              onClick={onSelect ? () => onSelect(app) : undefined}
            >
              <td className="px-4 py-2 truncate">
                {app.applicant?.name ?? app.applicant_id}
              </td>
              <td className="px-4 py-2 truncate">
                {app.applicant?.email ?? "-"}
              </td>
              <td className="px-4 py-2">
                {onUpdateStatus ? (
                  <select
                    className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                    value={app.status}
                    disabled={updatingId === app.id}
                    onChange={(e) => onUpdateStatus(app.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {APPLICATION_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="capitalize">{app.status}</span>
                )}
              </td>
              <td className="px-4 py-2 align-top">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="min-w-0 flex-1 whitespace-pre-wrap break-words [overflow-wrap:anywhere] line-clamp-2"
                    title={app.message}
                  >
                    {app.message}
                  </div>
                  {onSelect && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(app);
                      }}
                      className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
                    >
                      View
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.21 14.77a.75.75 0 0 1 .02-1.06L10.94 10 7.23 6.29a.75.75 0 1 1 1.06-1.06l4.24 4.24a.75.75 0 0 1 0 1.06l-4.24 4.24a.75.75 0 0 1-1.08.02Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
