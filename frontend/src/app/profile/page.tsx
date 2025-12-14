"use client";

import { useEffect, useState } from "react";
import { Protected } from "@/components/Protected";
import { apiRequest, getErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function ProfilePage() {
  const { token, user, fetchMe } = useAuthStore();
  const [company, setCompany] = useState(user?.company ?? "");
  const [website, setWebsite] = useState(user?.website ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [location, setLocation] = useState(user?.location ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeBusy, setResumeBusy] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [resumeMessage, setResumeMessage] = useState<string | null>(null);

  useEffect(() => {
    setCompany(user?.company ?? "");
    setWebsite(user?.website ?? "");
    setPhone(user?.phone ?? "");
    setLocation(user?.location ?? "");
  }, [user?.company, user?.location, user?.phone, user?.website]);

  useEffect(() => {
    setResumeFile(null);
  }, [user?.resume?.original_name, user?.resume?.exists]);

  const save = async () => {
    if (!token || !user) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const payload =
        user.role === "employer"
          ? { company: company.trim() || null, website: website.trim() || null }
          : { phone: phone.trim() || null, location: location.trim() || null };
      await apiRequest("profile", {
        method: "PATCH",
        token,
        body: JSON.stringify(payload),
      });
      await fetchMe();
      setMessage("Saved.");
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Failed to save profile"));
    } finally {
      setSaving(false);
    }
  };

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const maxResumeBytes = 5 * 1024 * 1024;

  const validateResume = (file: File): string | null => {
    const name = file.name?.toLowerCase() ?? "";
    const isPdfByName = name.endsWith(".pdf");
    const isPdfByType = file.type === "application/pdf";
    if (!isPdfByName && !isPdfByType) return "Resume must be a PDF file.";
    if (file.size > maxResumeBytes) return "Resume file is too large (max 5MB).";
    return null;
  };

  const uploadResume = async () => {
    if (!token || !user || user.role !== "applicant") return;
    if (!resumeFile) return;

    setResumeBusy(true);
    setResumeError(null);
    setResumeMessage(null);
    try {
      const validationError = validateResume(resumeFile);
      if (validationError) {
        setResumeError(validationError);
        return;
      }

      const form = new FormData();
      form.append("resume", resumeFile);

      await apiRequest("profile/resume", {
        method: "POST",
        token,
        body: form,
        isFormData: true,
      });

      await fetchMe();
      setResumeMessage("Resume saved.");
      setResumeFile(null);
    } catch (e: unknown) {
      setResumeError(getErrorMessage(e, "Failed to upload resume"));
    } finally {
      setResumeBusy(false);
    }
  };

  const removeResume = async () => {
    if (!token || !user || user.role !== "applicant") return;
    setResumeBusy(true);
    setResumeError(null);
    setResumeMessage(null);
    try {
      await apiRequest("profile/resume", { method: "DELETE", token });
      await fetchMe();
      setResumeMessage("Resume removed.");
    } catch (e: unknown) {
      setResumeError(getErrorMessage(e, "Failed to remove resume"));
    } finally {
      setResumeBusy(false);
    }
  };

  const fetchResumeBlob = async (): Promise<Blob> => {
    if (!token || !apiBaseUrl) {
      throw new Error("Missing auth token or API base URL");
    }

    const res = await fetch(`${apiBaseUrl}/profile/resume`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`Fetch failed (${res.status})`);
    }

    return res.blob();
  };

  const viewResume = async () => {
    if (!user?.resume?.exists) return;
    setResumeBusy(true);
    setResumeError(null);
    setResumeMessage(null);
    try {
      const blob = await fetchResumeBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e: unknown) {
      setResumeError(getErrorMessage(e, "Failed to view resume"));
    } finally {
      setResumeBusy(false);
    }
  };

  const downloadResume = async () => {
    if (!user?.resume?.exists) return;
    setResumeBusy(true);
    setResumeError(null);
    setResumeMessage(null);
    try {
      const blob = await fetchResumeBlob();
      const url = URL.createObjectURL(blob);
      const filename = user?.resume?.original_name ?? "resume.pdf";

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      setResumeError(getErrorMessage(e, "Failed to download resume"));
    } finally {
      setResumeBusy(false);
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

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
          {user?.role === "employer" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-zinc-800">Company name</label>
                <input
                  className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Required for employers"
                  autoComplete="organization"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-800">Email</label>
                <div className="mt-1 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
                  {user?.email ?? ""}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-zinc-800">Website</label>
                <input
                  type="url"
                  inputMode="url"
                  className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://company.com (optional)"
                  autoComplete="url"
                />
              </div>
            </div>
          ) : (
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
          )}

          {user?.role === "applicant" && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-zinc-800">Phone</label>
                <input
                  type="tel"
                  inputMode="tel"
                  className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+60..."
                  autoComplete="tel"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-800">Location</label>
                <input
                  className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City (optional)"
                  autoComplete="address-level2"
                />
              </div>
            </div>
          )}

          {user?.role === "applicant" && (
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => save()}
                disabled={saving || !token}
                className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/30 disabled:opacity-50 sm:w-auto"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
              <span className="text-xs text-zinc-500">
                Role: {user?.role ?? "-"}
              </span>
            </div>
          )}

          {user?.role === "applicant" && (
            <div className="mt-6 border-t border-zinc-100 pt-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-zinc-900">Resume</h2>
                  <p className="mt-1 text-sm text-zinc-600">
                    PDF only, up to 5MB. This will be available when applying.
                  </p>
                </div>
              </div>

              {resumeMessage && (
                <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                  {resumeMessage}
                </div>
              )}
              {resumeError && (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {resumeError}
                </div>
              )}

              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm text-zinc-800">
                    {user?.resume?.exists
                      ? `Saved: ${user.resume.original_name ?? "resume.pdf"}`
                      : "No saved resume yet."}
                  </div>
                  {user?.resume?.exists && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => viewResume()}
                        disabled={resumeBusy || !apiBaseUrl || !token}
                        className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadResume()}
                        disabled={resumeBusy || !apiBaseUrl || !token}
                        className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50"
                      >
                        Download
                      </button>
                      <button
                        type="button"
                        onClick={() => removeResume()}
                        disabled={resumeBusy || !token}
                        className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto] sm:items-start">
                  <label className="text-sm font-medium text-zinc-800 sm:col-span-2">
                    Upload / replace resume
                  </label>
                  <input
                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(e) => {
                      setResumeFile(e.target.files?.[0] ?? null);
                      setResumeError(null);
                      setResumeMessage(null);
                    }}
                    disabled={resumeBusy || !token}
                  />
                  <button
                    type="button"
                    onClick={() => uploadResume()}
                    disabled={resumeBusy || !token || !resumeFile}
                    className="h-[42px] rounded-md bg-indigo-600 px-4 py-2 text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/30 disabled:opacity-50"
                  >
                    {resumeBusy ? "Uploading..." : "Save resume"}
                  </button>
                  <p className="text-xs text-zinc-500 sm:col-span-2">PDF only, up to 5MB.</p>
                </div>

                {!apiBaseUrl && (
                  <p className="text-xs text-zinc-500">
                    Set `NEXT_PUBLIC_API_BASE_URL` to enable resume view/download.
                  </p>
                )}
              </div>
            </div>
          )}

          {user?.role !== "applicant" && (
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => save()}
                disabled={saving || !token}
                className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/30 disabled:opacity-50 sm:w-auto"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
              <span className="text-xs text-zinc-500">
                Role: {user?.role ?? "-"}
              </span>
            </div>
          )}
        </div>
      </div>
    </Protected>
  );
}
