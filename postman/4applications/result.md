# Applications Suite - Newman CLI Output

```text
newman

Mini Job Board API - Applications

□ Applications / Apply
└ Apply to Job (Published) (saves application_id)
  POST http://localhost:8000/api/jobs/27/apply [201 Created, 1.23kB, 113ms]
  √  Status 201

└ Negative: Apply Again (duplicate) => 422
  POST http://localhost:8000/api/jobs/27/apply [422 Unprocessable Content, 369B, 44ms]
  √  Status 422
  √  Has errors.job

└ Negative: Apply to Draft Job (job_id) => 422
  POST http://localhost:8000/api/jobs/26/apply [422 Unprocessable Content, 369B, 35ms]
  √  Status 422
  √  Has errors.job

□ Applications / Lists
└ List My Applied Jobs (applied-jobs)
  GET http://localhost:8000/api/applied-jobs?per_page=10 [200 OK, 1.49kB, 42ms]
  √  Status 200
  √  Has data array
  √  Has meta

└ List My Applied Job IDs (applied-jobs/ids)
  GET http://localhost:8000/api/applied-jobs/ids [200 OK, 285B, 61ms]
  √  Status 200
  √  Has data array

□ Applications / Employer Actions
└ Employer: View Applicants for Published Job
  GET http://localhost:8000/api/employer/jobs/27/applications [200 OK, 776B, 52ms]
  √  Status 200
  √  Has data array

└ Employer: Update Application Status (application_id)
  PATCH http://localhost:8000/api/employer/applications/46 [200 OK, 1.15kB, 47ms]
  √  Status 200
  √  Status reviewed

□ Applications / Negative
└ Negative: Applicant cannot view applicants => 403
  GET http://localhost:8000/api/employer/jobs/27/applications [403 Forbidden, 270B, 39ms]
  √  Status 403
  √  Message Forbidden

┌─────────────────────────┬───────────────────┬───────────────────┐
│                         │          executed │            failed │
├─────────────────────────┼───────────────────┼───────────────────┤
│              iterations │                 1 │                 0 │
├─────────────────────────┼───────────────────┼───────────────────┤
│                requests │                 8 │                 0 │
├─────────────────────────┼───────────────────┼───────────────────┤
│            test-scripts │                 8 │                 0 │
├─────────────────────────┼───────────────────┼───────────────────┤
│      prerequest-scripts │                 0 │                 0 │
├─────────────────────────┼───────────────────┼───────────────────┤
│              assertions │                16 │                 0 │
├─────────────────────────┴───────────────────┴───────────────────┤
│ total run duration: 1128ms                                      │
├─────────────────────────────────────────────────────────────────┤
│ total data received: 3.97kB (approx)                            │
├─────────────────────────────────────────────────────────────────┤
│ average response time: 54ms [min: 35ms, max: 113ms, s.d.: 23ms] │
└─────────────────────────────────────────────────────────────────┘
```
