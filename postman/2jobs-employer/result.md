# Jobs (Employer) Suite - Newman CLI Output

```text
newman

Mini Job Board API - Jobs (Employer)

□ Jobs — Employer / List
└ List Own Jobs
  GET http://localhost:8000/api/employer/jobs?per_page=10&sort=newest [200 OK, 785B, 107ms]
  √  Status 200
  √  Has data array
  √  Has meta

□ Jobs — Employer / CRUD
└ Create Job (Draft) (saves job_id)
  POST http://localhost:8000/api/employer/jobs [201 Created, 661B, 42ms]
  √  Status 201
  √  Status draft

└ Get Single Own Job (job_id)
  GET http://localhost:8000/api/employer/jobs/26 [200 OK, 656B, 31ms]
  √  Status 200
  √  Matches job_id

└ Update Job (Draft) (job_id)
  PATCH http://localhost:8000/api/employer/jobs/26 [200 OK, 667B, 38ms]
  √  Status 200
  √  Title updated

└ Create Job (Published) (saves published_job_id)
  POST http://localhost:8000/api/employer/jobs [201 Created, 700B, 51ms]
  √  Status 201
  √  Status published

┌─────────────────────────┬───────────────────┬───────────────────┐
│                         │          executed │            failed │
├─────────────────────────┼───────────────────┼───────────────────┤
│              iterations │                 1 │                 0 │
├─────────────────────────┼───────────────────┼───────────────────┤
│                requests │                 5 │                 0 │
├─────────────────────────┼───────────────────┼───────────────────┤
│            test-scripts │                 5 │                 0 │
├─────────────────────────┼───────────────────┼───────────────────┤
│      prerequest-scripts │                 2 │                 0 │
├─────────────────────────┼───────────────────┼───────────────────┤
│              assertions │                11 │                 0 │
├─────────────────────────┴───────────────────┴───────────────────┤
│ total run duration: 748ms                                       │
├─────────────────────────────────────────────────────────────────┤
│ total data received: 2.26kB (approx)                            │
├─────────────────────────────────────────────────────────────────┤
│ average response time: 53ms [min: 31ms, max: 107ms, s.d.: 27ms] │
└─────────────────────────────────────────────────────────────────┘
```
