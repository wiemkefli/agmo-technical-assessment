"use client";

import { useState } from "react";

export function ApplicationForm({
  onSubmit,
}: {
  onSubmit: (payload: { message: string; resume?: File | null }) => Promise<void>;
}) {
  const inputClass =
    "mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";
  const [message, setMessage] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ message, resume });
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
        <input
          className={inputClass}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setResume(e.target.files?.[0] ?? null)}
        />
      </div>
      <button
        disabled={saving}
        className="rounded-md bg-indigo-600 px-4 py-2 text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/30 disabled:opacity-50"
      >
        {saving ? "Submitting..." : "Apply"}
      </button>
    </form>
  );
}
