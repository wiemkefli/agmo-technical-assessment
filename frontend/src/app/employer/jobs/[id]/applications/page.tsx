"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Protected } from "@/components/Protected";
import * as employerJobsClient from "@/lib/clients/employerJobs";
import type { Application } from "@/lib/types";
import { useAuthStore } from "@/store/auth";
import { ApplicantsTable } from "@/components/ApplicantsTable";

export default function EmployerJobApplicationsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { token } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    let alive = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    employerJobsClient
      .applications(id, token)
      .then((res) => alive && setApplications(res.data))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id, token]);

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
