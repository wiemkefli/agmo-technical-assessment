# Evaluation Report: `agmo-technical-assessment`

Spec source of truth: `Full Stack Engineer Technical Assessment.md`

## 1) Repo Summary

- **Stack / Versions**
  - Backend: Laravel `^12.0` + PHP `^8.2` + Sanctum `^4.2` (`backend/composer.json`)
  - Frontend: Next.js `16.0.10` + React `19.2.1` + Zustand `^5.0.9` + Tailwind `^4` + TypeScript `^5` (`frontend/package.json`, `frontend/src/app/globals.css`)
  - DB: MySQL (default config in `backend/.env.example`; DB dump exists: `job_board_application.sql`)
- **Architecture**
  - `backend/`: Laravel JSON API under `/api/*` (`backend/routes/api.php`) + Sanctum personal access tokens (bearer auth) (`backend/app/Http/Controllers/AuthController.php`, `backend/config/sanctum.php`)
  - `frontend/`: Next.js App Router pages in `frontend/src/app/*` calling the API via a shared `fetch` wrapper (`frontend/src/lib/api.ts`) and auth store (`frontend/src/store/auth.ts`)
- **How to run locally (not documented in a root README)**
  - Backend:
    - Env: `backend/.env.example` (note: a committed `backend/.env` exists and contains an `APP_KEY` and DB creds)
    - Migrate/seed: `php artisan migrate --seed` (seeds demo accounts via `backend/database/seeders/DatabaseSeeder.php`)
    - Serve: `php artisan serve` (or `composer run dev` per `backend/composer.json` scripts)
  - Frontend:
    - Env: `frontend/.env.local` sets `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api`
    - Run: `npm run dev` (`frontend/package.json`)
- **Key folders**
  - Spec: `Full Stack Engineer Technical Assessment.md`
  - Backend API: `backend/routes/api.php`, controllers in `backend/app/Http/Controllers/`
  - Frontend pages: `frontend/src/app/`, shared client/store: `frontend/src/lib/api.ts`, `frontend/src/store/auth.ts`

## 2) What the app does (end-to-end)

### Employer user journey

1. Register / login as an employer → receives a Sanctum bearer token (`POST /api/auth/register`, `POST /api/auth/login`; `backend/app/Http/Controllers/AuthController.php`)
2. Employer dashboard (“My Jobs”) lists only their jobs (`GET /api/employer/jobs`; `backend/app/Http/Controllers/EmployerJobController.php`)
3. Create / edit / delete only their own job posts (draft or published) (`POST|PATCH|DELETE /api/employer/jobs/{job}`; protected by `role:employer` and `JobPolicy`; `backend/routes/api.php`, `backend/app/Policies/JobPolicy.php`)
4. View applicants for their jobs and update application status; download resume if attached (`GET /api/employer/jobs/{job}/applications`, `PATCH /api/employer/applications/{application}`, `GET /api/employer/applications/{application}/resume`; `backend/app/Http/Controllers/EmployerJobController.php`, `backend/app/Http/Controllers/EmployerApplicationController.php`)

### Applicant user journey

1. Register / login as an applicant → receives a Sanctum bearer token (`POST /api/auth/register`, `POST /api/auth/login`; `backend/routes/api.php`)
2. Browse all published jobs on `/jobs` via `GET /api/jobs` (optional UX toggle to hide applied jobs client-side; default is to show all jobs to satisfy spec) (`backend/app/Http/Controllers/JobController.php`, `frontend/src/app/jobs/JobsClient.tsx`)
3. View a published job detail page (`GET /api/jobs/{job}`; `backend/app/Http/Controllers/JobController.php`, `frontend/src/app/jobs/[id]/page.tsx`)
4. Apply to a job with a required message and optional PDF resume (upload a file or reuse saved profile resume) (`POST /api/jobs/{job}/apply`; `backend/app/Services/ApplicationService.php`, `backend/app/Http/Requests/ApplicationStoreRequest.php`, `frontend/src/components/ApplicationForm.tsx`)
5. Save/unsave jobs and view saved/applied history (`/saved-jobs`, `/applied-jobs`; `backend/app/Http/Controllers/SavedJobController.php`, `backend/app/Http/Controllers/ApplicationController.php`)
6. Manage profile; applicants can upload/view/download/delete a saved resume (`/profile`; `backend/app/Http/Controllers/ProfileController.php`, `frontend/src/app/profile/page.tsx`)

### Main screens/pages and their API usage

- Auth: `frontend/src/app/login/page.tsx`, `frontend/src/app/register/page.tsx` → `POST /api/auth/login`, `POST /api/auth/register` (`frontend/src/store/auth.ts`)
- Applicant:
  - Job list: `frontend/src/app/jobs/page.tsx`, `frontend/src/app/jobs/JobsClient.tsx` → `GET /api/jobs` (all users); applicants also call `GET /api/saved-jobs/ids`, `GET /api/saved-jobs`, `GET /api/applied-jobs/ids` for save/apply state
  - Job detail/apply: `frontend/src/app/jobs/[id]/page.tsx` → `GET /api/jobs/{job}`, `POST /api/jobs/{job}/apply`
  - Saved jobs: `frontend/src/app/saved-jobs/page.tsx` → `GET /api/saved-jobs`, `DELETE /api/jobs/{job}/save`
  - Applied jobs: `frontend/src/app/applied-jobs/page.tsx` → `GET /api/applied-jobs?page=...&per_page=...` (paginated)
  - Profile/resume: `frontend/src/app/profile/page.tsx` → `GET|PATCH /api/profile`, `POST|GET|DELETE /api/profile/resume`
- Employer:
  - Jobs list: `frontend/src/app/employer/jobs/page.tsx` → `GET /api/employer/jobs`, `DELETE /api/employer/jobs/{job}`
  - Create: `frontend/src/app/employer/jobs/new/page.tsx` → `POST /api/employer/jobs`
  - Edit: `frontend/src/app/employer/jobs/[id]/edit/page.tsx` → `GET /api/employer/jobs/{job}`, `PATCH /api/employer/jobs/{job}`
  - Applicants: `frontend/src/app/employer/jobs/[id]/applications/page.tsx` → `GET /api/employer/jobs/{job}/applications`

## 3) Requirements Checklist

Status values: **PASS / PARTIAL / FAIL / NOT FOUND**

| Requirement | Status | Evidence |
|---|---:|---|
| **Backend: REST API exists and returns JSON consistently** | PASS | Routes under `/api/*` in `backend/routes/api.php`; JSON resources used (`backend/app/Http/Resources/*`); API exceptions forced to JSON in `backend/bootstrap/app.php` (note: resume download endpoints intentionally return a file) |
| Register/Login using email + password | PASS | `POST /api/auth/register`, `POST /api/auth/login` (`backend/routes/api.php`, `backend/app/Http/Controllers/AuthController.php`, `backend/app/Http/Requests/RegisterRequest.php`, `backend/app/Http/Requests/LoginRequest.php`) |
| Uses Sanctum or Passport (confirm which and how) | PASS | Sanctum dependency (`backend/composer.json`); routes protected by `auth:sanctum` (`backend/routes/api.php`); tokens created via `createToken()` (`backend/app/Http/Controllers/AuthController.php`) |
| **Roles: exactly two roles (employer, applicant)** | PASS | Registration restricts `role` to `in:employer,applicant` (`backend/app/Http/Requests/RegisterRequest.php`); frontend typing restricts role union (`frontend/src/lib/types.ts`) |
| Roles: middleware/guards protect endpoints correctly | PASS | `role` middleware alias (`backend/bootstrap/app.php`) and route groups in `backend/routes/api.php`; middleware returns 401/403 JSON (`backend/app/Http/Middleware/EnsureUserRole.php`) |
| Roles: prevent privilege escalation (applicant blocked from employer endpoints) | PASS | Employer group uses `role:employer` (`backend/routes/api.php`); policy checks ownership (`backend/app/Policies/JobPolicy.php`); tested in `backend/tests/Feature/EmployerJobAuthorizationTest.php` |
| **Job Listings: employer can Create/Edit/Delete/View own jobs only** | PASS | Employer endpoints (`backend/routes/api.php` → `EmployerJobController`); `JobPolicy::update/delete/viewApplications` enforce `job.employer_id === user.id` (`backend/app/Policies/JobPolicy.php`) |
| Job Listings: applicant can browse all published jobs | PASS | Public browse uses `GET /api/jobs` with published-only enforcement (`backend/app/Http/Controllers/JobController.php`); applicant UI shows all published jobs by default and only hides applied jobs when user enables “Hide applied jobs” (`frontend/src/app/jobs/JobsClient.tsx`) |
| Job Listings: fields exist (`title`, `description`, `location`, `salary_range`, `is_remote`, `status`) | PASS | Output includes these fields (`backend/app/Http/Resources/JobResource.php`); input accepts `salary_range` (and maps to min/max) (`backend/app/Http/Requests/JobStoreRequest.php`, `backend/app/Http/Requests/JobUpdateRequest.php`) |
| Job Listings: status/publishing logic correct | PASS | Publishing sets/clears `published_at` when status changes (`backend/app/Services/JobService.php`); public list sorted by `published_at` (`backend/app/Http/Controllers/JobController.php`) |
| **Job Applications: applicant can apply with a short message** | PASS | `POST /api/jobs/{job}/apply` (`backend/routes/api.php`); `message` required (`backend/app/Http/Requests/ApplicationStoreRequest.php`); create enforces published + unique (`backend/app/Services/ApplicationService.php`) |
| Job Applications: employer can view applicants for their jobs only | PASS | `GET /api/employer/jobs/{job}/applications` guarded by `JobPolicy::viewApplications` (`backend/app/Http/Controllers/EmployerJobController.php`, `backend/app/Policies/JobPolicy.php`) |
| **API standards: proper REST conventions** | PASS | Uses `GET/POST/PATCH/DELETE` on resources (`backend/routes/api.php`); create endpoints set 201 (`backend/app/Http/Controllers/AuthController.php`, `backend/app/Http/Controllers/EmployerJobController.php`, `backend/app/Http/Controllers/ApplicationController.php`) |
| API standards: validation + meaningful errors | PASS | FormRequests for auth/jobs/applications/profile (`backend/app/Http/Requests/*`); invalid login returns 401 JSON (`backend/app/Http/Controllers/AuthController.php`) |
| API standards: authorization policies/guards used appropriately | PASS | Policies registered in `backend/app/Providers/AuthServiceProvider.php`; controllers call `$this->authorize()` (`backend/app/Http/Controllers/EmployerJobController.php`) |
| **Frontend: Register/Login pages with client-side validation** | PASS | Register validates required fields/password match (`frontend/src/app/register/page.tsx`); login uses required inputs (`frontend/src/app/login/page.tsx`) |
| Frontend: correct integration with backend auth | PASS | Calls `/api/auth/*` and stores bearer token in Zustand (`frontend/src/store/auth.ts`) |
| Frontend: dashboard differs by role | PASS | Redirects employers to `/employer/jobs` and applicants to `/jobs` (`frontend/src/app/dashboard/page.tsx`, `frontend/src/components/Navbar.tsx`) |
| Frontend: applicant browse jobs, view details, apply | PASS | `/jobs`, `/jobs/[id]` + apply form (`frontend/src/app/jobs/JobsClient.tsx`, `frontend/src/app/jobs/[id]/page.tsx`, `frontend/src/components/ApplicationForm.tsx`) |
| Frontend: employer CRUD jobs, view applicants | PASS | `/employer/jobs*` pages + applicants table/modal (`frontend/src/app/employer/jobs/*`, `frontend/src/components/ApplicantsTable.tsx`) |
| Frontend: state management store + auth persistence | PASS | Zustand `persist()` stores `token/user/role` to `localStorage` (`frontend/src/store/auth.ts`) |
| Frontend: API integration (base URL/env, shared client) | PASS | `NEXT_PUBLIC_API_BASE_URL` + shared `apiRequest()` wrapper adds `Accept: application/json` and `Authorization: Bearer ...` (`frontend/src/lib/api.ts`, `frontend/.env.local`) |
| Frontend: UI framework consistent usage | PASS | Tailwind CSS v4 + Tailwind utility classes across components (`frontend/src/app/globals.css`, `frontend/src/components/*`) |
| **Deliverables: root README.md includes setup + stack + migrations/seeds** | FAIL | No root `README.md` in repo root (only `backend/README.md` and `frontend/README.md`, both template/boilerplate) |
| Deliverables: Postman/Insomnia collection exists | NOT FOUND | Searched for `*.postman_collection.json`, `*.postman_environment.json`, and `insomnia` via `rg` (excluding `backend/vendor` and `frontend/node_modules`): none found |
| **Bonus: email notifications** | NOT FOUND | Searched backend for `Mail::`, `Notification::`, and `->notify(`: none found |
| Bonus: pagination in job listings | PASS | Backend uses `paginate()` for `/api/jobs`, `/api/saved-jobs`, `/api/employer/jobs`, and `/api/applied-jobs` (`backend/app/Http/Controllers/*`); frontend uses a shared `PaginationControls` component (`frontend/src/components/PaginationControls.tsx`) on `/jobs`, `/saved-jobs`, `/employer/jobs`, and `/applied-jobs` |
| Bonus: resume file upload | PASS | Applicant profile resume upload/download/delete (`backend/app/Http/Controllers/ProfileController.php`); resume on application (`backend/app/Services/ApplicationService.php`); employer can download application resume (`backend/app/Http/Controllers/EmployerApplicationController.php`) |
| Bonus: unit/feature tests | PASS | Backend feature tests exist and cover auth/roles/ownership/application rules/public contract (`backend/tests/Feature/*`) |

## 4) Top Issues (highest impact first)

1. **Missing required deliverables (root README + Postman/Insomnia collection)**
   - Symptom: no root `README.md`; no API collection files found.
   - Why it fails spec: deliverables explicitly required in `Full Stack Engineer Technical Assessment.md`.
   - Where to fix: add `README.md` at repo root; add a `postman/` (or Insomnia export) directory.
   - Suggested fix: document env vars (`backend/.env.example`, `frontend/.env.local`), migrations/seeds (`php artisan migrate --seed`), and include requests for all endpoints in `backend/routes/api.php`.

2. **Committed backend secrets/config (`backend/.env`)**
   - Symptom: `backend/.env` contains an `APP_KEY` and DB password.
   - Why it matters: secrets should not be committed; encourages unsafe practices and can leak credentials.
   - Where to fix: remove `backend/.env` from version control; rely on `backend/.env.example`.
   - Suggested fix: add `backend/.env` to `.gitignore` and rotate/regenerate `APP_KEY` on real deployments.

## 5) Nice-to-have improvements

- Security sanity checks (confirmed): bearer-token auth (no cookie/CSRF flow), CORS allows `http://localhost:3000` only (`backend/config/cors.php`), applicant blocked from employer routes (`backend/routes/api.php`, `backend/app/Http/Middleware/EnsureUserRole.php`, `backend/tests/Feature/EmployerJobAuthorizationTest.php`), employer ownership enforced (jobs via `backend/app/Policies/JobPolicy.php`; application resume/status via `backend/app/Http/Controllers/EmployerApplicationController.php`), validation blocks invalid payloads (`backend/app/Http/Requests/*`), public job feed omits employer email (`backend/app/Http/Resources/PublicEmployerResource.php`, `backend/tests/Feature/PublicJobsContractTest.php`).
- Consider mitigating XSS impact from token-in-`localStorage` (e.g., tighter CSP, harden input rendering, or a cookie-based SPA auth model).
- CORS is pinned to `http://localhost:3000` (`backend/config/cors.php`); make this configurable for deployment.

## 6) Final verdict

**Does not meet spec**

- Required deliverables are missing: no root `README.md`, and no Postman/Insomnia collection.
- Core backend/frontend features (auth, roles, job CRUD, applications) are implemented and well-protected, but the submission is incomplete per deliverables.

