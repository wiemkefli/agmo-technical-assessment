"use client";

import { useState } from "react";
import type { JobFilters, Sort, WorkArrangement } from "@/features/jobs/filters";

export function JobsFiltersCard(props: {
  initialFilters: JobFilters;
  perPage: number;
  pushJobs: (params: { page: number; perPage: number; filters: JobFilters }) => void;
  pushCleared: (params: { perPage: number }) => void;
}) {
  const [draft, setDraft] = useState<JobFilters>(props.initialFilters);
  const [moreOpen, setMoreOpen] = useState(false);

  const applyFilters = () => {
    setMoreOpen(false);
    props.pushJobs({ page: 1, perPage: props.perPage, filters: draft });
  };

  const clearFilters = () => {
    const cleared: JobFilters = {
      q: "",
      location: "",
      work_arrangement: "any",
      salary_min: "",
      salary_max: "",
      sort: "newest",
    };

    setMoreOpen(false);
    setDraft(cleared);
    props.pushCleared({ perPage: props.perPage });
  };

  return (
    <div className="rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 px-5 py-5 text-white shadow-md ring-1 ring-emerald-400/10">
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <div>
          <p className="text-sm font-semibold text-white/90">What</p>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input
              value={draft.q}
              onChange={(e) => setDraft((p) => ({ ...p, q: e.target.value }))}
              placeholder="Enter keywords"
              className="h-11 w-full rounded-md bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none ring-1 ring-white/10 placeholder:text-zinc-400 focus:ring-2 focus:ring-emerald-400"
              onKeyDown={(e) => {
                if (e.key === "Enter") applyFilters();
              }}
            />
            <select
              value={draft.work_arrangement}
              onChange={(e) =>
                setDraft((p) => ({
                  ...p,
                  work_arrangement: e.target.value as WorkArrangement,
                }))
              }
              className="h-11 w-full rounded-md bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-emerald-400"
            >
              <option value="any">Any work arrangement</option>
              <option value="remote">Remote only</option>
              <option value="onsite">On-site only</option>
            </select>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-white/90">Where</p>
          <input
            value={draft.location}
            onChange={(e) => setDraft((p) => ({ ...p, location: e.target.value }))}
            placeholder="Enter suburb, city, or region"
            className="mt-2 h-11 w-full rounded-md bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none ring-1 ring-white/10 placeholder:text-zinc-400 focus:ring-2 focus:ring-emerald-400"
            onKeyDown={(e) => {
              if (e.key === "Enter") applyFilters();
            }}
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={applyFilters}
            className="h-11 rounded-md bg-emerald-500 px-5 text-sm font-semibold text-emerald-950 shadow-sm transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            Search
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={clearFilters}
          className="text-sm text-white/70 underline-offset-4 hover:text-white hover:underline"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          className="text-sm font-medium text-white/85 underline-offset-4 hover:text-white hover:underline"
        >
          More options
        </button>
      </div>

      {moreOpen && (
        <div className="mt-4 grid gap-3 rounded-xl bg-white/10 p-4 ring-1 ring-emerald-300/20 backdrop-blur sm:grid-cols-2 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-white/90">Salary min</p>
            <input
              value={draft.salary_min}
              onChange={(e) => setDraft((p) => ({ ...p, salary_min: e.target.value }))}
              inputMode="numeric"
              placeholder="e.g. 3000"
              className="mt-1 h-10 w-full rounded-md bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none ring-1 ring-white/10 placeholder:text-zinc-400 focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-white/90">Salary max</p>
            <input
              value={draft.salary_max}
              onChange={(e) => setDraft((p) => ({ ...p, salary_max: e.target.value }))}
              inputMode="numeric"
              placeholder="e.g. 8000"
              className="mt-1 h-10 w-full rounded-md bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none ring-1 ring-white/10 placeholder:text-zinc-400 focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-2">
            <p className="text-xs font-semibold text-white/90">Sort</p>
            <select
              value={draft.sort}
              onChange={(e) => setDraft((p) => ({ ...p, sort: e.target.value as Sort }))}
              className="mt-1 h-10 w-full rounded-md bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-emerald-400"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
