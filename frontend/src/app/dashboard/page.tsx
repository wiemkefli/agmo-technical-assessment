"use client";

import Link from "next/link";
import { Protected } from "@/components/Protected";
import { useAuthStore } from "@/store/auth";

export default function DashboardPage() {
  const { user, role } = useAuthStore();

  return (
    <Protected>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-zinc-700">
          Welcome back, <span className="font-medium">{user?.name}</span>.
        </p>
        {role === "employer" ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">Employer tools</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Manage your job listings and view applicants.
            </p>
            <Link
              href="/employer/jobs"
              className="mt-3 inline-block rounded-md bg-indigo-600 px-3 py-2 text-sm text-white shadow-sm transition hover:bg-indigo-500"
            >
              Go to Employer Jobs
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">Applicant tools</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Browse published jobs and submit applications.
            </p>
            <Link
              href="/jobs"
              className="mt-3 inline-block rounded-md bg-indigo-600 px-3 py-2 text-sm text-white shadow-sm transition hover:bg-indigo-500"
            >
              Browse Jobs
            </Link>
          </div>
        )}
      </div>
    </Protected>
  );
}
