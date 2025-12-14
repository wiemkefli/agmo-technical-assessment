# Mini Job Board Application (Laravel API + Next.js)

## 1) Project Overview

This repository implements a mini job board where **employers** can create and manage job listings and **applicants** can browse published jobs and apply. The backend is a **Laravel 12** JSON REST API secured with **Laravel Sanctum** personal access tokens and role-based authorization (employer vs applicant). The frontend is a **Next.js (App Router) + React** app that provides role-aware pages for employers and applicants, including job search, job posting, and application management.

## 2) Features

### Employer features

- Register/login as an employer.
- Create, edit, publish/unpublish (`draft`/`published`), and delete **your own** job listings.
- List your jobs (paginated).
- View applications for a specific job.
- Update application status (`submitted`, `reviewed`, `shortlisted`, `rejected`).
- View/download an applicant's attached resume (if uploaded as part of an application).

### Applicant features

- Register/login as an applicant.
- Browse **published** jobs with filters and pagination.
- Apply to a job with a required message.
- Optional resume handling when applying:
  - Upload a PDF with the application, or
  - Reuse a previously uploaded profile resume.
- View applied jobs (paginated) and per-job application status.
- Save/unsave jobs and view saved jobs (paginated + IDs endpoint).
- Upload/view/download/delete a profile resume (PDF only).

### Auth + role-based access

- Token auth via **Laravel Sanctum** (`Authorization: Bearer <token>`).
- Role enforcement via `role:*` middleware (`backend/app/Http/Middleware/EnsureUserRole.php`) and Laravel policies (employers can only manage their own jobs/applications).

### Bonus features (present in this repo)

- Pagination on list endpoints (`per_page`, default 10, max 50).
- Resume upload/download (profile-level and application-level).
- Backend feature tests.
- "Exclude applied jobs" option on the public jobs feed when authenticated as an applicant.

## 3) Tech Stack

### Backend (`backend/`)

- PHP: `^8.2` (`backend/composer.json`)
- Laravel: `12.42.0` (`backend/composer.lock`, `php artisan --version`)
- Auth: Laravel Sanctum `4.2.1` (personal access tokens)
- DB (local default): MySQL (`backend/.env.example`)
- Testing: PHPUnit `11.5.46` + Laravel test runner (tests use SQLite `:memory:` via `backend/phpunit.xml`)

### Frontend (`frontend/`)

- Next.js: `16.0.10` (`frontend/package.json`)
- React / React DOM: `19.2.1`
- TypeScript: `^5`
- State management: Zustand `^5.0.9` (persisted to `localStorage`)
- Styling: Tailwind CSS `^4`
- HTTP client: `fetch` wrapper (`frontend/src/lib/api.ts`)

## 4) Repository Structure

```
.
|-- backend/                          # Laravel 12 API
|   |-- app/                           # controllers, requests, resources, policies, services
|   |-- config/
|   |-- database/                      # migrations, factories, seeders
|   |-- routes/                        # api.php defines the REST API
|   `-- tests/                         # backend feature tests
|-- frontend/                         # Next.js App Router UI
|   |-- src/
|   |   |-- app/                        # routes/pages
|   |   |-- components/
|   |   |-- lib/clients/                # API clients
|   |   `-- store/                      # Zustand auth store
|   `-- package.json
|-- postman/                          # Postman collections + environments
|   |-- JobBoard.postman_collection.json
|   |-- JobBoard.postman_environment.json
|   `-- POSTMAN_TEST_PLAN.md
|-- Full Stack Engineer Technical Assessment.md
`-- job_board_application.sql         # Optional SQL dump/reference
```

## 5) Quick Start

### Backend (Laravel API)

macOS/Linux:

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Create the MySQL database (matches `DB_DATABASE` in `backend/.env.example`)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS mini_job_board CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
# Update DB_* in backend/.env before migrating (see Backend Setup)
php artisan migrate --seed
php artisan serve
```

Windows (PowerShell):

```powershell
cd backend
composer install
Copy-Item .env.example .env
php artisan key:generate
# Create the MySQL database (matches `DB_DATABASE` in `backend/.env.example`)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS mini_job_board CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
# Update DB_* in backend/.env before migrating (see Backend Setup)
php artisan migrate --seed
php artisan serve
```

API base URL: `http://localhost:8000/api`

Seeder-created demo credentials (`backend/database/seeders/DatabaseSeeder.php`):

- Employer: `employer@example.com` / `password`
- Applicant: `applicant@example.com` / `password`

### Frontend (Next.js)

macOS/Linux:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Windows (PowerShell):

```powershell
cd frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## 6) Backend Setup

### Prereqs

- PHP `8.2+`
- Composer
- MySQL

### Install + configure

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Configure DB in `backend/.env` (see `backend/.env.example`):

- `DB_CONNECTION=mysql`
- `DB_HOST=127.0.0.1`
- `DB_PORT=3306`
- `DB_DATABASE=mini_job_board`
- `DB_USERNAME=...`
- `DB_PASSWORD=...`

### Migrate + seed

```bash
php artisan migrate --seed
```

### Run

```bash
php artisan serve
```

Notes:

- CORS allows `http://localhost:3000` by default (`backend/config/cors.php`).
- Resume files are stored on the `local` disk (`storage/app`) and served via authenticated download endpoints (no `storage:link` is required for the implemented download flow).
- Optional Laravel dev convenience: `composer dev` in `backend/` runs `php artisan serve`, `queue:listen`, `pail`, and Vite concurrently (`backend/composer.json`, `backend/package.json`).

## 7) Frontend Setup

### Prereqs

- Node.js
- npm

### Install + run

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### Build / production run

```bash
cd frontend
npm run build
npm run start
```

## 8) Environment Variables

### Backend (`backend/.env`)

Derived from `backend/.env.example` (common values for local dev):

- `APP_NAME`, `APP_ENV`, `APP_KEY`, `APP_DEBUG`, `APP_URL`
- `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- `SESSION_DRIVER` (default: `database`)
- `CACHE_STORE` (default: `database`)
- `QUEUE_CONNECTION` (default: `database`)
- `FILESYSTEM_DISK` (default: `local`)
- `MAIL_MAILER` (default: `log`)

### Frontend (`frontend/.env.local`)

- `NEXT_PUBLIC_API_BASE_URL` (required): e.g. `http://localhost:8000/api`

## 9) Database Schema

Core domain tables (from `backend/database/migrations/*`):

- `users`
  - `role`: `employer` | `applicant`
- `employer_profiles` (1:1 with `users`)
  - `user_id` (unique), `website`
- `applicant_profiles` (1:1 with `users`)
  - `user_id` (unique), `phone`, `location`
  - profile resume fields: `resume_path`, `resume_original_name`, `resume_mime`, `resume_size`
- `jobs`
  - `employer_id` -> `users.id` (restrict on delete)
  - `status`: `draft` | `published`
  - `published_at` (set when status becomes `published`)
  - salary stored as `salary_min` + `salary_max` (the API also accepts/returns `salary_range` as `min-max`)
- `applications`
  - `job_id` -> `jobs.id` (cascade on delete)
  - `applicant_id` -> `users.id` (restrict on delete)
  - unique constraint: (`job_id`, `applicant_id`) to prevent duplicate applications
  - `status`: `submitted` | `reviewed` | `shortlisted` | `rejected`
  - optional application resume fields: `resume_path`, `resume_original_name`, `resume_mime`, `resume_size`
- `saved_jobs` (many-to-many `users` <-> `jobs`)
  - unique constraint: (`user_id`, `job_id`)

Auth/supporting tables also exist (Laravel defaults + Sanctum):

- `personal_access_tokens`, `cache`, `queue_jobs` (and related queue tables), `sessions`, etc.

## 10) Authentication & Authorization

### Authentication (Sanctum bearer tokens)

- Register and login return JSON shaped like:
  - `201/200 { data: <UserResource>, token: "<sanctum_token>" }`
- The frontend stores the token in `localStorage` via Zustand (`frontend/src/store/auth.ts`) and sends it as:
  - `Authorization: Bearer <token>` (via `frontend/src/lib/api.ts`)
- Logout revokes the **current** access token (`POST /api/auth/logout`).

### Role-based access

- Route-level role checks:
  - Applicant-only routes use `auth:sanctum` + `role:applicant`.
  - Employer-only routes use `auth:sanctum` + `role:employer`.
- Resource ownership:
  - Employers can only manage jobs they own (`backend/app/Policies/JobPolicy.php`).
  - Employers can only update/view resumes for applications belonging to their jobs (`backend/app/Policies/ApplicationPolicy.php`).

## 11) Testing

### Backend

```bash
cd backend
composer test
```

Feature tests live in `backend/tests/Feature/` and cover auth, role/ownership rules, job feed contract, applying rules, saved jobs, salary parsing, and resume flows.

### Frontend

No automated test suite is included. Linting is available:

```bash
cd frontend
npm run lint
```
