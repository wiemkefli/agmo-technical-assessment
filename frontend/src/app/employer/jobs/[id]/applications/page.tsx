"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Protected } from "@/components/Protected";
import * as employerJobsClient from "@/lib/clients/employerJobs";
import type { Application } from "@/lib/types";
import { useAuthStore } from "@/store/auth";
import { ApplicantsTable } from "@/components/ApplicantsTable";
import { useAsyncEffect } from "@/lib/hooks/useAsyncEffect";

export default function EmployerJobApplicationsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { token } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useAsyncEffect(
    async ({ signal, isActive }) => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await employerJobsClient.applications(id, token, { signal });
        if (!isActive()) return;
        setApplications(res.data);
      } finally {
        if (!isActive()) return;
        setLoading(false);
      }
    },
    [id, token],
  );

  return (
    <Protected roles={["employer"]}>
      <div className="space-y-5">
        <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
        {loading && <p className="text-sm text-zinc-600">Loading…</p>}
        {!loading && <ApplicantsTable applications={applications} />}
      </div>
    </Protected>
  );
}
