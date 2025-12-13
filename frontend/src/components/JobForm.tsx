"use client";

import { useState } from "react";
import { APIError } from "@/lib/api";
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
    salary_min: number | null;
    salary_max: number | null;
    salary_currency: string | null;
    salary_period: "month" | "year" | null;
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

  const [salaryMin, setSalaryMin] = useState(
    initial?.salary_min !== null && initial?.salary_min !== undefined
      ? String(initial.salary_min)
      : "",
  );
  const [salaryMax, setSalaryMax] = useState(
    initial?.salary_max !== null && initial?.salary_max !== undefined
      ? String(initial.salary_max)
      : "",
  );
  const [salaryCurrency, setSalaryCurrency] = useState(
    initial?.salary_currency ?? "MYR",
  );
  const [salaryPeriod, setSalaryPeriod] = useState<"month" | "year">(
    initial?.salary_period ?? "month",
  );

  const [isRemote, setIsRemote] = useState(initial?.is_remote ?? false);
  const [status, setStatus] = useState<JobStatus>(initial?.status ?? "draft");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (location.trim() === "") {
        throw new Error("Location is required");
      }
      if (salaryMin.trim() === "") {
        throw new Error("Salary min is required");
      }
      if (salaryMax.trim() === "") {
        throw new Error("Salary max is required");
      }

      const parsedMin = Number.parseInt(salaryMin, 10);
      const parsedMax = Number.parseInt(salaryMax, 10);

      if (!Number.isFinite(parsedMin)) {
        throw new Error("Salary min must be a number");
      }
      if (!Number.isFinite(parsedMax)) {
        throw new Error("Salary max must be a number");
      }
      if (parsedMax < parsedMin) {
        throw new Error("Salary max must be greater than salary min");
      }

      await onSubmit({
        title,
        description,
        location: location.trim(),
        salary_min: parsedMin,
        salary_max: parsedMax,
        salary_currency: salaryCurrency,
        salary_period: salaryPeriod,
        is_remote: isRemote,
        status,
      });
    } catch (err: unknown) {
      if (err instanceof APIError && err.errors) {
        const firstError = Object.values(err.errors).flat()[0];
        setError(firstError ?? err.message);
      } else {
        setError((err as Error)?.message ?? "Failed to save job");
      }
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
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-800">Salary</label>
          <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input
              className={inputClass}
              inputMode="numeric"
              placeholder="Min"
              type="number"
              min={0}
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              required
            />
            <input
              className={inputClass}
              inputMode="numeric"
              placeholder="Max"
              type="number"
              min={0}
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              required
            />
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <select
              className={inputClass}
              value={salaryCurrency}
              onChange={(e) => setSalaryCurrency(e.target.value)}
            >
              <option value="MYR">MYR</option>
              <option value="USD">USD</option>
              <option value="SGD">SGD</option>
            </select>
            <select
              className={inputClass}
              value={salaryPeriod}
              onChange={(e) => setSalaryPeriod(e.target.value as "month" | "year")}
            >
              <option value="month">Per month</option>
              <option value="year">Per year</option>
            </select>
          </div>
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
