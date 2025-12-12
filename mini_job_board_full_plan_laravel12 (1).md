# Mini Job Board – Full Implementation Plan (Laravel 12 API + Next.js Frontend)

This is a step-by-step build plan you can hand to a coding agent (Codex) to implement the **Mini Job Board Application** end-to-end, using **Laravel 12** (backend) and **Next.js** (frontend).

---

## 0) Goals & Scope

### Core features (required)
- **Auth**: Register/Login with email + password
- **Roles**: `employer`, `applicant` and route protections
- **Jobs**
  - Employer: create/edit/delete/view *own* jobs
  - Applicant: browse **published** jobs only
  - Fields: `title`, `description`, `location`, `salary_range`, `is_remote`, `status`, `published_at` *(auto-set when published)*
- **Applications**
  - Applicant applies to a job with a short message
  - Employer can view applicants for their own job(s)
- **REST standards**
  - JSON responses
  - validation + consistent error handling

### Bonus features (optional)
- Pagination for job listings
- Resume upload
- Email notifications on application submission
- Unit/feature tests

---

## 1) Proposed Tech Stack

### Backend
- **Laravel 12**
- **PHP 8.2+** (8.3 recommended if your environment supports it)
- **Laravel Sanctum** (token auth for SPA)
- MySQL or PostgreSQL

### Frontend
- Next.js (App Router), React
- Tailwind CSS + shadcn/ui
- State management: Zustand (or React Context + reducer)
- API client: fetch wrapper or Axios

### Tooling
- Laravel Pint (formatting)
- ESLint + Prettier
- Docker (optional but recommended)
- Postman collection for API testing

---

## 2) Repository Layout (Deliverable)

```
repo/
  backend/           # Laravel 12 app
  frontend/          # Next.js app
  postman/           # API collection + env
  README.md
```

---

## 3) Domain Model & Database Design

### 3.1 Entities

#### users
- `id` (pk)
- `name` (string)
- `email` (string, unique)
- `email_verified_at` (timestamp, nullable) *(Laravel default)*
- `password` (hashed)
- `role` (string: `employer` | `applicant`, default `applicant`, indexed)
- `remember_token` (string, nullable) *(Laravel default)*
- timestamps

> Note: Laravel’s default auth stack also creates `password_reset_tokens` and `sessions` tables. They’re not domain-specific, but keeping them is fine and useful for standard auth/session flows.

#### jobs
- `id` (pk)
- `employer_id` (fk -> users.id, restrict on delete)
- `title` (string)
- `description` (text)
- `location` (string, nullable)
- `salary_range` (string, nullable) *(simple)*
- `is_remote` (boolean, default false)
- `status` (string: `draft` | `published`, default `draft`)
- `published_at` (timestamp, nullable) *(set when status becomes `published`)*
- timestamps
- indexes:
  - (`status`, `created_at`) for public published feed
  - (`employer_id`, `created_at`) for employer dashboard
  - (`employer_id`, `status`, `created_at`) for employer filtering

#### applications
- `id` (pk)
- `job_id` (fk -> jobs.id, cascade on delete)
- `applicant_id` (fk -> users.id, restrict on delete)
- `message` (text)
- `status` (string, default `submitted`) *(workflow-friendly: `submitted` | `reviewed` | `rejected` | `shortlisted`)*
- `resume_path` (string, nullable) *(bonus)*
- `resume_original_name` (string, nullable) *(bonus metadata)*
- `resume_mime` (string, nullable) *(bonus metadata)*
- `resume_size` (unsigned bigint, nullable) *(bonus metadata)*
- timestamps
- unique constraint (recommended): `unique(job_id, applicant_id)` to prevent duplicates
- indexes:
  - (`job_id`, `created_at`) for employer applicant views
  - (`applicant_id`, `created_at`) for applicant history

---

## 4) Backend Plan (Laravel 12)

### 4.1 Setup Steps (Laravel 12)
From repo root:

```bash
mkdir backend && cd backend
composer create-project laravel/laravel .
php artisan --version
```

Configure `.env`:
- `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`

Run base migrations:

```bash
php artisan migrate
```

### 4.2 Install Sanctum (token auth)
```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

API guard usage:
- Use `auth:sanctum` middleware for protected API routes.
- Issue tokens from login/register.

### 4.3 CORS for frontend
In `config/cors.php`, ensure `allowed_origins` includes:
- `http://localhost:3000` (Next.js dev)
- Your deployed frontend domain (if applicable)

### 4.4 Optional: Breeze API scaffolding (speed boost)
If you want a quick auth baseline, you can use Breeze and keep everything API-first.

```bash
composer require laravel/breeze --dev
php artisan breeze:install api
php artisan migrate
```

Then adapt endpoints/flows to your needs (roles, tokens, etc.).  
If you prefer total control, skip Breeze and implement custom `AuthController` (recommended for consistency with this plan).

---

## 5) Auth Strategy (Sanctum Token Mode)

### 5.1 Endpoints
- On register/login:
  - Validate credentials
  - Create and return a token:
    - `user->createToken('auth')->plainTextToken`
- Frontend stores token and sends:
  - `Authorization: Bearer <token>`

### 5.2 Logout
- `POST /api/auth/logout`:
  - Revoke the current token (or all tokens).

---

## 6) Roles & Authorization (must enforce on backend)

Implement both:
- **Role middleware**: broad route protection
- **Policies**: ownership rules for jobs & viewing applicants

### 6.1 Role middleware
Create middleware `EnsureUserRole`:
- Usage: `role:employer` or `role:applicant`
- Return 403 JSON if mismatch.

### 6.2 Policies
- `JobPolicy`
  - `update/delete/viewApplications`: employer who owns the job
- `ApplicationPolicy` (optional)
  - `view`: employer owner of related job
  - `create`: applicant only

Register in `AuthServiceProvider`.

---

## 7) API Response Standards

Keep consistent JSON and HTTP codes:

- Success: `200/201`
  - `{ "data": ..., "meta": ... }`
- Validation: `422`
  - `{ "message": "Validation error", "errors": { "field": ["..."] } }`
- Unauthorized: `401`
- Forbidden: `403`
- Not found: `404`

---

## 8) Validation (Form Requests)

Create:
- `RegisterRequest`, `LoginRequest`
- `JobStoreRequest`, `JobUpdateRequest`
- `ApplicationStoreRequest`

Rules (suggested):
- Users:
  - `email` unique
  - `role` in `employer,applicant`
- Jobs:
  - `title` required (min 3)
  - `description` required
  - `status` in `draft,published`
  - `is_remote` boolean
- Applications:
  - `message` required
  - `resume` (bonus): `mimes:pdf,doc,docx|max:5120`

---

## 9) API Routes (Laravel 12)

Base prefix: `/api`

### 9.1 Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout` (auth)
- `GET  /api/auth/me` (auth)

### 9.2 Public jobs browsing
- `GET  /api/jobs` → list **published** jobs (pagination bonus)
- `GET  /api/jobs/{job}` → only if `status=published`

### 9.3 Employer-only
- `GET    /api/employer/jobs`
- `POST   /api/employer/jobs`
- `PATCH  /api/employer/jobs/{job}`
- `DELETE /api/employer/jobs/{job}`
- `GET    /api/employer/jobs/{job}/applications`

### 9.4 Applicant-only
- `POST /api/jobs/{job}/apply`

Routing example (routes/api.php):

```php
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

Route::get('jobs', [JobController::class, 'index']);
Route::get('jobs/{job}', [JobController::class, 'show']);

Route::middleware(['auth:sanctum', 'role:applicant'])->group(function () {
    Route::post('jobs/{job}/apply', [ApplicationController::class, 'store']);
});

Route::middleware(['auth:sanctum', 'role:employer'])->prefix('employer')->group(function () {
    Route::get('jobs', [EmployerJobController::class, 'index']);
    Route::post('jobs', [EmployerJobController::class, 'store']);
    Route::patch('jobs/{job}', [EmployerJobController::class, 'update']);
    Route::delete('jobs/{job}', [EmployerJobController::class, 'destroy']);
    Route::get('jobs/{job}/applications', [EmployerJobController::class, 'applications']);
});
```

---

## 10) Controllers & Services

Controllers:
- `AuthController`
- `JobController` (public browse)
- `EmployerJobController` (employer CRUD)
- `ApplicationController` (apply)

Service layer (recommended):
- `JobService`:
  - create/update/delete
  - enforce any “publish” rules
- `ApplicationService`:
  - enforce uniqueness
  - handle resume upload (bonus)
  - trigger email notification (bonus)

Keep controllers thin (validate → authorize → call service → return JSON).

---

## 11) Query Rules

### Public job list
- `where status = published`
- `orderBy created_at desc`
- Paginate (bonus): `paginate(per_page)`

### Employer jobs
- `where employer_id = auth()->id()`

### Employer view applicants
- Authorize job ownership
- Load:
  - `applications.applicant` relationship (applicant user info)

### Applicant apply
- Ensure job is published
- Ensure unique per applicant (`unique(job_id, applicant_id)`)

---

## 12) Pagination (Bonus)

For `GET /api/jobs`:
- Accept `?page=1&per_page=10`
- Return:
  - `data`: job items
  - `meta`: `{ current_page, last_page, per_page, total }`

Frontend:
- Next/Prev buttons + page indicator.

---

## 13) Resume Upload (Bonus)

Backend:
- Add `resume_path` (and optional resume metadata columns) to `applications`
- Store file:
  - `storage/app/public/resumes`
- Run:
  ```bash
  php artisan storage:link
  ```
- Save path in DB.

Frontend:
- Add file input in apply form
- Submit as `multipart/form-data`

---

## 14) Email Notification (Bonus)

On successful application:
- Notify employer via Mail/Notification.
- Optional queue:
  - configure database queue
  - use `queue_jobs` as the queue table name to avoid clashing with the domain `jobs` table
  - run worker: `php artisan queue:work`

---

## 15) Frontend Plan (Next.js)

### 15.1 Setup
```bash
mkdir frontend && cd frontend
npx create-next-app@latest .
```

Install UI libs:
- Tailwind (if not already via template)
- shadcn/ui init
- Zustand
- (optional) react-hook-form + zod for forms

`.env.local`:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

### 15.2 Auth store (Zustand)
- state: `{ user, token, role, loading }`
- actions: `login`, `register`, `logout`, `fetchMe`
- persist token to localStorage
- on app init: if token exists → `fetchMe`

### 15.3 Route protection
- `Protected` wrapper:
  - if no token → `/login`
  - if role mismatch → `/dashboard` or show 403 page

### 15.4 Pages
Auth:
- `/register` (role selection)
- `/login`
- `/dashboard` (role-aware)

Applicant:
- `/jobs` (published list + pagination)
- `/jobs/[id]` (details + apply)

Employer:
- `/employer/jobs` (list + create)
- `/employer/jobs/new`
- `/employer/jobs/[id]/edit`
- `/employer/jobs/[id]/applications`

### 15.5 Components
- `JobCard`, `JobList`
- `JobForm`
- `ApplicationForm` (message + resume)
- `ApplicantsTable`
- `AuthForm`
- `Navbar`

### 15.6 API client wrapper
- Adds base URL
- Adds `Authorization` header
- Normalizes errors:
  - 422 returns field errors
  - 401 triggers logout

---

## 16) Postman Collection (Deliverable)

Create `postman/mini-job-board.postman_collection.json`:
- Register employer
- Register applicant
- Login
- Me
- Employer CRUD jobs
- Public list jobs
- Applicant apply
- Employer view applications

Include environment: `baseUrl`.

---

## 17) Testing Plan (High-value Bonus)

### Laravel feature tests
- Auth:
  - register/login returns token
  - me requires auth
- Roles:
  - applicant blocked from employer routes (403)
  - employer blocked from apply (403)
- Jobs:
  - employer can CRUD own jobs
  - employer cannot edit others (403)
  - applicant sees only published jobs
- Applications:
  - applicant can apply once
  - employer can view applications only for own job

Commands:
```bash
php artisan test
```

---

## 18) Implementation Order (Checklist)

### Phase A — Backend foundation
- [ ] Create Laravel 12 project
- [ ] Configure DB + migrate
- [ ] Install Sanctum
- [ ] Add `role` to users
- [ ] Create migrations/models: Jobs, Applications
- [ ] Add relationships

### Phase B — Backend API
- [ ] AuthController (register/login/logout/me)
- [ ] Role middleware
- [ ] Policies (JobPolicy)
- [ ] Employer CRUD endpoints
- [ ] Public browse endpoints
- [ ] Apply endpoint + uniqueness
- [ ] Employer view applicants endpoint
- [ ] Pagination (bonus)
- [ ] Resume upload (bonus)
- [ ] Email notification (bonus)
- [ ] Feature tests (bonus)

### Phase C — Frontend foundation
- [ ] Create Next.js app
- [ ] Tailwind + shadcn/ui setup
- [ ] API client wrapper
- [ ] Zustand auth store + persistence
- [ ] Protected routing + role gating

### Phase D — Frontend features
- [ ] Applicant: list + detail + apply
- [ ] Employer: job list + create/edit/delete
- [ ] Employer: applicants view
- [ ] Loading/error states
- [ ] Pagination UI (bonus)
- [ ] Resume upload UI (bonus)

### Phase E — Deliverables polish
- [ ] README with exact setup commands
- [ ] Postman collection + env
- [ ] Ensure clean run instructions for both apps

---

## 19) Definition of Done (Acceptance Criteria)

### Backend
- All required endpoints exist & return JSON
- Validation uses 422 with field errors
- Authorization enforced server-side:
  - employer owns job for CRUD/applicants
  - applicant only applies to published jobs
- Optional: pagination, resume upload, notifications

### Frontend
- Register/login works; dashboard differs by role
- Applicant can browse and apply
- Employer can CRUD jobs and view applicants
- Basic UX: loading + error handling

### Deliverables
- Repo structure with `backend/` + `frontend/`
- README, Postman collection included

---

## 20) Guardrails for Codex
- Always enforce authorization on the backend (never rely on UI-only role checks).
- Keep controllers thin; prefer services for business logic.
- Return consistent JSON responses and correct HTTP status codes.
- Prefer clarity over over-engineering.
