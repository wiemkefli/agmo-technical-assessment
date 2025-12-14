"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { JobModal } from "@/components/JobModal";
import { useAuthStore } from "@/store/auth";
import { toJobListParams } from "@/features/jobs/filters";
import { useApplicantJobState } from "@/features/jobs/useApplicantJobState";
import { useJobsListing } from "@/features/jobs/useJobsListing";
import { useJobsUrlState } from "@/features/jobs/useJobsUrlState";
import { JobsFiltersCard } from "@/features/jobs/JobsFiltersCard";
import { JobsListSection } from "@/features/jobs/JobsListSection";
import { SavedJobsSidebar } from "@/features/jobs/SavedJobsSidebar";

function toPositiveInt(value: unknown, fallback: number) {
  const n = typeof value === "string" ? Number.parseInt(value, 10) : Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function JobsClient() {
  const router = useRouter();
  const { page, perPage, filters, filtersKey, pushJobs, pushCleared } = useJobsUrlState();
  const { token, role } = useAuthStore();
  const [hideAppliedJobs, setHideAppliedJobs] = useState(true);

  const listParams = toJobListParams({
    page,
    per_page: perPage,
    filters,
  });
  const excludeAppliedFlag: 1 | undefined =
    hideAppliedJobs && role === "applicant" && Boolean(token) ? 1 : undefined;
  const effectiveListParams = {
    ...listParams,
    exclude_applied: excludeAppliedFlag,
  };

  const { data, loading, error } = useJobsListing({ listParams: effectiveListParams, token });

  const {
    isApplicant,
    appliedJobIds,
    applicationStatusByJobId,
    savedJobIds,
    savedJobs,
    savingJobIds,
    toggleSave,
    markApplied,
  } = useApplicantJobState({ token, role });

  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const currentPage = toPositiveInt(
    String(data?.meta.current_page ?? page),
    page,
  );
  const lastPage = toPositiveInt(
    String(data?.meta.last_page ?? currentPage),
    currentPage,
  );

  const goTo = (nextPage: number) => {
    const safeNext = toPositiveInt(String(nextPage), 1);
    const minPage = Math.max(1, safeNext);
    const bounded = data ? Math.min(minPage, lastPage) : minPage;
    pushJobs({ page: bounded, perPage, filters });
  };

  return (
    <div className="space-y-4">
      <JobsFiltersCard
        key={filtersKey}
        initialFilters={filters}
        perPage={perPage}
        pushJobs={pushJobs}
        pushCleared={pushCleared}
      />

      {loading && <p className="text-sm text-zinc-600">Loading.</p>}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {data && (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            <JobsListSection
              jobs={data.data}
              isApplicant={isApplicant}
              hideAppliedJobs={hideAppliedJobs}
              onToggleHideApplied={() => setHideAppliedJobs((v) => !v)}
              appliedJobIds={appliedJobIds}
              applicationStatusByJobId={applicationStatusByJobId}
              savedJobIds={savedJobIds}
              savingJobIds={savingJobIds}
              toggleSave={toggleSave}
              onSelectJob={(jobId) => setSelectedJobId(jobId)}
              loading={loading}
              currentPage={currentPage}
              lastPage={lastPage}
              onPrev={() => goTo(currentPage - 1)}
              onNext={() => goTo(currentPage + 1)}
            />

            <SavedJobsSidebar
              token={token}
              role={role}
              savedJobs={savedJobs}
              savedJobsCount={savedJobIds.size}
              savingJobIds={savingJobIds}
              appliedJobIds={appliedJobIds}
              applicationStatusByJobId={applicationStatusByJobId}
              onSelectJob={(jobId) => setSelectedJobId(jobId)}
              onViewAll={() => router.push("/saved-jobs")}
              onRemoveSaved={(job) => toggleSave(job)}
            />
          </div>
        </>
      )}
      {selectedJobId !== null && (
        <JobModal
          jobId={selectedJobId}
          alreadyApplied={appliedJobIds.has(selectedJobId)}
          onApplied={markApplied}
          onClose={() => setSelectedJobId(null)}
        />
      )}
    </div>
  );
}
