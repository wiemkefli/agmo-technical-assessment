"use client";

import { useState } from "react";
import type { Job, PaginatedResponse } from "@/lib/types";
import type { JobListParams } from "@/lib/clients/jobs";
import * as jobsClient from "@/lib/clients/jobs";
import { getErrorMessage } from "@/lib/api";
import { useAsyncEffect } from "@/lib/hooks/useAsyncEffect";

export function useJobsListing(params: {
  listParams: JobListParams;
  token?: string | null;
}) {
  const [data, setData] = useState<PaginatedResponse<Job> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useAsyncEffect(
    async ({ signal, isActive }) => {
      setLoading(true);
      setError(null);
      try {
        const res = await jobsClient.list(params.listParams, { token: params.token, signal });
        if (!isActive()) return;
        setData(res);
      } catch (e: unknown) {
        if (!isActive()) return;
        setError(getErrorMessage(e, "Failed to load jobs"));
      } finally {
        if (!isActive()) return;
        setLoading(false);
      }
    },
    [params.token, JSON.stringify(params.listParams)],
  );

  return { data, loading, error };
}

