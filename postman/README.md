# API Endpoints, Postman Collection, and Testing

## 11) API Endpoints

Base prefix: `/api` (see `backend/routes/api.php`)

Response conventions:

- Success responses use `data` resources/collections; list endpoints are paginated and include `meta` (Laravel paginator).
- Validation errors return `422` with `{ message, errors }`.
- Auth/authorization uses `401` (unauthenticated) and `403` (forbidden).

### Auth

- `POST /auth/register`
  - Auth: N
  - Role: N/A (sets role based on body)
  - Body (JSON): `name`, `email`, `password`, `password_confirmation`, `role` (`employer|applicant`), optional `website` (employer only)
  - Response: `201 { data: <User>, token: string }`

- `POST /auth/login`
  - Auth: N
  - Role: N/A
  - Body (JSON): `email`, `password`
  - Response: `200 { data: <User>, token: string }` (invalid credentials: `401 { message: "Invalid credentials" }`)

- `POST /auth/logout`
  - Auth: Y
  - Role: employer|applicant
  - Response: `200 { message: "Logged out" }`

- `GET /auth/me`
  - Auth: Y
  - Role: employer|applicant
  - Response: `200 { data: <User> }`

- `GET /profile`
  - Auth: Y
  - Role: employer|applicant
  - Response: `200 { data: <User> }`

- `PATCH /profile`
  - Auth: Y
  - Role: employer|applicant
  - Body (JSON):
    - Employer: `company` (required), optional `website`
    - Applicant: optional `phone`, optional `location`
  - Response: `200 { data: <User> }`

- `POST /profile/resume`
  - Auth: Y
  - Role: applicant
  - Body (multipart form-data): `resume` (PDF, max 5MB)
  - Response: `200 { data: <User> }`

- `GET /profile/resume`
  - Auth: Y
  - Role: applicant
  - Response: file download (404 if none)

- `DELETE /profile/resume`
  - Auth: Y
  - Role: applicant
  - Response: `200 { message: "Resume removed" }`

### Jobs

- `GET /jobs`
  - Auth: N (optional)
  - Role: public (optional applicant token enables `exclude_applied`)
  - Query:
    - pagination: `page`, `per_page` (max 50)
    - filters: `q`, `location`, `is_remote`, `salary_min`, `salary_max`
    - `exclude_applied` (boolean; when authenticated as applicant)
    - `sort` (`newest|oldest`)
  - Response: paginated `200 { data: <Job[]>, meta: { ... } }` (published jobs only)

- `GET /jobs/{job}`
  - Auth: N
  - Role: public
  - Response: `200 { data: <Job> }` (404 if job is not `published`)

- `GET /employer/jobs`
  - Auth: Y
  - Role: employer
  - Query: `page`, `per_page`, plus the public filters and optional `status` (`draft|published`)
  - Response: paginated `200 { data: <Job[]>, meta: { ... } }` (only the employer's jobs)

- `POST /employer/jobs`
  - Auth: Y
  - Role: employer
  - Body (JSON): `title`, `description`, `location`, `salary_min`/`salary_max` (or `salary_range` like `3000-5000`), `is_remote`, `status` (`draft|published`)
  - Response: `201 { data: <Job> }`

- `GET /employer/jobs/{job}`
  - Auth: Y
  - Role: employer (must own job)
  - Response: `200 { data: <Job> }`

- `PATCH /employer/jobs/{job}`
  - Auth: Y
  - Role: employer (must own job)
  - Body (JSON): any of the job fields above (partial update)
  - Response: `200 { data: <Job> }`

- `DELETE /employer/jobs/{job}`
  - Auth: Y
  - Role: employer (must own job)
  - Response: `200 { message: "Deleted" }`

- `GET /saved-jobs`
  - Auth: Y
  - Role: applicant
  - Query: `page`, `per_page`
  - Response: paginated `200 { data: <Job[]>, meta: { ... } }` (published jobs only)

- `GET /saved-jobs/ids`
  - Auth: Y
  - Role: applicant
  - Response: `200 { data: number[] }`

- `POST /jobs/{job}/save`
  - Auth: Y
  - Role: applicant
  - Response: `201 { data: <Job> }` (422 if job is not `published`)

- `DELETE /jobs/{job}/save`
  - Auth: Y
  - Role: applicant
  - Response: `200 { message: "Removed" }`

### Applications

- `POST /jobs/{job}/apply`
  - Auth: Y
  - Role: applicant
  - Body (multipart form-data):
    - required: `message`
    - optional: `resume` (PDF, max 5MB) OR `use_profile_resume=1`
  - Response: `201 { data: <Application> }`
  - Notes: applying to a draft job or applying twice returns `422` with validation errors.

- `GET /applied-jobs`
  - Auth: Y
  - Role: applicant
  - Query: `page`, `per_page`
  - Response: paginated `200 { data: <Application[]>, meta: { ... } }` (each item includes `job` details)

- `GET /applied-jobs/ids`
  - Auth: Y
  - Role: applicant
  - Response: `200 { data: [{ job_id, status }, ...] }`

- `GET /applications`
  - Auth: Y
  - Role: applicant
  - Response: same as `GET /applied-jobs` (backwards-compatible alias; marked deprecated in routes)

- `GET /employer/jobs/{job}/applications`
  - Auth: Y
  - Role: employer (must own job)
  - Response: `200 { data: <Application[]> }` (non-paginated list; includes applicant details)

- `PATCH /employer/applications/{application}`
  - Auth: Y
  - Role: employer (must own the related job)
  - Body (JSON): `status` in `submitted|reviewed|shortlisted|rejected`
  - Response: `200 { data: <Application> }`

- `GET /employer/applications/{application}/resume`
  - Auth: Y
  - Role: employer (must own the related job)
  - Response: file download (404 if no resume attached)

## 12) Postman Collection

Primary collection (single-file, reviewer-friendly):

- Collection: `postman/JobBoard.postman_collection.json`
- Environment: `postman/JobBoard.postman_environment.json`

Variables:

- `base_url`: e.g. `http://localhost:8000`
- `api_prefix`: `/api`
- `token`: set automatically by login/register requests (also stores `token_employer` and `token_applicant`)

Suggested flow:

1. `Auth -> Login Employer`
2. `Employer Jobs -> Create job (published)` (sets `published_job_id`)
3. `Auth -> Login Applicant`
4. `Applicant Applications -> Apply to published job` (sets `application_id`)
5. Switch back to employer and run `Employer Jobs -> View applications for job`

Additional suite-style collections exist under `postman/1auth/`, `postman/2jobs-employer/`, etc. (see `postman/POSTMAN_TEST_PLAN.md`).

## 13) Testing

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

