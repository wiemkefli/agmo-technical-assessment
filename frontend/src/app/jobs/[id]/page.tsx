"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { APIError, apiRequest, getErrorMessage } from "@/lib/api";
import type { AppliedJobStatus, Job } from "@/lib/types";
import { useAuthStore } from "@/store/auth";
import { ApplicationForm } from "@/components/ApplicationForm";
import { formatSalary } from "@/lib/salary";

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const { token, role, user } = useAuthStore();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

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

  useEffect(() => {
    if (!token || role !== "applicant") return;
    let alive = true;
    apiRequest<{ data: AppliedJobStatus[] }>("applied-jobs/ids", { token })
      .then((res) => {
        if (!alive) return;
        setAlreadyApplied(res.data.some((a) => String(a.job_id) === String(id)));
      })
      .catch(() => {
        if (!alive) return;
        setAlreadyApplied(false);
      });
    return () => {
      alive = false;
    };
  }, [id, token, role]);

  const handleApply = async ({
    message,
    resume,
    use_profile_resume,
  }: {
    message: string;
    resume?: File | null;
    use_profile_resume?: boolean;
  }) => {
    if (!token) {
      router.push("/login");
      return;
    }

    const form = new FormData();
    form.append("message", message);
    if (resume) form.append("resume", resume);
    else if (use_profile_resume) form.append("use_profile_resume", "1");

    try {
      await apiRequest(`jobs/${id}/apply`, {
        method: "POST",
        body: form,
        token,
        isFormData: true,
      });
      setAlreadyApplied(true);
    } catch (e: unknown) {
      if (
        e instanceof APIError &&
        e.status === 422 &&
        e.errors?.job?.some((m) => m.toLowerCase().includes("already applied"))
      ) {
        setAlreadyApplied(true);
        return;
      }
      throw e;
    }
  };

  if (loading) return <p className="text-sm text-zinc-600">Loading…</p>;
  if (error || !job) return <p className="text-sm text-zinc-600">Job not found.</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-sm sm:p-6">
        <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
        <p className="mt-1 text-sm text-zinc-600">
          {job.location ?? "Remote / Flexible"}
          {job.is_remote ? " - Remote" : ""}
        </p>
        {formatSalary(job) && (
          <p className="mt-1 text-sm text-zinc-700">{formatSalary(job)}</p>
        )}
        <p className="mt-4 whitespace-pre-line leading-relaxed text-zinc-800">
          {job.description}
        </p>
      </div>

      {role === "applicant" && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-sm sm:p-6">
          {alreadyApplied ? (
            <div className="rounded-md border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-800">
              You have already applied to this job.
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-zinc-900">
                Apply to this job
              </h2>
              <div className="mt-3">
                <ApplicationForm onSubmit={handleApply} savedResume={user?.resume ?? null} />
              </div>
            </>
          )}
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


