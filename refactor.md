# Refactor Assessment (Report Only)

Scope scanned: full repo, with focus on `backend/` (Laravel 12 API) and `frontend/` (Next.js App Router + Zustand).

## 1) Current Structure Summary

### Backend (`backend/`)

**Primary layers/modules (as implemented)**

- **Routing**: `backend/routes/api.php` defines all API endpoints and applies `auth:sanctum` + `role:*` middleware.
- **Controllers (HTTP orchestration)**: `backend/app/Http/Controllers/*`
  - Examples: `JobController`, `EmployerJobController`, `ApplicationController`, `ProfileController`, `AuthController`, `RecommendationController`, `SavedJobController`.
- **Validation (request DTOs)**: `backend/app/Http/Requests/*`
  - Strong use for write endpoints (jobs, applications, auth, profile).
  - Query/filter validation is mostly done inline in controllers.
- **Serialization/response shaping**: `backend/app/Http/Resources/*`
  - Examples: `JobResource` and `PublicEmployerResource` enforce public contract and hide employer email.
- **Services (business logic)**: `backend/app/Services/*`
  - `JobService` (create/update/delete), `JobSearchService` (filters), `ApplicationService` (apply + resume logic).
- **Domain models (Eloquent)**: `backend/app/Models/*` with relationships (jobs, applications, profiles, saved jobs pivot).
- **Authorization**:
  - `backend/app/Policies/JobPolicy.php` for job ownership/role.
  - `backend/app/Http/Middleware/EnsureUserRole.php` for role-based route protection.
- **Tests**: `backend/tests/Feature/*` cover key API behaviors and contracts.

**Where responsibilities live today**

- Controllers often do: query building + pagination + sorting + inline validation for query params, then delegate to services for some write operations.
- Business logic is partly in services (`JobService`, `ApplicationService`) and partly in controllers (notably recommendation scoring and resume/profile workflows).

### Frontend (`frontend/`)

**Primary layers/modules (as implemented)**

- **Routes/pages (App Router)**: `frontend/src/app/**/page.tsx`
  - Feature-style routing folders: `jobs`, `saved-jobs`, `applied-jobs`, `profile`, `employer/jobs/*`, etc.
- **UI components**: `frontend/src/components/*`
  - Mix of reusable UI (e.g., `PaginationControls`) and feature-specific UI (e.g., `EmployerApplicationsModal`, `JobModal`).
- **Client-side API wrapper**: `frontend/src/lib/api.ts`
  - `apiRequest`/`apiPaginated` (JSON-focused) + `APIError`.
- **Types**: `frontend/src/lib/types.ts` defines frontend contract types.
- **State management**: `frontend/src/store/auth.ts` (Zustand + persistence + token hydration).

**Where responsibilities live today**

- Many pages/components combine: UI + async fetching + pagination state + error handling + some domain rules (e.g., resume validation, query building).
- API calls are stringly-typed (endpoint strings scattered across pages/components).

## 2) Modularity Issues & Code Smells

### Backend

- **Repeated query param validation + pagination/sorting logic** across controllers:
  - `JobController@index`, `EmployerJobController@index`, `RecommendationController@index` each re-define filter rules and sorting behavior.
  - Per-page clamping logic is repeated in multiple controllers.
- **Mixed concerns in controllers**:
  - `RecommendationController` contains ranking/scoring algorithm and SQL expression construction (business logic living in HTTP layer).
  - `ProfileController` handles resume storage concerns (file deletion, naming, persistence) alongside profile updates.
  - `EmployerApplicationController` performs ad-hoc authorization checks rather than a dedicated `ApplicationPolicy` (or consistent policy usage).
- **Service boundary inconsistency**:
  - Jobs: create/update/delete is in `JobService`, but listing/search concerns are split between controllers + `JobSearchService`.
  - Saved jobs: domain logic lives in controller (`SavedJobController`) rather than service/use-case abstraction (inconsistent with jobs/applications).
- **Duplication in validation logic**:
  - `JobStoreRequest` and `JobUpdateRequest` duplicate `salary_range` parsing and validation patterns.
- **Repository hygiene that impacts maintainability** (not a refactor, but affects modularity/velocity):
  - `backend/vendor/` and `backend/.env` appear committed; this typically increases repo noise and complicates collaboration/reviews.

### Frontend

- **“Fat” client components**:
  - `frontend/src/app/jobs/JobsClient.tsx` is a major hotspot: URL <-> state syncing, query building, fetching jobs, applied/saved state, sidebar saved jobs, UI rendering, and modal control all in one file.
- **Duplicate async patterns**:
  - Many pages repeat a similar fetch lifecycle: `loading/error/data`, `alive` flags, pagination state, and re-fetch logic.
- **Duplicate domain logic**:
  - Resume file validation and blob download logic are repeated in multiple places (`ProfilePage`, `ApplicationForm`, `ApplicationDetailsDialog`).
  - Application status lists are duplicated (`ApplicantsTable` and `ApplicationDetailsDialog`).
- **Tight coupling to API endpoints**:
  - Endpoint strings (e.g., `"employer/jobs"`, `"saved-jobs/ids"`) are scattered; changing an endpoint requires hunting through UI code.
- **Contract drift risk**:
  - Types are handwritten in `frontend/src/lib/types.ts` and may diverge from backend `JsonResource` outputs over time (especially for nested shapes like employer/applicant resources).
- **Repository hygiene**:
  - `frontend/node_modules/` and `frontend/.next/` appear present in repo; this materially hurts maintainability (diff noise, huge checkout size, slower CI).

## 3) Refactor Opportunities (High-Level Only)

### Opportunity A — Backend: Consolidate “Job Query” concerns (filters/sort/pagination) into reusable request + query builder

- **What**: Introduce a dedicated query/request object (e.g., `JobIndexRequest`) + a single “job query” builder that:
  - Validates filters once, clamps pagination once, applies sorting once.
  - Is reused by `JobController`, `EmployerJobController`, `RecommendationController`.
- **Pros**: Removes duplication; makes filters consistent; easier to add new filters; fewer bugs.
- **Cons**: Slight upfront complexity; must preserve existing behavior precisely.
- **Risk/Effort**: **Risk: Medium / Effort: Medium**
- **What could break**: Filter semantics (`is_remote`, salary handling), default sort order, pagination meta, and tests that assert result ordering.

### Opportunity B — Backend: Move resume storage concerns to a dedicated service (and align “resume download” authorization)

- **What**: Centralize resume file operations (store/delete/copy/metadata) into a `ResumeService` used by:
  - `ProfileController` (profile resume upload/download/delete),
  - `ApplicationService` (apply with uploaded resume or profile resume),
  - `EmployerApplicationController` (download application resume),
  - plus optionally introduce `ApplicationPolicy` for ownership checks.
- **Pros**: Clear boundary; less repeated Storage logic; easier to test; consistent file naming and error handling.
- **Cons**: Refactor touches multiple flows; requires careful testing of file paths and permission checks.
- **Risk/Effort**: **Risk: Medium / Effort: Medium**
- **What could break**: Resume download endpoints, stored file paths, profile resume reuse on application, and existing feature tests around resumes.

### Opportunity C — Frontend: Introduce a small “API client” layer per domain (jobs/applications/profile/auth)

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
   - Keep Laravel “classic” structure (Controllers + FormRequests + Services), or move toward a domain/feature module layout (e.g., `Domains/Jobs`, `Domains/Applications`)?
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
