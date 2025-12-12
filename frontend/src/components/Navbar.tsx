"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export function Navbar() {
  const router = useRouter();
  const { user, role, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/jobs" className="text-lg font-bold tracking-tight text-zinc-900">
          Mini <span className="text-indigo-600">Job Board</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm font-medium text-zinc-700">
          <Link
            href="/jobs"
            className="rounded-md px-2 py-1 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            Jobs
          </Link>
          {role === "employer" && (
            <Link
              href="/employer/jobs"
              className="rounded-md px-2 py-1 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              Employer
            </Link>
          )}
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-md px-2 py-1 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="ml-1 rounded-full bg-zinc-900 px-3 py-1.5 text-white shadow-sm transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-2 py-1 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="ml-1 rounded-full bg-indigo-600 px-3 py-1.5 text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/30"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
