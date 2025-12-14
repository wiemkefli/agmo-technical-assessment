# Validation Suite — Newman CLI Output

```text
newman

Mini Job Board API - Validation

□ Validation / Auth
└ Negative: Unauthenticated Profile => 401
  GET http://localhost:8000/api/profile [401 Unauthorized, 280B, 84ms]
  √  Status 401

└ Negative: Invalid Login => 401
  POST http://localhost:8000/api/auth/login [401 Unauthorized, 283B, 322ms]
  √  Status 401
  √  Message Invalid credentials

□ Validation / Validation
└ Negative: Create Job Missing Title => 422
  POST http://localhost:8000/api/employer/jobs [422 Unprocessable Content, 353B, 41ms]
  √  Status 422
  √  Has errors.title

□ Validation / Not Found
└ Negative: Not Found Job => 404
  GET http://localhost:8000/api/jobs/999999999 [404 Not Found, 12.01kB, 40ms]
  √  Status 404

┌─────────────────────────┬────────────────────┬────────────────────┐
│                         │           executed │             failed │
├─────────────────────────┼────────────────────┼────────────────────┤
│              iterations │                  1 │                  0 │
├─────────────────────────┼────────────────────┼────────────────────┤
│                requests │                  4 │                  0 │
├─────────────────────────┼────────────────────┼────────────────────┤
│            test-scripts │                  4 │                  0 │
├─────────────────────────┼────────────────────┼────────────────────┤
│      prerequest-scripts │                  0 │                  0 │
├─────────────────────────┼────────────────────┼────────────────────┤
│              assertions │                  6 │                  0 │
├─────────────────────────┴────────────────────┴────────────────────┤
│ total run duration: 850ms                                         │
├───────────────────────────────────────────────────────────────────┤
│ total data received: 11.92kB (approx)                             │
├───────────────────────────────────────────────────────────────────┤
│ average response time: 121ms [min: 40ms, max: 322ms, s.d.: 116ms] │
└───────────────────────────────────────────────────────────────────┘
```

