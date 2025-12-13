"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Protected } from "@/components/Protected";
import { useAuthStore } from "@/store/auth";

export default function DashboardPage() {
  const router = useRouter();
  const { role, hydrated } = useAuthStore();

  useEffect(() => {
    if (!hydrated) return;
    router.replace(role === "employer" ? "/employer/jobs" : "/jobs");
  }, [hydrated, role, router]);

  return (
    <Protected>
      <div className="text-sm text-zinc-600">Redirecting.</div>
    </Protected>
  );
}
