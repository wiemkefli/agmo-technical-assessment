# Auth Suite - Newman CLI Output

```text
newman

Mini Job Board API - Auth

□ Auth / Register
└ Register Employer
  POST http://localhost:8000/api/auth/register [201 Created, 577B, 344ms]
  √  Status 201
  √  Has token
  √  Role employer

└ Register Applicant
  POST http://localhost:8000/api/auth/register [201 Created, 559B, 314ms]
  √  Status 201
  √  Has token
  √  Role applicant

□ Auth / Login
└ Login Employer (saves token_employer)
  POST http://localhost:8000/api/auth/login [200 OK, 572B, 308ms]
  √  Status 200
  √  Has token
  √  Role employer

└ Login Applicant (saves token_applicant)
  POST http://localhost:8000/api/auth/login [200 OK, 554B, 379ms]
  √  Status 200
  √  Has token
  √  Role applicant

□ Auth / Session
└ Me (Employer)
  GET http://localhost:8000/api/auth/me [200 OK, 510B, 44ms]
  √  Status 200
  √  Has data.id

└ Me (Applicant)
  GET http://localhost:8000/api/auth/me [200 OK, 563B, 45ms]
  √  Status 200
  √  Has data.id

┌─────────────────────────┬────────────────────┬────────────────────┐
│                         │           executed │             failed │
├─────────────────────────┼────────────────────┼────────────────────┤
│              iterations │                  1 │                  0 │
├─────────────────────────┼────────────────────┼────────────────────┤
│                requests │                  6 │                  0 │
├─────────────────────────┼────────────────────┼────────────────────┤
│            test-scripts │                  6 │                  0 │
├─────────────────────────┼────────────────────┼────────────────────┤
│      prerequest-scripts │                  2 │                  0 │
├─────────────────────────┼────────────────────┼────────────────────┤
│              assertions │                 16 │                  0 │
├─────────────────────────┴────────────────────┴────────────────────┤
│ total run duration: 1947ms                                        │
├───────────────────────────────────────────────────────────────────┤
│ total data received: 1.89kB (approx)                              │
├───────────────────────────────────────────────────────────────────┤
│ average response time: 239ms [min: 44ms, max: 379ms, s.d.: 139ms] │
└───────────────────────────────────────────────────────────────────┘
```
