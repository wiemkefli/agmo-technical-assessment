"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      const currentRole = useAuthStore.getState().role;
      router.push(currentRole === "employer" ? "/employer/jobs" : "/jobs");
    } catch {
      // store error already set
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center">
      <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-zinc-200 bg-white/75 shadow-sm backdrop-blur">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="relative overflow-hidden p-8 lg:p-10">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900 text-base font-semibold text-white shadow-sm">
                  M
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-900">
                    Mini <span className="text-indigo-600">Job Board</span>
                  </div>
                  <div className="text-xs text-zinc-600">Simple, fast, and role-based.</div>
                </div>
              </div>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-900">
                Welcome back
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-zinc-700">
                Login to manage job posts as an employer or apply to jobs as an applicant.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-4">
                  <div className="text-sm font-semibold text-zinc-900">Employers</div>
                  <div className="mt-1 text-xs text-zinc-600">
                    Post jobs, track applicants, and keep listings updated.
                  </div>
                </div>
                <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-4">
                  <div className="text-sm font-semibold text-zinc-900">Applicants</div>
                  <div className="mt-1 text-xs text-zinc-600">
                    Search jobs, save favourites, and apply in minutes.
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="border-t border-zinc-200 bg-white p-8 lg:border-l lg:border-t-0 lg:p-10">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Login</h2>
              <p className="mt-1 text-sm text-zinc-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline underline-offset-4"
                >
                  Register
                </Link>
              </p>
            </div>

            {error && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-800">Email</label>
                <input
                  type="email"
                  className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-800">Password</label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                disabled={loading}
                className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/30 disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
