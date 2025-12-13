# Evaluation Report: agmo-technical-assessment

## 1. Repo Summary

- **Stack**
  - Backend: Laravel **12** + PHP **^8.2** + **Sanctum** token auth (`backend/composer.json:9`, `backend/composer.json:10`, `backend/composer.json:11`)
  - Frontend: Next.js **16.0.10** + React **19.2.1** + Zustand **5** + Tailwind CSS **4** (`frontend/package.json:12`, `frontend/package.json:13`, `frontend/package.json:15`, `frontend/package.json:24`, `frontend/src/app/globals.css:1`)
- **Architecture**
  - `backend/`: JSON REST API under `/api/*` (`backend/routes/api.php:14`, `backend/routes/api.php:48`)
  - `frontend/`: Next.js App Router pages in `frontend/src/app/*` calling the API via a fetch wrapper (`frontend/src/lib/api.ts:14`, `frontend/src/lib/api.ts:45`)
- **How to run locally (NOT documented in repo)**
  - There is **no root** `README.md` (checked `C:\Projects\agmo-technical-assessment\README.md`).
  - Inferred minimum:
    - Backend: configure DB in `backend/.env.example`, run `php artisan migrate --seed`, start `php artisan serve`
    - Frontend: set `NEXT_PUBLIC_API_BASE_URL` (required by `frontend/src/lib/api.ts:14`) to something like `http://localhost:8000/api`, then `npm run dev`
- **Key folders/files**
  - Spec: `Full Stack Engineer Technical Assessment.md`
  - Backend routes: `backend/routes/api.php`
  - Frontend pages: `frontend/src/app/*`
  - Bonus/features plan doc: `mini_job_board_full_plan_laravel12 (1).md`
  - DB dump: `job_board_application.sql`

## 2. What the app does (end-to-end)

### Employer flow

- Register/login as `employer` (issues Sanctum token) -> redirected to "My Jobs" (`backend/routes/api.php:14`, `backend/app/Http/Controllers/AuthController.php:33`, `frontend/src/app/dashboard/page.tsx`)
- CRUD own jobs (draft/published) via `/api/employer/jobs*` guarded by role middleware + policies (`backend/routes/api.php:48`, `backend/app/Policies/JobPolicy.php:12`, `backend/app/Policies/JobPolicy.php:17`)
- View applicants for a job; update application status; download applicant resume if present (`backend/routes/api.php:54`, `backend/routes/api.php:59`, `backend/app/Http/Controllers/EmployerApplicationController.php:17`)

### Applicant flow

- Register/login as `applicant` (Sanctum token) (`backend/routes/api.php:14`, `backend/app/Http/Requests/RegisterRequest.php:23`)
- Browse published jobs (public); logged-in applicants see “recommended jobs” feed (`backend/app/Http/Controllers/JobController.php:32`, `frontend/src/app/jobs/JobsClient.tsx:147`)
- View job details and apply with a message + optional resume (upload PDF or use saved profile resume) (`backend/routes/api.php:39`, `backend/app/Http/Requests/ApplicationStoreRequest.php:20`, `frontend/src/app/jobs/[id]/page.tsx`)
- Manage profile + upload/view/download/delete saved resume (`backend/routes/api.php:24`, `backend/routes/api.php:32`, `frontend/src/app/profile/page.tsx`)
- Track applied jobs and saved jobs (`backend/routes/api.php:37`, `backend/routes/api.php:42`, `frontend/src/app/applied-jobs/page.tsx`, `frontend/src/app/saved-jobs/page.tsx`)

### Main API endpoints used by the UI

- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` (`backend/routes/api.php:14`, `backend/routes/api.php:17`)
- Public jobs: `GET /api/jobs`, `GET /api/jobs/{job}` (`backend/routes/api.php:27`, `backend/app/Http/Controllers/JobController.php:32`)
- Applicant-only: `POST /api/jobs/{job}/apply`, `GET /api/applied-jobs`, `GET /api/recommended-jobs`, saved jobs + profile/resume (`backend/routes/api.php:31`, `backend/routes/api.php:39`, `backend/routes/api.php:41`)
- Employer-only: `/api/employer/jobs*`, `/api/employer/jobs/{job}/applications`, `/api/employer/applications/{application}(/resume)` (`backend/routes/api.php:48`, `backend/routes/api.php:54`, `backend/routes/api.php:56`)

## 3. Requirements Checklist (spec: `Full Stack Engineer Technical Assessment.md`)

Status values: **PASS / PARTIAL / FAIL / NOT FOUND**

| Requirement | Status | Evidence |
|---|---:|---|
| **Backend: REST API exists and returns JSON consistently** | **PASS** | API routes/resources exist (`backend/routes/api.php:14`) and API exception handling is forced to JSON for `/api/*` (`backend/bootstrap/app.php:23`) |
| Register/Login using email + password | **PASS** | `POST /api/auth/register`, `POST /api/auth/login` (`backend/routes/api.php:14`); token issuance (`backend/app/Http/Controllers/AuthController.php:33`) |
| Uses Sanctum or Passport (confirm which and how) | **PASS** | Sanctum dependency + `auth:sanctum` middleware (`backend/composer.json:11`, `backend/routes/api.php:17`) |
| Exactly two roles: employer, applicant | **PASS** | Validation restricts roles (`backend/app/Http/Requests/RegisterRequest.php:23`); users table has `role` (`backend/database/migrations/0001_01_01_000000_create_users_table.php`) |
| Middleware/guards protect endpoints correctly | **PASS** | Role middleware alias + route groups (`backend/bootstrap/app.php:15`, `backend/routes/api.php:31`, `backend/routes/api.php:48`) |
| Prevent privilege escalation (employer-only endpoints blocked for applicant) | **PASS** | Role middleware blocks (`backend/app/Http/Middleware/EnsureUserRole.php:16`); job policy enforces ownership (`backend/app/Policies/JobPolicy.php:17`) |
| Employer can Create/Edit/Delete/View **own** jobs only | **PASS** | Employer jobs filter + policy authorize (`backend/app/Http/Controllers/EmployerJobController.php:41`, `backend/app/Http/Controllers/EmployerJobController.php:72`, `backend/app/Policies/JobPolicy.php:17`) |
| Applicant can browse all **published** jobs | **PASS** | Jobs index filters `status=published`, show 404s if not published (`backend/app/Http/Controllers/JobController.php:32`, `backend/app/Http/Controllers/JobController.php:53`) |
| Job fields exist: `title`, `description`, `location`, `salary_range`, `is_remote`, `status` | **PASS** | API exposes `salary_range` in job JSON (`backend/app/Http/Resources/JobResource.php:31`) and accepts `salary_range` on create/update by parsing into `salary_min`/`salary_max` (`backend/app/Http/Requests/JobStoreRequest.php:43`, `backend/app/Http/Requests/JobUpdateRequest.php:43`) |
| Status/publishing logic implemented correctly | **PASS** | Published-only visibility + `published_at` set/cleared when status changes (`backend/app/Http/Controllers/JobController.php:32`, `backend/app/Services/JobService.php:50`) |
| Applicant can apply with a short message | **PASS** | Message required + stored (`backend/app/Http/Requests/ApplicationStoreRequest.php:20`, `backend/app/Http/Controllers/ApplicationController.php`) |
| Employer can view applicants for **their** jobs only | **PASS** | Job policy + employer_id checks for resume/status updates (`backend/app/Http/Controllers/EmployerJobController.php:97`, `backend/app/Http/Controllers/EmployerApplicationController.php:17`) |
| Proper REST conventions (routes, verbs, status codes) | **PASS** | CRUD uses GET/POST/PATCH/DELETE; create returns 201 (`backend/routes/api.php:48`, `backend/app/Http/Controllers/EmployerJobController.php:67`) |
| Validation + meaningful error responses | **PASS** | FormRequests + explicit 401 + 422 ValidationException messages (`backend/app/Http/Requests/JobStoreRequest.php`, `backend/app/Http/Controllers/AuthController.php:50`, `backend/app/Services/ApplicationService.php:18`) |
| Authorization policies/guards used appropriately | **PASS** | JobPolicy + `authorize()` used; role middleware used on groups (`backend/app/Policies/JobPolicy.php:17`, `backend/app/Http/Controllers/EmployerJobController.php:72`, `backend/routes/api.php:48`) |
| **Frontend: Register/Login pages have client-side validation** | **PASS** | Register validation + password mismatch UI (`frontend/src/app/register/page.tsx:50`, `frontend/src/app/register/page.tsx:160`); login uses required fields (`frontend/src/app/login/page.tsx`) |
| Frontend integrates correctly with backend auth | **PASS** | Calls `auth/login` and stores `token` (`frontend/src/store/auth.ts:30`, `frontend/src/store/auth.ts:45`) |
| Dashboard shows different content for employer vs applicant | **PASS** | Role-based redirect and navbar behavior (`frontend/src/app/dashboard/page.tsx`, `frontend/src/components/Navbar.tsx`) |
| Applicant: browse jobs, view details, apply | **PASS** | Jobs list + detail + apply flow (`frontend/src/app/jobs/JobsClient.tsx`, `frontend/src/app/jobs/[id]/page.tsx`) |
| Employer: CRUD jobs, view applicants | **PASS** | Employer jobs page + applications modal (`frontend/src/app/employer/jobs/page.tsx:76`, `frontend/src/components/EmployerApplicationsModal.tsx`) |
| State management uses store/context + auth persisted | **PASS** | Zustand `persist()` to `localStorage` (`frontend/src/store/auth.ts:30`, `frontend/src/store/auth.ts:111`) |
| API integration (base URL/env, shared client) | **PASS** | `NEXT_PUBLIC_API_BASE_URL` + `Accept: application/json` + bearer header (`frontend/src/lib/api.ts:14`, `frontend/src/lib/api.ts:45`, `frontend/src/lib/api.ts:51`) |
| UI framework identified and used consistently | **PASS** | Tailwind v4 import and Tailwind usage across components (`frontend/src/app/globals.css:1`) |
| **Deliverables: root README.md includes backend+frontend setup** | **FAIL** | No root `README.md` present; `backend/README.md` and `frontend/README.md` are boilerplate templates |
| Deliverables: README includes tech stack summary | **FAIL** | Same as above (no root README) |
| Deliverables: README includes migrations/seeds instructions | **FAIL** | Same as above (no root README) |
| Postman/Insomnia collection exists | **NOT FOUND** | Searched repo for `*.postman_collection.json`, `*.postman_environment.json`, `*insomnia*` (excluding `backend/vendor` + `frontend/node_modules`); none found |
| **Bonus: Email notifications** | **NOT FOUND** | No mail/notification sending logic found (only default `Notifiable` trait reference) |
| Bonus: Pagination in job listings | **PASS** | Backend uses `paginate()`; frontend supports `page`/`per_page` (`backend/app/Http/Controllers/JobController.php`, `frontend/src/app/jobs/JobsClient.tsx`) |
| Bonus: Resume file upload | **PASS** | Profile resume endpoints + application resume upload + employer download (`backend/routes/api.php:32`, `backend/app/Services/ApplicationService.php:44`) |
| Bonus: Unit/feature tests (backend/frontend) | **PASS** | Backend feature tests cover auth/roles, employer ownership, application rules, saved jobs, recommendations, resume flows, and API contract (`backend/tests/Feature/AuthFlowTest.php`, `backend/tests/Feature/EmployerJobAuthorizationTest.php`, `backend/tests/Feature/ApplicantApplicationRulesTest.php`, `backend/tests/Feature/SavedJobsTest.php`, `backend/tests/Feature/RecommendationsTest.php`, `backend/tests/Feature/PublicJobsContractTest.php`) |

## 4. Top Issues (highest impact first)

### 4.1 Missing required deliverables (README + Postman/Insomnia collection)

- **Symptom**: No root `README.md`; no API collection files
- **Why it fails spec**: Deliverables explicitly required
- **Where to fix**: add `README.md` at repo root; add `postman/*.postman_collection.json`
- **Suggested fix**: document env vars (`NEXT_PUBLIC_API_BASE_URL`, DB), migrations/seeds (`php artisan migrate --seed`), and include a ready-to-run Postman collection for all `/api/*` routes

## 5. Nice-to-have improvements

- Consider storing auth tokens in more secure mechanisms depending on threat model (localStorage is XSS-sensitive)

## 6. Final verdict

**Does not meet spec**

- Missing required deliverables: no root `README.md`, no Postman/Insomnia collection
