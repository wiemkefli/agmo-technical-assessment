import type { Application } from "@/lib/types";

const STATUSES: Array<{ value: string; label: string }> = [
  { value: "submitted", label: "Submitted" },
  { value: "reviewed", label: "Reviewed" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "rejected", label: "Rejected" },
];

export function ApplicantsTable({
  applications,
  onUpdateStatus,
  updatingId,
}: {
  applications: Application[];
  onUpdateStatus?: (applicationId: number, status: string) => void;
  updatingId?: number | null;
}) {
  if (!applications.length) {
    return <p className="text-sm text-zinc-600">No applications yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-zinc-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
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
            <tr key={app.id} className="border-t">
              <td className="px-4 py-2">{app.applicant?.name ?? app.applicant_id}</td>
              <td className="px-4 py-2">{app.applicant?.email ?? "-"}</td>
              <td className="px-4 py-2">
                {onUpdateStatus ? (
                  <select
                    className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                    value={app.status}
                    disabled={updatingId === app.id}
                    onChange={(e) => onUpdateStatus(app.id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="capitalize">{app.status}</span>
                )}
              </td>
              <td className="px-4 py-2">{app.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
