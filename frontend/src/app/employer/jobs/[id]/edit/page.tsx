"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Protected } from "@/components/Protected";
import { JobForm } from "@/components/JobForm";
import { apiRequest } from "@/lib/api";
import type { Job, JobFormPayload } from "@/lib/types";
import { useAuthStore } from "@/store/auth";

export default function EmployerJobEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const { token } = useAuthStore();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    let alive = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    apiRequest<{ data: Job }>(`employer/jobs/${id}`, { token })
      .then((res) => alive && setJob(res.data))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id, token]);

  const handleUpdate = async (payload: JobFormPayload) => {
    if (!token) return;
    await apiRequest(`employer/jobs/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(payload),
    });
    router.push("/employer/jobs");
  };

  const handleDelete = async () => {
    if (!token) return;
    await apiRequest(`employer/jobs/${id}`, { method: "DELETE", token });
    router.push("/employer/jobs");
  };

  return (
    <Protected roles={["employer"]}>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Edit Job</h1>
          <button
            onClick={handleDelete}
            className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100"
          >
            Delete
          </button>
        </div>
        {loading && <p className="text-sm text-zinc-600">Loading…</p>}
        {job && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <JobForm initial={job} onSubmit={handleUpdate} submitLabel="Update" />
          </div>
        )}
      </div>
    </Protected>
  );
}
