"use client";

import { useRef, useState } from "react";
import type { Job } from "@/lib/types";
import * as appliedJobsClient from "@/lib/clients/appliedJobs";
import * as savedJobsClient from "@/lib/clients/savedJobs";
import { useAsyncEffect } from "@/lib/hooks/useAsyncEffect";

export function useApplicantJobState(params: { token: string | null; role: string | null }) {
  const isApplicant = params.role === "applicant" && Boolean(params.token);

  const [appliedJobIds, setAppliedJobIds] = useState<Set<number>>(new Set());
  const [applicationStatusByJobId, setApplicationStatusByJobId] = useState<Map<number, string>>(
    () => new Map(),
  );
  const [savedJobIds, setSavedJobIds] = useState<Set<number>>(new Set());
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);

  const savingJobIdsRef = useRef<Set<number>>(new Set());
  const [savingJobIds, setSavingJobIds] = useState<Set<number>>(new Set());

  const markApplied = (jobId: number) => {
    setAppliedJobIds((prev) => {
      const next = new Set(prev);
      next.add(jobId);
      return next;
    });
    setApplicationStatusByJobId((prev) => {
      const next = new Map(prev);
      next.set(jobId, next.get(jobId) ?? "submitted");
      return next;
    });
  };

  const refreshSaved = async (token: string) => {
    const [preview, ids] = await Promise.all([
      savedJobsClient.listPreview({ per_page: 5 }, token),
      savedJobsClient.ids(token),
    ]);
    setSavedJobs(preview.data);
    setSavedJobIds(new Set(ids.data));
  };

  useAsyncEffect(
    async ({ signal, isActive }) => {
      if (!isApplicant || !params.token) return;

      try {
        const res = await appliedJobsClient.ids(params.token, { signal });
        if (!isActive()) return;
        setAppliedJobIds(new Set(res.data.map((a) => a.job_id)));
        setApplicationStatusByJobId(new Map(res.data.map((a) => [a.job_id, a.status])));
      } catch {
        if (!isActive()) return;
        setAppliedJobIds(new Set());
        setApplicationStatusByJobId(new Map());
      }
    },
    [params.token, params.role],
  );

  useAsyncEffect(
    async ({ signal, isActive }) => {
      if (!isApplicant || !params.token) return;

      try {
        const [preview, ids] = await Promise.all([
          savedJobsClient.listPreview({ per_page: 5 }, params.token, { signal }),
          savedJobsClient.ids(params.token, { signal }),
        ]);
        if (!isActive()) return;
        setSavedJobs(preview.data);
        setSavedJobIds(new Set(ids.data));
      } catch {
        if (!isActive()) return;
        setSavedJobs([]);
        setSavedJobIds(new Set());
      }
    },
    [params.token, params.role],
  );

  const toggleSave = async (job: Job) => {
    if (!params.token || params.role !== "applicant") return;
    if (savingJobIdsRef.current.has(job.id)) return;

    const token = params.token;
    const isSaved = savedJobIds.has(job.id);
    savingJobIdsRef.current.add(job.id);
    setSavingJobIds(new Set(savingJobIdsRef.current));

    try {
      if (isSaved) {
        await savedJobsClient.unsave(job.id, token);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(job.id);
          return next;
        });
        setSavedJobs((prev) => prev.filter((j) => j.id !== job.id));
      } else {
        await savedJobsClient.save(job.id, token);
        setSavedJobIds((prev) => new Set(prev).add(job.id));
        setSavedJobs((prev) => [job, ...prev.filter((j) => j.id !== job.id)].slice(0, 5));
      }

      await refreshSaved(token);
    } finally {
      savingJobIdsRef.current.delete(job.id);
      setSavingJobIds(new Set(savingJobIdsRef.current));
    }
  };

  return {
    isApplicant,
    appliedJobIds,
    applicationStatusByJobId,
    savedJobIds,
    savedJobs,
    savingJobIds,
    toggleSave,
    markApplied,
  };
}
