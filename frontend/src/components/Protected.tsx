"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import type { Role } from "@/lib/types";

export function Protected({
  roles,
  children,
}: {
  roles?: Role[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { token, role, loading, fetchMe } = useAuthStore();

  useEffect(() => {
    if (token && !role) {
      fetchMe();
    }
  }, [token, role, fetchMe]);

  useEffect(() => {
    if (!loading && !token) {
      router.replace("/login");
    }
  }, [loading, token, router]);

  if (!token) return null;

  if (roles && role && !roles.includes(role)) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <h1 className="text-2xl font-semibold">403 Forbidden</h1>
        <p className="mt-2 text-zinc-600">You don’t have access to this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}
