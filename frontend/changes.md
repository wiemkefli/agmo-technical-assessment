# Frontend Setup & Integration Changes

Date: 2025-12-12

This file documents the frontend work performed to implement the Mini Job Board per:
- `mini_job_board_full_plan_laravel12 (1).md`
- `Full Stack Engineer Technical Assessment.md`

## 1) Project Scaffold
- Created a Next.js app in `frontend/` using App Router + TypeScript + Tailwind + ESLint.
- Installed Zustand for state management: `npm install zustand`.
- Added environment config in `frontend/.env.local`:
  - `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api`

## 2) Shared Types & API Client
Added:
- `frontend/src/lib/types.ts`
  - Types for `User`, `Job`, `Application`, pagination meta, and `JobFormPayload`.
- `frontend/src/lib/api.ts`
  - `apiRequest<T>()` fetch wrapper with:
    - Base URL from env
    - Bearer token support (`Authorization: Bearer …`)
    - JSON vs `FormData` handling
    - Consistent error shaping via `APIError`
  - `apiPaginated<T>()` helper.
  - `getErrorMessage()` helper for UI error messages.

## 3) Auth Store (Zustand)
Added:
- `frontend/src/store/auth.ts`
  - Persistent auth state (`token`, `user`, `role`) stored in localStorage.
  - Actions:
    - `login(email, password)` → `/api/auth/login`
    - `register({name,email,password,password_confirmation,role})` → `/api/auth/register`
    - `logout()` → `/api/auth/logout`
    - `fetchMe()` → `/api/auth/me`

## 4) UI Components
Added:
- `frontend/src/components/Protected.tsx`
  - Client-side route guard; redirects to `/login` if no token.
  - Optional role gating (`roles={["employer"]}` etc).
- `frontend/src/components/Navbar.tsx`
  - Shows navigation based on auth + role.
- `frontend/src/components/JobCard.tsx`
  - Displays a job summary card.
- `frontend/src/components/JobForm.tsx`
  - Create/edit job form for employers.
- `frontend/src/components/ApplicationForm.tsx`
  - Applicant apply form with optional resume file.
- `frontend/src/components/ApplicantsTable.tsx`
  - Employer view of applications per job.

## 5) App Pages & Routing
Updated:
- `frontend/src/app/layout.tsx`
  - App title/description
  - Global layout with `Navbar` + main container.
- `frontend/src/app/page.tsx`
  - Redirects `/` → `/jobs`.

Added pages per plan:
- Auth:
  - `frontend/src/app/login/page.tsx`
  - `frontend/src/app/register/page.tsx`
- Dashboard:
  - `frontend/src/app/dashboard/page.tsx` (role-aware)
- Public jobs:
  - `frontend/src/app/jobs/page.tsx`
  - `frontend/src/app/jobs/JobsClient.tsx`
    - Client component wrapped in `Suspense` to satisfy Next.js build rule for `useSearchParams`.
  - `frontend/src/app/jobs/[id]/page.tsx`
    - Job details + apply (applicant-only).
- Employer:
  - `frontend/src/app/employer/jobs/page.tsx`
  - `frontend/src/app/employer/jobs/new/page.tsx`
  - `frontend/src/app/employer/jobs/[id]/edit/page.tsx`
  - `frontend/src/app/employer/jobs/[id]/applications/page.tsx`

All protected routes use `Protected` and call the matching backend endpoints.

## 6) Backend Integration Adjustments
To make frontend flows work cleanly:
- Added CORS config allowing Next.js dev origin:
  - `backend/config/cors.php` with `allowed_origins: ['http://localhost:3000']`.
- Added employer “show job” endpoint for edit page:
  - `GET /api/employer/jobs/{job}` in `backend/routes/api.php`
  - `show()` in `backend/app/Http/Controllers/EmployerJobController.php`

## 7) Validation / Smoke Checks
- Frontend lint/build passed:
  - `npm run lint`
  - `npm run build`
- Resolved ESLint rules for strict TS (`no-explicit-any`) and Next App Router CSR/Suspense requirement.

## 8) How to Run
Backend:
```bash
cd backend
php artisan config:clear
php artisan serve
```

Frontend:
```bash
cd frontend
npm run dev
```

Open `http://localhost:3000`.

Demo accounts (from seeder):
- Employer: `employer@example.com` / `password`
- Applicant: `applicant@example.com` / `password`

