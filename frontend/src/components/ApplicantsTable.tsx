import type { Application } from "@/lib/types";

export function ApplicantsTable({ applications }: { applications: Application[] }) {
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
              <td className="px-4 py-2">{app.status}</td>
              <td className="px-4 py-2">{app.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
