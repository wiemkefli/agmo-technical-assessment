# Refactor Assessment (Current State)

Scope: full repository, focusing on `backend/` (Laravel API) and `frontend/` (Next.js App Router + Zustand). This document summarizes the current structure, remaining modularity smells, and practical next refactor directions.

## 1) Current Structure Summary

### Backend (`backend/`)

**Where responsibilities live**

- **Routing**: `backend/routes/api.php` (public vs applicant vs employer groups; `auth:sanctum` + `role:*` middleware)
- **Controllers (HTTP orchestration)**: `backend/app/Http/Controllers/*`
  - `JobController`: public job listing + job details; uses `JobIndexRequest` and delegates listing/search to `JobService`
  - `EmployerJobController`: employer job listing + CRUD + job applications listing; uses `EmployerJobIndexRequest` and `JobService`
  - `ApplicationController`: applicant apply + applied jobs listing/ids; uses `ApplicationService` and `PerPageRequest` for pagination normalization
  - `SavedJobController`: saved jobs list/ids + save/unsave; delegates to `SavedJobService` and uses `PerPageRequest`
  - `ProfileController`: profile show/update + resume upload/download/delete; delegates file operations to `ResumeService`
  - `EmployerApplicationController`: employer application updates + resume download; authorization via `ApplicationPolicy`, file operations via `ResumeService`
- **Requests (validation + normalization)**: `backend/app/Http/Requests/*`
  - Query/list: `PerPageRequest`, `JobIndexRequest`, `EmployerJobIndexRequest`
  - Write: `JobStoreRequest`, `JobUpdateRequest`, `ApplicationStoreRequest`, `ProfileUpdateRequest`, etc.
  - Shared request logic: `backend/app/Http/Requests/Concerns/ParsesSalaryRange.php`
- **Services (domain/use-case orchestration)**: `backend/app/Services/*`
  - Jobs: `JobService` (CRUD + listing/search) delegating filter mechanics to `JobSearchService`
  - Applications: `ApplicationService` + resume file operations in `ResumeService`
  - Saved jobs: `SavedJobService`
- **Resources (response shaping / API contract)**: `backend/app/Http/Resources/*` (`JobResource`, `JobCollection`, `ApplicationResource`, `ApplicationCollection`, `UserResource`, `PublicEmployerResource`)
- **Authorization**: policies in `backend/app/Policies/*` (notably `ApplicationPolicy` + `JobPolicy`), mapped in `backend/app/Providers/AuthServiceProvider.php`
- **Tests**: `backend/tests/Feature/*`

**Notable implemented refactors already in place**

- `per_page` clamping centralized in `backend/app/Http/Requests/PerPageRequest.php` (used by job listings + applied jobs + saved jobs).
- Job listing/search concerns consolidated into `JobIndexRequest`/`EmployerJobIndexRequest` + `JobService` (internally using `JobSearchService`).
- Resume Storage logic centralized in `ResumeService` and employer-side authorization aligned via `ApplicationPolicy`.
- Recommendations feature removed (no `RecommendationController`, no `/api/recommended-jobs`, no backend recommendations test).

### Frontend (`frontend/`)

**Where responsibilities live**

- **Routes/pages**: `frontend/src/app/*` (App Router)
  - Jobs: `frontend/src/app/jobs/JobsClient.tsx`, `frontend/src/app/jobs/[id]/page.tsx`
  - Applicant: `frontend/src/app/applied-jobs/page.tsx`, `frontend/src/app/saved-jobs/page.tsx`, `frontend/src/app/profile/page.tsx`
  - Employer: `frontend/src/app/employer/jobs/page.tsx`, `frontend/src/app/employer/jobs/[id]/edit/page.tsx`, `frontend/src/app/employer/jobs/[id]/applications/page.tsx`
- **Components**: `frontend/src/components/*` (cards, modals, forms, tables)
- **Client state**: `frontend/src/store/auth.ts` (Zustand)
- **API layer**
  - Low-level wrapper: `frontend/src/lib/api.ts`
  - Domain clients: `frontend/src/lib/clients/*` (`auth.ts`, `jobs.ts`, `appliedJobs.ts`, `savedJobs.ts`, `profile.ts`, `employerJobs.ts`, `employerApplications.ts`)
  - Shared query helpers: `frontend/src/lib/clients/query.ts`
- **Hooks**
  - Non-paginated async: `frontend/src/lib/hooks/useAsyncEffect.ts`
  - Paginated resources: `frontend/src/lib/hooks/usePaginatedResource.ts`
- **Feature modules**
  - Jobs: `frontend/src/features/jobs/*` (`filters.ts`, `useJobsListing.ts`, `useApplicantJobState.ts`, `useJobsUrlState.ts`)
- **Shared utilities**
  - Resume validation: `frontend/src/lib/resume.ts`
  - Authenticated blob download/view: `frontend/src/lib/apiBlob.ts`
  - Application statuses: `frontend/src/lib/applicationStatus.ts`

**Notable implemented refactors already in place**

- API endpoint usage is mostly centralized in `frontend/src/lib/clients/*` instead of being scattered across components.
- Fetch lifecycles are more consistent via `useAsyncEffect` and `usePaginatedResource` (used in multiple screens).
- Jobs listing defaults to “Hide applied jobs” enabled.

## 2) Modularity Issues & Code Smells (Remaining)

### Backend

- **Feature boundary is still mostly “layered” (controllers/requests/services/resources)**
  - This is idiomatic Laravel and fine for current size, but if domains expand, “feature folders” (Jobs/Applications/Profile/Auth) would make boundaries more explicit.
- **Pagination utilities are centralized, but not enforced**
  - `PerPageRequest` exists and is used in multiple controllers; as more paginated endpoints are added, standardizing on it (or a similar request abstraction) early keeps controller methods consistent.

### Frontend

- **“Fat” jobs listing client component**
  - `frontend/src/app/jobs/JobsClient.tsx` still owns a lot at once: URL <-> state sync, filter draft state, modal state, list rendering, pagination wiring, and interactions (save/apply state).
- **Jobs URL → state sync still uses a set-state-in-effect pattern**
  - `frontend/src/app/jobs/JobsClient.tsx` syncs URL params into React state in an effect and disables `react-hooks/set-state-in-effect`.
  - A URL-state helper exists (`frontend/src/features/jobs/useJobsUrlState.ts`), but is not yet the single source of truth for the listing’s `page/per_page/filters`.
- **Async/data-fetch patterns are improved but not uniform**
  - `useAsyncEffect` / `usePaginatedResource` exist and are used in several screens, but some flows still use bespoke `useEffect` + local state patterns.
- **Contract drift risk remains**
  - `frontend/src/lib/types.ts` is hand-maintained and can drift from backend `JsonResource` outputs (especially nested resources) without a shared schema/types generation step.

## 3) Refactor Opportunities (High-Level Only)

### Opportunity D — Frontend: Finish standardizing fetching

- **What**: Migrate remaining fetch flows to `useAsyncEffect` (non-paginated) and `usePaginatedResource` (paginated), keeping domain logic in `frontend/src/lib/clients/*` or feature hooks.
- **Pros**: Less duplication; fewer abort/cleanup bugs; more consistent UX; clearer “data vs UI” separation.
- **Cons**: Requires touching many call sites; can be tedious; easy to introduce subtle loading-state regressions.
- **Risk/Effort**: **Risk: Low–Medium / Effort: Medium**
- **What could break**: Loading/error UX, pagination controls, and edge cases around navigation/unmounts.

### Opportunity F — Frontend: Make URL the single source of truth for Jobs listing state

- **What**: Refactor `frontend/src/app/jobs/JobsClient.tsx` to use `frontend/src/features/jobs/useJobsUrlState.ts` for `page/per_page/filters` and remove “sync URL → state” effects entirely.
- **Pros**: Removes `setState`-in-effect smell; fewer edge cases; easier deep-linking and back/forward navigation semantics.
- **Cons**: Needs careful UX choices for “draft filters vs applied filters” and how/when URL updates.
- **Risk/Effort**: **Risk: Medium / Effort: Medium**
- **What could break**: Filter apply/clear behavior, pagination stability, back/forward navigation, and querystring semantics.

### Opportunity E — Cross-cutting: Contract as a source of truth (OpenAPI/types generation)

- **What**: Add an API schema (OpenAPI or equivalent) and generate TS types (and optionally clients) to reduce drift between backend resources and frontend types.
- **Pros**: Safer refactors; easier onboarding; compile-time safety; less “guessing” nested shapes.
- **Cons**: Upfront setup; requires discipline to keep schema in sync.
- **Risk/Effort**: **Risk: Low–Medium / Effort: Medium–High**
- **What could break**: Mostly compile-time; runtime issues only if the schema doesn’t match actual production behavior.

## 4) Clarifying Questions (Before Any Further Refactor)

1. Jobs listing: should the **URL be the source of truth** for `page/per_page/filters`, or do you prefer local state with URL syncing?
2. Jobs filters UX: do you want **draft filters** (user edits without immediately changing results) or “instant apply” behavior?
3. Is the API contract **locked**, or can response shapes evolve if the frontend stays compatible?
4. For types: do you want schema generation now (Opportunity E) or keep `frontend/src/lib/types.ts` hand-maintained for the assessment?
