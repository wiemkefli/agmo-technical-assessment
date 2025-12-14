# Refactor Assessment (Current State)

Scope: full repository, focusing on `backend/` (Laravel API) and `frontend/` (Next.js App Router + Zustand). This report summarizes current structure, remaining modularity smells, high-level refactor opportunities, and questions to clarify before additional changes.

## 1) Current Structure Summary

### Backend (`backend/`)

- **Routes**: `backend/routes/api.php` (public + authenticated groups; `role:applicant` and `role:employer` route groups)
- **Controllers (HTTP orchestration)**: `backend/app/Http/Controllers/*`
  - Public: `JobController` (jobs list/show)
  - Applicant: `ApplicationController` (apply, applied list/ids), `SavedJobController` (saved list/ids, save/unsave), `ProfileController` (profile + resume)
  - Employer: `EmployerJobController` (job CRUD, list, applications), `EmployerApplicationController` (application update + resume download)
- **Requests (validation/normalization)**: `backend/app/Http/Requests/*`
  - Pagination: `PerPageRequest`
  - Job listing/search: `JobIndexRequest`, `EmployerJobIndexRequest`
    - Supports `exclude_applied` for `/api/jobs` to paginate over unapplied jobs for authenticated applicants.
  - Job write: `JobStoreRequest`, `JobUpdateRequest` (+ `Concerns/ParsesSalaryRange`)
- **Services (domain/use-case orchestration)**: `backend/app/Services/*`
  - Jobs: `JobService` (CRUD + listing/search; supports excluding applied jobs) + `JobSearchService` (filter mechanics)
  - Applications: `ApplicationService`
  - Files: `ResumeService` (resume store/copy/delete/download helpers)
  - Saved jobs: `SavedJobService`
- **Resources (API contract / response shaping)**: `backend/app/Http/Resources/*` (e.g. `JobResource`, `JobCollection`, `ApplicationResource`, `ApplicationCollection`)
- **Authorization**: `backend/app/Policies/*` (e.g. `JobPolicy`, `ApplicationPolicy`) registered in `backend/app/Providers/AuthServiceProvider.php`
- **Tests**: `backend/tests/Feature/*` (includes `ExcludeAppliedJobsTest`)

### Frontend (`frontend/`)

- **App Router pages**: `frontend/src/app/*`
  - Jobs: `frontend/src/app/jobs/JobsClient.tsx`, `frontend/src/app/jobs/[id]/page.tsx`
  - Applicant: `frontend/src/app/applied-jobs/page.tsx`, `frontend/src/app/saved-jobs/page.tsx`, `frontend/src/app/profile/page.tsx`
  - Employer: `frontend/src/app/employer/jobs/page.tsx`, `frontend/src/app/employer/jobs/[id]/edit/page.tsx`, `frontend/src/app/employer/jobs/[id]/applications/page.tsx`
- **Components**: `frontend/src/components/*` (modals, forms, tables, cards)
- **State**: `frontend/src/store/auth.ts` (Zustand auth/session; refreshes via `/auth/me` after login/register to load self-only fields like resume metadata)
- **API layer**:
  - Base: `frontend/src/lib/api.ts`
  - Domain clients: `frontend/src/lib/clients/*` (jobs/applied/saved/profile/auth/employer*)
    - Jobs listing supports `exclude_applied=1` to keep pagination full when hiding applied jobs.
  - Query helpers: `frontend/src/lib/clients/query.ts`
- **Hooks**:
  - Async effects: `frontend/src/lib/hooks/useAsyncEffect.ts`
  - Paginated lists: `frontend/src/lib/hooks/usePaginatedResource.ts`
- **Feature modules**:
  - Jobs feature: `frontend/src/features/jobs/*`
    - State/query: `useJobsUrlState.ts`, `filters.ts`, `useJobsListing.ts`, `useApplicantJobState.ts`
    - UI slices: `JobsFiltersCard.tsx`, `JobsListSection.tsx`, `SavedJobsSidebar.tsx`
- **Shared utilities**:
  - Resume validation: `frontend/src/lib/resume.ts`
  - Authenticated blob helpers: `frontend/src/lib/apiBlob.ts`
  - Status constants: `frontend/src/lib/applicationStatus.ts`

## 2) Modularity Issues & Code Smells

### Backend

- **Layered structure more than “feature modules”**
  - The separation (Controllers/Requests/Services/Resources/Policies) is clean and idiomatic Laravel, but as domains grow, feature folders per domain (Jobs/Applications/Profile/Auth) can make boundaries clearer.

### Frontend

- **Contract drift risk**
  - `frontend/src/lib/types.ts` is hand-maintained and may drift from backend `JsonResource` outputs over time (especially nested shapes).

## 3) Refactor Opportunities (High-Level)

### Opportunity E — Cross-cutting: Contract as source of truth (OpenAPI/types generation)

- **What**: Add an API schema (OpenAPI or equivalent) and generate TS types (and optionally a typed client) to reduce drift between backend resources and frontend types.
- **Pros**: Safer refactors; compile-time alignment; easier onboarding; less manual shape chasing.
- **Cons**: Upfront setup; requires discipline to keep schema in sync with actual responses.
- **Risk/Effort**: **Risk: Low–Medium / Effort: Medium–High**
- **What could break**: mostly compile-time; runtime issues only if schema/types don’t match real API behavior.

## 4) Clarifying Questions (Before Further Refactor)

1. Is the API contract **locked**, or can response shapes evolve as long as the frontend stays compatible?
2. Do you want to pursue schema/types generation now (Opportunity E), or keep `frontend/src/lib/types.ts` hand-maintained for this assessment?
