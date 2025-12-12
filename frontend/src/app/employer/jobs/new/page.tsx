"use client";

import { useRouter } from "next/navigation";
import { Protected } from "@/components/Protected";
import { JobForm } from "@/components/JobForm";
import { apiRequest } from "@/lib/api";
import type { JobFormPayload } from "@/lib/types";
import { useAuthStore } from "@/store/auth";

export default function EmployerJobNewPage() {
  const router = useRouter();
  const { token } = useAuthStore();

  const handleCreate = async (payload: JobFormPayload) => {
    if (!token) throw new Error("You are not logged in.");
    await apiRequest("employer/jobs", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
    router.push("/employer/jobs");
  };

  return (
    <Protected roles={["employer"]}>
      <div className="space-y-5">
        <h1 className="text-3xl font-bold tracking-tight">Create Job</h1>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <JobForm onSubmit={handleCreate} submitLabel="Create" />
        </div>
      </div>
    </Protected>
  );
}
