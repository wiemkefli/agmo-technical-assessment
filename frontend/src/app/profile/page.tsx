"use client";

import { useEffect, useState } from "react";
import { Protected } from "@/components/Protected";
import { apiRequest, getErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function ProfilePage() {
  const { token, user, fetchMe } = useAuthStore();
  const [company, setCompany] = useState(user?.company ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCompany(user?.company ?? "");
  }, [user?.company]);

  const save = async () => {
    if (!token) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await apiRequest("profile", {
        method: "PATCH",
        token,
        body: JSON.stringify({ company: company.trim() || null }),
      });
      await fetchMe();
      setMessage("Saved.");
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Failed to save profile"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Protected>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>

        {message && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {message}
          </div>
        )}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-zinc-800">Name</label>
              <div className="mt-1 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
                {user?.name ?? ""}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-800">Email</label>
              <div className="mt-1 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
                {user?.email ?? ""}
              </div>
            </div>
          </div>

          {user?.role === "employer" && (
            <div className="mt-4">
              <label className="text-sm font-medium text-zinc-800">Company</label>
              <input
                className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Required for employers"
                required
              />
            </div>
          )}

          <div className="mt-5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => save()}
              disabled={saving || !token}
              className="rounded-md bg-indigo-600 px-4 py-2 text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/30 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            <span className="text-xs text-zinc-500">
              Role: {user?.role ?? "-"}
            </span>
          </div>
        </div>
      </div>
    </Protected>
  );
}
