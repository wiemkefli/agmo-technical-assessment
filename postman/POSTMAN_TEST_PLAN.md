# Mini Job Board API — Postman Test Plan

This plan is derived from the actual Laravel route table (`backend/routes/api.php`) and verified via `php artisan route:list --json`.

## Base setup

- `base_url`: `http://localhost:8000`
- `api_prefix`: `/api`
- Auth: Laravel Sanctum personal access token via `Authorization: Bearer <token>`

### Test accounts + data strategy

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
- Applicant-only: applied jobs list + apply
- Employer-only: view applicants for a job + update application status
- Profile (auth-only): `GET /profile`, `PATCH /profile`

Note: The API also includes bonus endpoints for saved jobs and resume upload/download, but this plan/collection intentionally skips those tests.

## Coverage matrix

| Requirement bucket | Endpoint(s) | Who can call | Key assertions |
|---|---|---|---|
| Auth register/login | `POST /auth/register`, `POST /auth/login` | public | 201/200; JSON has `token` + `data.role` |
| Auth session | `POST /auth/logout`, `GET /auth/me` | authenticated | 200; `data.id` matches token user |
| Roles enforcement | employer/applicant route groups | role-based | applicant hitting employer routes -> 403 |
| Jobs employer CRUD | `GET/POST/PATCH/DELETE /employer/jobs` | employer | 201/200; only owns jobs; other employer -> 403 |
| Jobs applicant browse | `GET /jobs`, `GET /jobs/{job}` | public | list only `status=published`; draft details -> 404 |
| Applications apply | `POST /jobs/{job}/apply` | applicant | 201; cannot apply to draft -> 422 `errors.job`; cannot apply twice -> 422 |
| Employer view applicants | `GET /employer/jobs/{job}/applications` | employer (owner) | 200; array of applications w/ `applicant` populated |
| Validation & errors | all form requests | varies | 422 JSON `message` + `errors`; 401 unauth; 404 not found |

## Detailed test cases (by Postman suite)

### Auth suite

1. Register Employer -> token returned
2. Register Applicant -> token returned
3. Login Employer -> saves `token_employer`
4. Login Applicant -> saves `token_applicant`
5. Me (Employer/Applicant) -> 200
6. (Optional) Logout -> 200 (not included in the `postman/1auth` CLI suite to keep tokens usable for subsequent suites)

### Jobs — Employer suite

1. List Own Jobs -> 200 + pagination `meta`
2. Create Job (Draft) -> 201; saves `job_id`
3. Get Single Own Job -> 200
4. Update Job -> 200
5. Create Job (Published) -> 201; saves `published_job_id`

### Jobs — Applicant suite

1. Browse Published Jobs -> 200 + pagination `meta`
2. View Job Details (Published) -> 200
3. Negative: view draft via public endpoint -> 404
4. Negative: applicant tries employer route -> 403

### Applications suite

1. Apply to Job -> 201; saves `application_id`
2. Apply Again -> 422 with `errors.job`
3. Apply to Draft -> 422 with `errors.job`
4. List My Applied Jobs -> 200 + pagination `meta`
5. List My Applied Job IDs -> 200
6. Employer: View Applicants for a Job -> 200
7. Employer: Update Application Status -> 200
8. Negative: applicant cannot view applicants -> 403

### Validation suite

- Unauthenticated Profile -> 401
- Invalid Login -> 401 with `{ message: "Invalid credentials" }`
- Create Job Missing Title -> 422 with `errors.title`
- Not Found Job -> 404

### Cleanup suite

- Delete Job (Draft) -> 200 with `{ message: "Deleted" }`

## Pagination notes

- All list endpoints use `per_page` query param (default 10, max 50 via `PerPageRequest`).
- Responses include `meta.current_page`, `meta.last_page`, `meta.per_page`, `meta.total`.

## How to run

### Suite-by-suite (separate collections)

Each suite is a standalone Postman collection file under `postman/<suite>/mini-job-board.postman_collection.json`.

- Auth: `postman/1auth/mini-job-board.postman_collection.json`
- Jobs (Employer): `postman/2jobs-employer/mini-job-board.postman_collection.json`
- Jobs (Applicant): `postman/3jobs-applicant/mini-job-board.postman_collection.json`
- Applications: `postman/4applications/mini-job-board.postman_collection.json`
- Validation: `postman/5validation/mini-job-board.postman_collection.json`
- Cleanup: `postman/6cleanup/mini-job-board.postman_collection.json`

Environment:

- Recommended (single shared): `postman/local.postman_environment.json`
- Also available (duplicates): `postman/<suite>/local.postman_environment.json`

Optional (CLI per-suite):

- `newman run postman/1auth/mini-job-board.postman_collection.json -e postman/local.postman_environment.json`
- `newman run postman/2jobs-employer/mini-job-board.postman_collection.json -e postman/local.postman_environment.json`
- `newman run postman/3jobs-applicant/mini-job-board.postman_collection.json -e postman/local.postman_environment.json`
- `newman run postman/4applications/mini-job-board.postman_collection.json -e postman/local.postman_environment.json`
- `newman run postman/5validation/mini-job-board.postman_collection.json -e postman/local.postman_environment.json`
- `newman run postman/6cleanup/mini-job-board.postman_collection.json -e postman/local.postman_environment.json`
