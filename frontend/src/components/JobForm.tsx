"use client";

import { useState } from "react";
import type { JobFormPayload, JobStatus } from "@/lib/types";

export function JobForm({
  initial,
  onSubmit,
  submitLabel,
}: {
  initial?: {
    title: string;
    description: string;
    location: string | null;
    salary_range: string | null;
    is_remote: boolean;
    status: JobStatus;
  };
  onSubmit: (payload: JobFormPayload) => Promise<void>;
  submitLabel: string;
}) {
  const inputClass =
    "mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [salaryRange, setSalaryRange] = useState(initial?.salary_range ?? "");
  const [isRemote, setIsRemote] = useState(initial?.is_remote ?? false);
  const [status, setStatus] = useState<JobStatus>(initial?.status ?? "draft");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        title,
        description,
        location: location || null,
        salary_range: salaryRange || null,
        is_remote: isRemote,
        status,
      });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? "Failed to save job");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div>
        <label className="text-sm font-medium text-zinc-800">Title</label>
        <input
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium text-zinc-800">Description</label>
        <textarea
          className={inputClass}
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-zinc-800">Location</label>
          <input
            className={inputClass}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-800">Salary Range</label>
          <input
            className={inputClass}
            value={salaryRange}
            onChange={(e) => setSalaryRange(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="is_remote"
          type="checkbox"
          checked={isRemote}
          onChange={(e) => setIsRemote(e.target.checked)}
        />
        <label htmlFor="is_remote" className="text-sm text-zinc-700">
          Remote-friendly
        </label>
      </div>
      <div>
        <label className="text-sm font-medium text-zinc-800">Status</label>
        <select
          className={inputClass}
          value={status}
          onChange={(e) => setStatus(e.target.value as JobStatus)}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>
      <button
        disabled={saving}
        className="rounded-md bg-indigo-600 px-4 py-2 text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/30 disabled:opacity-50"
      >
        {saving ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
