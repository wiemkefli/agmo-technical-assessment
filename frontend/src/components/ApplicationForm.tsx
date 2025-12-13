"use client";

import { useEffect, useRef, useState } from "react";

export function ApplicationForm({
  onSubmit,
  savedResume,
}: {
  onSubmit: (payload: {
    message: string;
    resume?: File | null;
    use_profile_resume?: boolean;
  }) => Promise<void>;
  savedResume?: { exists: boolean; original_name: string | null } | null;
}) {
  const maxResumeBytes = 5 * 1024 * 1024;
  const inputClass =
    "mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";
  const [message, setMessage] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const resumeInputRef = useRef<HTMLInputElement | null>(null);
  const hasSavedResume = Boolean(savedResume?.exists);
  const [resumeOption, setResumeOption] = useState<"none" | "saved" | "upload">(
    hasSavedResume ? "saved" : "none",
  );
  const [resumeChoiceTouched, setResumeChoiceTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!resumeChoiceTouched && hasSavedResume && resumeOption === "none" && resume === null) {
      setResumeOption("saved");
    }
  }, [hasSavedResume, resumeChoiceTouched, resumeOption, resume]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (resumeOption === "saved" && !hasSavedResume) {
        throw new Error("No saved resume found. Upload a PDF or apply without a resume.");
      }

      if (resumeOption === "upload" && !resume) {
        throw new Error("Please select a PDF file to upload, or choose a different resume option.");
      }

      if (resumeOption === "upload" && resume) {
        const name = resume.name?.toLowerCase() ?? "";
        const isPdfByName = name.endsWith(".pdf");
        const isPdfByType = resume.type === "application/pdf";

        if (!isPdfByName && !isPdfByType) {
          throw new Error("Resume must be a PDF file.");
        }

        if (resume.size > maxResumeBytes) {
          throw new Error("Resume file is too large (max 5MB).");
        }
      }

      await onSubmit({
        message,
        resume: resumeOption === "upload" ? resume : null,
        use_profile_resume: resumeOption === "saved" ? true : undefined,
      });
      setDone(true);
    } catch (err: unknown) {
      setError((err as Error)?.message ?? "Failed to submit application");
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
        Application submitted successfully.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div>
        <label className="text-sm font-medium text-zinc-800">Message</label>
        <textarea
          className={inputClass}
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium text-zinc-800">Resume (optional)</label>
        <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => {
              setResumeChoiceTouched(true);
              setResumeOption("none");
              setResume(null);
              setError(null);
            }}
            className={[
              "rounded-md border px-3 py-2 text-sm transition",
              resumeOption === "none"
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
            ].join(" ")}
          >
            No resume
          </button>

          <button
            type="button"
            disabled={!hasSavedResume}
            onClick={() => {
              setResumeChoiceTouched(true);
              setResumeOption("saved");
              setResume(null);
              setError(null);
            }}
            className={[
              "rounded-md border px-3 py-2 text-sm transition disabled:opacity-50",
              resumeOption === "saved"
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
            ].join(" ")}
            title={
              hasSavedResume
                ? savedResume?.original_name ?? "Use saved resume"
                : "Upload a resume in your profile first"
            }
          >
            Use saved
          </button>

          <button
            type="button"
            onClick={() => {
              setResumeChoiceTouched(true);
              setResumeOption("upload");
              setError(null);
            }}
            className={[
              "rounded-md border px-3 py-2 text-sm transition",
              resumeOption === "upload"
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
            ].join(" ")}
          >
            Upload resume
          </button>
        </div>

        {resumeOption === "saved" && hasSavedResume && (
          <p className="mt-2 text-xs text-zinc-500">
            Using saved resume: {savedResume?.original_name ?? "resume.pdf"}
          </p>
        )}

        {resumeOption === "upload" && (
          <div className="mt-2">
            <input
              ref={resumeInputRef}
              className="hidden"
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setResume(file);
                setError(null);
              }}
            />

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => resumeInputRef.current?.click()}
                className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/30"
              >
                Choose file
              </button>
              <div className="text-sm text-zinc-700 break-words [overflow-wrap:anywhere]">
                {resume ? resume.name : "No file chosen"}
              </div>
            </div>
            <p className="mt-1 text-xs text-zinc-500">PDF only, up to 5MB.</p>
          </div>
        )}
      </div>
      <button
        disabled={
          saving ||
          (resumeOption === "upload" && resume === null)
        }
        className="rounded-md bg-indigo-600 px-4 py-2 text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/30 disabled:opacity-50"
      >
        {saving ? "Submitting..." : "Apply"}
      </button>
    </form>
  );
}
