# Jobs (Applicant) Suite - Newman CLI Output

```text
newman

Mini Job Board API - Jobs (Applicant)

□ Jobs — Applicant / Browse
└ Browse Published Jobs (public)
  GET http://localhost:8000/api/jobs?per_page=10&sort=newest [200 OK, 8.99kB, 100ms]
  √  Status 200
  √  Has data array
  √  Has meta

□ Jobs — Applicant / Details
└ View Job Details (Published) (published_job_id)
  GET http://localhost:8000/api/jobs/27 [200 OK, 695B, 30ms]
  √  Status 200
  √  Matches published_job_id

□ Jobs — Applicant / Negative
└ Negative: View Draft Job Details (job_id) => 404
  GET http://localhost:8000/api/jobs/26 [404 Not Found, 14.07kB, 32ms]
  √  Status 404

└ Negative: Applicant cannot create employer job => 403
  POST http://localhost:8000/api/employer/jobs [403 Forbidden, 270B, 41ms]
  √  Status 403
  √  Message Forbidden

┌─────────────────────────┬───────────────────┬───────────────────┐
│                         │          executed │            failed │
├─────────────────────────┼───────────────────┼───────────────────┤
│              iterations │                 1 │                 0 │
├─────────────────────────┼───────────────────┼───────────────────┤
│                requests │                 4 │                 0 │
├─────────────────────────┼───────────────────┼───────────────────┤
│            test-scripts │                 4 │                 0 │
├─────────────────────────┼───────────────────┼───────────────────┤
│      prerequest-scripts │                 0 │                 0 │
├─────────────────────────┼───────────────────┼───────────────────┤
│              assertions │                 8 │                 0 │
├─────────────────────────┴───────────────────┴───────────────────┤
│ total run duration: 546ms                                       │
├─────────────────────────────────────────────────────────────────┤
│ total data received: 23.05kB (approx)                           │
├─────────────────────────────────────────────────────────────────┤
│ average response time: 50ms [min: 30ms, max: 100ms, s.d.: 28ms] │
└─────────────────────────────────────────────────────────────────┘
```
