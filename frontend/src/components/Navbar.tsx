"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const homeHref =
    user && role === "employer" ? "/employer/jobs" : "/jobs";

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const onMouseDown = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (menuRef.current.contains(e.target as Node)) return;
      setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [menuOpen]);

  const avatarLetter = useMemo(() => {
    const base = user?.name?.trim() || user?.email?.trim() || "?";
    return base.slice(0, 1).toUpperCase();
  }, [user?.email, user?.name]);

  const navLinkClass = (href: string) => {
    const isPrefixMatch = pathname === href || pathname.startsWith(`${href}/`);
    const isActive =
      href === "/employer/jobs"
        ? isPrefixMatch && !pathname.startsWith("/employer/jobs/new")
        : isPrefixMatch;
    return [
      "px-2 py-1 text-sm font-medium transition-colors",
      isActive ? "text-zinc-900" : "text-zinc-600 hover:text-zinc-900",
    ].join(" ");
  };

  const underlineClass = (href: string) => {
    const isPrefixMatch = pathname === href || pathname.startsWith(`${href}/`);
    const isActive =
      href === "/employer/jobs"
        ? isPrefixMatch && !pathname.startsWith("/employer/jobs/new")
        : isPrefixMatch;
    return isActive ? "absolute inset-x-1 -bottom-2 h-0.5 rounded-full bg-zinc-900" : "";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href={homeHref}
            className="flex items-center gap-2 font-bold tracking-tight text-zinc-900"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
              M
            </span>
            <span className="text-lg">
              Mini <span className="text-indigo-600">Job Board</span>
            </span>
          </Link>
        </div>

        <nav className="hidden flex-1 items-center justify-center gap-5 md:flex">
          {(!user || role === "applicant") && (
            <div className="relative">
              <Link href="/jobs" className={navLinkClass("/jobs")}>
                Job search
              </Link>
              <div className={underlineClass("/jobs")} />
            </div>
          )}

          {user && role === "applicant" && (
            <>
              <div className="relative">
                <Link href="/saved-jobs" className={navLinkClass("/saved-jobs")}>
                  Saved jobs
                </Link>
                <div className={underlineClass("/saved-jobs")} />
              </div>
              <div className="relative">
                <Link href="/applications" className={navLinkClass("/applications")}>
                  Job applications
                </Link>
                <div className={underlineClass("/applications")} />
              </div>
            </>
          )}

          {user && role === "employer" && (
            <>
              <div className="relative">
                <Link href="/employer/jobs" className={navLinkClass("/employer/jobs")}>
                  My jobs
                </Link>
                <div className={underlineClass("/employer/jobs")} />
              </div>
              <div className="relative">
                <Link href="/employer/jobs/new" className={navLinkClass("/employer/jobs/new")}>
                  Post a job
                </Link>
                <div className={underlineClass("/employer/jobs/new")} />
              </div>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {!user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-md px-2 py-1 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/30"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full bg-white px-2 py-1.5 text-sm font-medium text-zinc-700 ring-1 ring-zinc-200 transition hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/30"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                  {avatarLetter}
                </span>
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`h-4 w-4 transition ${menuOpen ? "rotate-180" : ""}`}
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
                  <div className="px-3 py-2">
                    <div className="text-sm font-semibold text-zinc-900 line-clamp-1">
                      {user.name}
                    </div>
                    <div className="text-xs text-zinc-600 line-clamp-1">{user.email}</div>
                  </div>
                  <div className="h-px bg-zinc-100" />
                  <div className="py-1 text-sm">
                    {role === "applicant" && (
                      <>
                        <Link
                          href="/saved-jobs"
                          onClick={() => setMenuOpen(false)}
                          className="block px-3 py-2 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                        >
                          Saved jobs
                        </Link>
                        <Link
                          href="/applications"
                          onClick={() => setMenuOpen(false)}
                          className="block px-3 py-2 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                        >
                          Job applications
                        </Link>
                      </>
                    )}
                    {role === "employer" && (
                      <>
                        <Link
                          href="/employer/jobs"
                          onClick={() => setMenuOpen(false)}
                          className="block px-3 py-2 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                        >
                          My jobs
                        </Link>
                        <Link
                          href="/employer/jobs/new"
                          onClick={() => setMenuOpen(false)}
                          className="block px-3 py-2 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                        >
                          Post a job
                        </Link>
                      </>
                    )}
                  </div>
                  <div className="h-px bg-zinc-100" />
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    className="block w-full px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
