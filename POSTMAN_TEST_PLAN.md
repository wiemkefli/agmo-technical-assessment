# Mini Job Board API — Postman Test Plan

This plan is derived from the actual Laravel route table (`backend/routes/api.php`) and verified via `php artisan route:list --json`.

## Base setup

- `base_url`: `http://localhost:8000`
- `api_prefix`: `/api`
- Auth: Laravel Sanctum personal access token via `Authorization: Bearer <token>`

### Test accounts / data strategy

**Option A (recommended): seed demo data**

1. From `backend/`: run migrations + seeders.
   - Demo credentials created by `backend/database/seeders/DatabaseSeeder.php`:
     - Employer: `employer@example.com` / `password`
     - Applicant: `applicant@example.com` / `password`
2. Use the Postman **Login Employer** / **Login Applicant** requests to capture tokens.

**Option B: create via API**

1. Run **Register Employer** and **Register Applicant** (these requests can generate unique emails).
2. Tokens are returned on register; you can skip login if you want.

## Discovered API surface (summary)

All endpoints are under `{{base_url}}{{api_prefix}}`.

- Auth: `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- Public jobs: `GET /jobs`, `GET /jobs/{job}`
- Employer jobs (employer-only): `GET/POST/PATCH/DELETE /employer/jobs[...]`, `GET /employer/jobs/{job}/applications`
- Applicant-only: applied jobs list, apply, saved jobs, profile resume upload/download/delete
- Employer-only: update application status, download application resume
- Profile (auth-only): `GET /profile`, `PATCH /profile`

## Coverage matrix

| Requirement bucket | Endpoint(s) | Who can call | Key assertions |
|---|---|---|---|
| Auth register/login | `POST /auth/register`, `POST /auth/login` | public | 201/200; JSON has `token` + `data.role` |
| Auth session | `POST /auth/logout`, `GET /auth/me` | authenticated | 200; `data.id` matches token user |
| Roles enforcement | employer/applicant route groups | role-based | applicant hitting employer routes ⇒ 403 `"Forbidden"` |
| Jobs employer CRUD | `GET/POST/PATCH/DELETE /employer/jobs` | employer | 201/200; only owns jobs; other employer ⇒ 403 |
| Jobs applicant browse | `GET /jobs`, `GET /jobs/{job}` | public | list only `status=published`; draft details ⇒ 404 |
| Applications apply | `POST /jobs/{job}/apply` | applicant | 201; cannot apply to draft ⇒ 422 `errors.job`; cannot apply twice ⇒ 422 |
| Employer view applicants | `GET /employer/jobs/{job}/applications` | employer (owner) | 200; array of applications w/ `applicant` populated |
| Validation & errors | all form requests | varies | 422 JSON `message` + `errors`; 401 unauth; 404 not found |

## Detailed test cases (by Postman folder)

### A) Auth

1. **Register Employer**
   - `POST /auth/register`
   - Body: `name`, `email`, `password`, `password_confirmation`, `role=employer`, optional `website`
   - Assert `201`, JSON has `token`, `data.role === "employer"`.
2. **Register Applicant**
   - Same endpoint; `role=applicant` and **must not** include `website` (expect 422 if present).
3. **Login Employer**
   - `POST /auth/login` → save `token_employer` from `token`.
4. **Login Applicant**
   - `POST /auth/login` → save `token_applicant` from `token`.
5. **Me (Employer/Applicant)**
   - `GET /auth/me` with bearer token → `data.role` matches.
6. **Logout**
   - `POST /auth/logout` with bearer token → 200 + `message: "Logged out"`.

### B) Jobs — Employer

1. **List Own Jobs**
   - `GET /employer/jobs?per_page=10&status=draft|published&sort=newest|oldest`
   - Assert 200; has `data` array + pagination `meta`.
2. **Create Job (Draft)**
   - `POST /employer/jobs`
   - Body (required): `title`, `description`, `location`, `salary_min`, `salary_max` (or `salary_range`), `is_remote`, `status`
   - Assert 201; save `job_id`.
3. **Get Single Own Job**
   - `GET /employer/jobs/{{job_id}}` → 200, `data.id === job_id`.
4. **Update Job**
   - `PATCH /employer/jobs/{{job_id}}` → 200; confirm updated fields.
5. **Publish Job (Update Status)**
   - `PATCH /employer/jobs/{{job_id}}` with `status=published` → save `published_job_id`.
6. **Delete Job**
   - `DELETE /employer/jobs/{{job_id}}` → 200 + `message: "Deleted"`.
7. **Negative: other employer cannot manage job**
   - Attempt `GET/PATCH/DELETE /employer/jobs/{{job_id}}` with a different employer token → 403.

### C) Jobs — Applicant

1. **Browse Published Jobs**
   - `GET /jobs?per_page=10&q=&location=&is_remote=&salary_min=&salary_max=&sort=newest|oldest`
   - Optional: `exclude_applied=1` (only meaningful when authenticated as applicant).
   - Assert 200; each item `status === "published"`; has pagination `meta`.
2. **View Job Details (Published)**
   - `GET /jobs/{{published_job_id}}` → 200, `data.id === published_job_id`.
3. **Negative: view draft job via public endpoint**
   - `GET /jobs/{{job_id}}` (if draft) → 404.
4. **Negative: applicant tries employer route**
   - `POST /employer/jobs` with applicant token → 403 `"Forbidden"`.

### D) Applications

1. **Apply to Job**
   - `POST /jobs/{{published_job_id}}/apply`
   - Body: `message` (required); optional `use_profile_resume` or a PDF file (`resume`) as multipart/form-data.
   - Assert 201; save `application_id`.
2. **Apply Again (duplicate)**
   - Re-run apply for same job → 422 with `errors.job`.
3. **List My Applied Jobs**
   - `GET /applied-jobs?per_page=10` (alias: `GET /applications`) → 200 with pagination `meta`.
4. **List My Applied Job IDs**
   - `GET /applied-jobs/ids` → 200 `data[]` objects contain `job_id` and `status`.
5. **Employer: View Applicants for a Job**
   - `GET /employer/jobs/{{published_job_id}}/applications` → 200 `data[]` contains `applicant`.
6. **Employer: Update Application Status**
   - `PATCH /employer/applications/{{application_id}}` with `status in [submitted,reviewed,shortlisted,rejected]` → 200.
7. **Employer: Download Application Resume (optional)**
   - `GET /employer/applications/{{application_id}}/resume` → 200 (file) if `has_resume=true`, otherwise 404.
8. **Negative: applicant cannot view applicants**
   - `GET /employer/jobs/{{published_job_id}}/applications` with applicant token → 403.
9. **Negative: apply to unpublished job**
   - `POST /jobs/{{job_id}}/apply` where `job_id` is draft → 422 with `errors.job`.

### E) Validation / Error handling

- Missing required fields (e.g. create job without `title`) → 422 with JSON `{ message, errors }`.
- Invalid login → 401 with `{ message: "Invalid credentials" }`.
- Unauthenticated access to protected endpoint (e.g. `GET /profile`) → 401 (`message` typically `"Unauthenticated."`).
- Wrong role hitting role-protected endpoint → 403 `{ message: "Forbidden" }`.
- Not found resource IDs → 404 `{ message: "Not Found" }` (JSON due to `backend/bootstrap/app.php`).

## Pagination notes

- All list endpoints use `per_page` query param (default 10, max 50 via `PerPageRequest`).
- Responses include `meta.current_page`, `meta.last_page`, `meta.per_page`, `meta.total`.

## File upload notes (resume)

- Applicant profile resume upload: `POST /profile/resume` (multipart `resume` PDF, max 5MB).
- Applying with resume:
  - Upload resume as multipart `resume` (PDF), or
  - Set `use_profile_resume=true` to copy the saved profile resume.

## How to run

1. Import `postman/mini-job-board.postman_collection.json` and `postman/local.postman_environment.json`.
2. Set `base_url` (and `api_prefix` if you changed it).
3. Run folder-by-folder in order: Auth → Jobs Employer → Jobs Applicant → Applications → Validation.

Optional (CLI):

`newman run postman/mini-job-board.postman_collection.json -e postman/local.postman_environment.json`

