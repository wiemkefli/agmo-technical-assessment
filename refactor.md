# Refactor Assessment (Current State)

Scope: full repository, focusing on `backend/` (Laravel API) and `frontend/` (Next.js App Router + Zustand). This report summarizes current structure, remaining modularity smells, high-level refactor opportunities, and what to clarify before more changes.

## 1) Current Structure Summary

### Backend (`backend/`)

- **Routes**: `backend/routes/api.php` (public + `auth:sanctum` groups; role-gated applicant/employer groups)
- **Controllers (HTTP orchestration)**: `backend/app/Http/Controllers/*`
  - Public: `JobController` (list/show)
  - Applicant: `ApplicationController` (apply, applied list/ids), `SavedJobController` (saved list/ids, save/unsave), `ProfileController` (profile + resume)
  - Employer: `EmployerJobController` (job CRUD, list, applications), `EmployerApplicationController` (application update + resume download)
- **Requests (validation/normalization)**: `backend/app/Http/Requests/*`
  - Pagination: `PerPageRequest`
  - Job listing: `JobIndexRequest`, `EmployerJobIndexRequest`
  - Job write: `JobStoreRequest`, `JobUpdateRequest` (+ `Concerns/ParsesSalaryRange`)
- **Services (domain/use-case orchestration)**: `backend/app/Services/*`
  - Jobs: `JobService` (CRUD + listing/search) + `JobSearchService` (filter mechanics)
  - Applications: `ApplicationService`
  - Files: `ResumeService` (store/copy/delete/download helpers)
  - Saved jobs: `SavedJobService`
- **Resources (API contract / response shaping)**: `backend/app/Http/Resources/*` (e.g. `JobResource`, `JobCollection`, `ApplicationResource`, `ApplicationCollection`)
- **Authorization**: `backend/app/Policies/*` (e.g. `JobPolicy`, `ApplicationPolicy`) registered in `backend/app/Providers/AuthServiceProvider.php`
- **Tests**: `backend/tests/Feature/*`

### Frontend (`frontend/`)

- **App Router pages**: `frontend/src/app/*`
  - Jobs: `frontend/src/app/jobs/JobsClient.tsx`, `frontend/src/app/jobs/[id]/page.tsx`
  - Applicant: `frontend/src/app/applied-jobs/page.tsx`, `frontend/src/app/saved-jobs/page.tsx`, `frontend/src/app/profile/page.tsx`
  - Employer: `frontend/src/app/employer/jobs/page.tsx`, `frontend/src/app/employer/jobs/[id]/edit/page.tsx`, `frontend/src/app/employer/jobs/[id]/applications/page.tsx`
- **Components**: `frontend/src/components/*` (modals, forms, tables, cards)
- **State**: `frontend/src/store/auth.ts` (Zustand)
- **API layer**:
  - Base: `frontend/src/lib/api.ts`
  - Domain clients: `frontend/src/lib/clients/*` (jobs/applied/saved/profile/auth/employer*)
  - Query helpers: `frontend/src/lib/clients/query.ts`
- **Hooks**:
  - Async effects: `frontend/src/lib/hooks/useAsyncEffect.ts`
  - Paginated lists: `frontend/src/lib/hooks/usePaginatedResource.ts`
- **Feature modules**:
  - Jobs: `frontend/src/features/jobs/*` (`filters.ts`, `useJobsListing.ts`, `useApplicantJobState.ts`, `useJobsUrlState.ts`)
- **Shared utilities**:
  - `frontend/src/lib/resume.ts`, `frontend/src/lib/apiBlob.ts`, `frontend/src/lib/applicationStatus.ts`

## 2) Modularity Issues & Code Smells

### Backend

- **Layered structure more than “feature modules”**
  - Current separation (Controllers/Requests/Services/Resources/Policies) is clean, but it’s still technical-layer oriented; if the app grows, feature folders per domain (Jobs/Applications/Profile/Auth) would make boundaries more explicit.

### Frontend

- **"Fat" jobs listing client component remains**
  - `frontend/src/app/jobs/JobsClient.tsx` still mixes concerns: filter UI/draft state, URL syncing, pagination wiring, rendering, modal state, and applicant interactions.
- **Contract drift risk**
  - `frontend/src/lib/types.ts` is hand-maintained and can drift from backend `JsonResource` outputs over time.

## 3) Refactor Opportunities (High-Level)

### Opportunity E - Cross-cutting: Contract as source of truth (OpenAPI/types generation)

- **Risk/Effort**: **Risk: Low-Medium / Effort: Medium-High**
- **What could break**: mostly compile-time; runtime issues only if the schema/types don't match production behavior.

## 4) Clarifying Questions (Before Further Refactor)

1. Jobs listing: should the **URL be the source of truth** for `page/per_page/filters`, or do you prefer local state with URL syncing?
2. Jobs filters UX: keep **draft filters + “Search” apply** (current direction) or switch to “instant apply”?
3. Is the API contract **locked**, or can response shapes evolve as long as the frontend stays compatible?
4. Do you want to pursue schema/types generation now (Opportunity E), or keep `frontend/src/lib/types.ts` hand-maintained for this assessment?
