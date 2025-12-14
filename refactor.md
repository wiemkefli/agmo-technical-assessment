# Refactor Assessment (Report Only)

Scope scanned: full repo, with focus on `backend/` (Laravel 12 API) and `frontend/` (Next.js App Router + Zustand).

## 0) Status (Implemented So Far)

- **Opportunity A (Backend job query consolidation)**: Implemented via `JobIndexRequest`/`EmployerJobIndexRequest` + `JobQueryBuilder`; controllers updated to reuse it.
- **Opportunity A (Backend job query consolidation)**: Implemented via `JobIndexRequest`/`EmployerJobIndexRequest`; job reads now live in `JobService` (controllers call `JobService::searchPublished/searchEmployer`).
- **Opportunity B (Backend resume concerns + authorization)**: Implemented via `ResumeService` + `ApplicationPolicy`; controllers/services updated to use it.
- **Opportunity C (Frontend API clients)**: Implemented via `frontend/src/lib/clients/*`; call sites migrated.
- **Recommendations endpoint removed**: `/api/recommended-jobs` and `RecommendationController` removed (and corresponding feature test removed).
- **Backend cleanup follow-ups**: `PerPageRequest` removes repeated `per_page` clamping; `SavedJobService` centralizes saved-job logic; `ParsesSalaryRange` removes `salary_range` parsing duplication.

## 1) Current Structure Summary

### Backend (`backend/`)

**Primary layers/modules (as implemented)**

- **Routing**: `backend/routes/api.php` defines all API endpoints and applies `auth:sanctum` + `role:*` middleware.
- **Controllers (HTTP orchestration)**: `backend/app/Http/Controllers/*`
  - Examples: `JobController`, `EmployerJobController`, `ApplicationController`, `ProfileController`, `AuthController`, `SavedJobController`.
- **Validation (request DTOs)**: `backend/app/Http/Requests/*`
  - Strong use for write endpoints (jobs, applications, auth, profile).
  - Job list query/filter validation and pagination clamping live in `JobIndexRequest` / `EmployerJobIndexRequest`.
- **Serialization/response shaping**: `backend/app/Http/Resources/*`
  - Examples: `JobResource` and `PublicEmployerResource` enforce public contract and hide employer email.
- **Services (business logic)**: `backend/app/Services/*`
  - `JobService` (create/update/delete + listing/search), `JobSearchService` (filter implementation used by `JobService`), `ApplicationService` (apply), `ResumeService` (resume storage ops).
- **Domain models (Eloquent)**: `backend/app/Models/*` with relationships (jobs, applications, profiles, saved jobs pivot).
- **Authorization**:
  - `backend/app/Policies/JobPolicy.php` for job ownership/role.
  - `backend/app/Policies/ApplicationPolicy.php` for employer access to application status + resume download.
  - `backend/app/Http/Middleware/EnsureUserRole.php` for role-based route protection.
- **Tests**: `backend/tests/Feature/*` cover key API behaviors and contracts.

**Where responsibilities live today**

- Controllers orchestrate HTTP concerns; job listing filters/sort/pagination are centralized in `JobQueryBuilder` + request objects.
- Resume file operations are centralized in `ResumeService` and reused by profile/application flows.

### Frontend (`frontend/`)

**Primary layers/modules (as implemented)**

- **Routes/pages (App Router)**: `frontend/src/app/**/page.tsx`
  - Feature-style routing folders: `jobs`, `saved-jobs`, `applied-jobs`, `profile`, `employer/jobs/*`, etc.
- **UI components**: `frontend/src/components/*`
  - Mix of reusable UI (e.g., `PaginationControls`) and feature-specific UI (e.g., `EmployerApplicationsModal`, `JobModal`).
- **Client-side API wrapper**: `frontend/src/lib/api.ts`
  - `apiRequest`/`apiPaginated` (JSON-focused) + `APIError`.
- **Domain API clients**: `frontend/src/lib/clients/*`
  - Typed per-domain functions (auth/jobs/saved/applied/employer/profile) wrapping `apiRequest`.
- **Types**: `frontend/src/lib/types.ts` defines frontend contract types.
- **State management**: `frontend/src/store/auth.ts` (Zustand + persistence + token hydration).

**Where responsibilities live today**

- Many pages/components combine: UI + async fetching + pagination state + error handling + some domain rules (e.g., resume validation, query building).
- Endpoint strings are centralized in `frontend/src/lib/clients/*` instead of being scattered through UI code.

## 2) Modularity Issues & Code Smells

### Backend

- **(Resolved) Repeated job list query logic**: moved to `JobIndexRequest`/`EmployerJobIndexRequest` + `JobQueryBuilder`.
- **(Resolved) Resume storage duplication and ad-hoc employer checks**: moved to `ResumeService` + `ApplicationPolicy`.
- **(Resolved) Repeated pagination clamping** outside job listings: moved to `PerPageRequest` (used by `SavedJobController@index` and `ApplicationController@index`).
- **(Resolved) Service boundary inconsistency (jobs)**:
  - Job create/update/delete and job listing/search are now unified behind `JobService`; controllers no longer depend on job query helpers directly.
  - **(Resolved) Saved jobs boundary**: logic moved from `SavedJobController` into `SavedJobService`.
- **(Resolved) Duplication in validation logic**: `JobStoreRequest` and `JobUpdateRequest` now share `salary_range` parsing via `ParsesSalaryRange`.
- **Repository hygiene that impacts maintainability** (not a refactor, but affects modularity/velocity):
  - `backend/vendor/` and `backend/.env` appear committed; this typically increases repo noise and complicates collaboration/reviews.

### Frontend

- **"Fat" client components** (still true):
  - `frontend/src/app/jobs/JobsClient.tsx` is a major hotspot: URL <-> state syncing, query building, fetching jobs, applied/saved state, sidebar saved jobs, UI rendering, and modal control all in one file.
- **Duplicate async patterns**:
  - Many pages repeat a similar fetch lifecycle: `loading/error/data`, `alive` flags, pagination state, and re-fetch logic.
- **Duplicate domain logic**:
  - Resume file validation and blob download logic are repeated in multiple places (`ProfilePage`, `ApplicationForm`, `ApplicationDetailsDialog`).
  - Application status lists are duplicated (`ApplicantsTable` and `ApplicationDetailsDialog`).
- **(Improved) Tight coupling to API endpoints**:
  - Most endpoint usage is now centralized in `frontend/src/lib/clients/*`, reducing “hunt and replace” refactors.
- **Contract drift risk**:
  - Types are handwritten in `frontend/src/lib/types.ts` and may diverge from backend `JsonResource` outputs over time (especially for nested shapes like employer/applicant resources).
- **Repository hygiene**:
  - `frontend/node_modules/` and `frontend/.next/` appear present in repo; this materially hurts maintainability (diff noise, huge checkout size, slower CI).

## 3) Refactor Opportunities (High-Level Only)

### Opportunity A - Backend: Consolidate "Job Query" concerns (filters/sort/pagination) into reusable request + query builder (Implemented)

- **What**: Introduce a dedicated query/request object (e.g., `JobIndexRequest`) + a single "job query" builder that:
  - Validates filters once, clamps pagination once, applies sorting once.
  - Is reused by `JobController` and `EmployerJobController`.
- **Pros**: Removes duplication; makes filters consistent; easier to add new filters; fewer bugs.
- **Cons**: Slight upfront complexity; must preserve existing behavior precisely.
- **Risk/Effort**: **Risk: Medium / Effort: Medium**
- **What could break**: Filter semantics (`is_remote`, salary handling), default sort order, pagination meta, and tests that assert result ordering.

### Opportunity B - Backend: Move resume storage concerns to a dedicated service (and align "resume download" authorization) (Implemented)

- **What**: Centralize resume file operations (store/delete/copy/metadata) into a `ResumeService` used by:
  - `ProfileController` (profile resume upload/download/delete),
  - `ApplicationService` (apply with uploaded resume or profile resume),
  - `EmployerApplicationController` (download application resume),
  - plus optionally introduce `ApplicationPolicy` for ownership checks.
- **Pros**: Clear boundary; less repeated Storage logic; easier to test; consistent file naming and error handling.
- **Cons**: Refactor touches multiple flows; requires careful testing of file paths and permission checks.
- **Risk/Effort**: **Risk: Medium / Effort: Medium**
- **What could break**: Resume download endpoints, stored file paths, profile resume reuse on application, and existing feature tests around resumes.

### Opportunity C - Frontend: Introduce a small "API client" layer per domain (jobs/applications/profile/auth) (Implemented)

- **What**: Replace scattered `apiRequest("string")` calls with typed functions:
  - `src/lib/clients/jobs.ts`, `applications.ts`, `profile.ts`, `auth.ts` (or `src/features/*/api.ts`).
  - Include shared helpers for pagination and querystring building.
- **Pros**: Clear boundaries; safer refactors; simpler components; consistent error mapping.
- **Cons**: Adds files; requires a pass through call sites.
- **Risk/Effort**: **Risk: Low–Medium / Effort: Medium**
- **What could break**: Mostly compile-time; runtime risks are mismatched endpoint paths/params and subtle querystring differences.

### Opportunity D — Frontend: Break up `JobsClient.tsx` into feature hooks + presentational components

- **What**: Split into composable hooks:
  - `useJobFiltersFromUrl`, `usePaginatedJobs`, `useSavedJobs`, `useAppliedJobs`,
  - and smaller UI components for filter controls, results list, saved sidebar.
- **Pros**: Major readability win; easier testing; isolated changes; reduces regressions.
- **Cons**: A “big move” that can destabilize behavior if not done incrementally.
- **Risk/Effort**: **Risk: Medium / Effort: Medium–High**
- **What could break**: URL/state sync behavior, saved/applied toggles, pagination, and modal interactions.

### Opportunity E — Cross-cutting: Establish a single source of truth for API contracts (OpenAPI or generated TS types)

- **What**: Add a contract layer:
  - Generate OpenAPI from Laravel (or maintain manually), then generate TS types/client for frontend.
  - Alternatively, generate lightweight TS types from backend resources/tests if OpenAPI is too heavy.
- **Pros**: Reduces contract drift; makes refactors safer; improves onboarding and tooling.
- **Cons**: Non-trivial setup; ongoing discipline required.
- **Risk/Effort**: **Risk: Medium–High / Effort: High**
- **What could break**: Type generation pipeline/CI; initial mismatch between actual responses and declared schema.

## 4) Clarifying Questions (Before Any Refactor)

1. **Preferred architecture direction**:
   - Keep Laravel "classic" structure (Controllers + FormRequests + Services), or move toward a domain/feature module layout (e.g., `Domains/Jobs`, `Domains/Applications`)?
2. **API contract guarantees**:
   - Are response shapes considered stable/public (especially nested employer/applicant payloads), or can we adjust them during refactor if tests still pass?
3. **Frontend direction**:
   - Do you want a simple internal API client + custom hooks approach, or are you open to introducing a data-fetching library (e.g., React Query/SWR) later?
4. **Repo hygiene scope**:
   - Should removing committed artifacts (`backend/vendor`, `frontend/node_modules`, `frontend/.next`, committed `.env`) be part of the refactor plan, or considered out-of-scope for now?
5. **Incremental vs. big-bang**:
   - Do you prefer incremental refactors behind unchanged routes/contracts (safer), or is a larger restructure acceptable if it improves maintainability quickly?

---

If you confirm which opportunities you want first (A–E) and answer the questions above, I can propose a concrete, step-by-step refactor plan and only then start implementing changes.
