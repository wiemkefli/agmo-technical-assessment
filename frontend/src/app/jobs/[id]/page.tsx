"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest, getErrorMessage } from "@/lib/api";
import type { Job } from "@/lib/types";
import { useAuthStore } from "@/store/auth";
import { ApplicationForm } from "@/components/ApplicationForm";

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const { token, role } = useAuthStore();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    apiRequest<{ data: Job }>(`jobs/${id}`)
      .then((res) => alive && setJob(res.data))
      .catch((e: unknown) => alive && setError(getErrorMessage(e, "Not found")))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  const handleApply = async ({
    message,
    resume,
  }: {
    message: string;
    resume?: File | null;
  }) => {
    if (!token) {
      router.push("/login");
      return;
    }

    const form = new FormData();
    form.append("message", message);
    if (resume) form.append("resume", resume);

    await apiRequest(`jobs/${id}/apply`, {
      method: "POST",
      body: form,
      token,
      isFormData: true,
    });
  };

  if (loading) return <p className="text-sm text-zinc-600">Loading…</p>;
  if (error || !job) return <p className="text-sm text-zinc-600">Job not found.</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
        <p className="mt-1 text-sm text-zinc-600">
          {job.location ?? "Remote / Flexible"}
          {job.is_remote ? " • Remote" : ""}
        </p>
        {job.salary_range && (
          <p className="mt-1 text-sm text-zinc-700">{job.salary_range}</p>
        )}
        <p className="mt-4 whitespace-pre-line leading-relaxed text-zinc-800">
          {job.description}
        </p>
      </div>

      {role === "applicant" && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">Apply to this job</h2>
          <div className="mt-3">
            <ApplicationForm onSubmit={handleApply} />
          </div>
        </div>
      )}

      {!token && (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-700 shadow-sm">
          <p>
            Please{" "}
            <button className="underline" onClick={() => router.push("/login")}>
              login
            </button>{" "}
            as an applicant to apply.
          </p>
        </div>
      )}
    </div>
  );
}

