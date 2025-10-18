# System Observability & Security Microservice

A simplified observability and security microservice that collects system metrics, generates alerts, and exposes secure APIs for reporting. Includes a bonus web dashboard for visualization and configuration, plus a standalone Log Analyzer script.

![Dashboard Overview 1](/SCREENSHOTS/dashboard-overview-1.png)
![Dashboard Overview 2](/SCREENSHOTS/dashboard-overview-2.png)
![Alerts Table](/SCREENSHOTS/alerts-table.png)
![Thresholds Config](/SCREENSHOTS/thresholds-config.png)

## Table of Contents
- Overview
- What’s Implemented (Phases 1–4 + Bonus)
- Quick Start (Local)
- Log Analyzer (Phase 1)
- API Reference (Auth, Metrics, Thresholds, Summary)
- Dashboard (Bonus)
- Architecture Summary
- Security Notes
- Sample Outputs (placeholders)
- Troubleshooting
- Submission Checklist

---

## Overview
This project demonstrates fundamentals of observability:
- Collect CPU% and Memory% metrics periodically
- Generate alerts when thresholds are breached
- Store metrics/alerts in memory (swapable for DB)
- Secure endpoints for summaries and configuration
- Optional dashboard to visualize trends and manage thresholds

---

## What’s Implemented (Phases 1–4 + Bonus)

- Phase 1: Fundamentals & Data Structures (Log Analyzer)
  - scripts/log-analyzer.ts
  - Parses a log file, counts INFO/WARN/ERROR, and shows top 5 errors.
- Phase 2: Secure Coding & Encoding
  - Endpoints: app/api/register/route.ts, app/api/login/route.ts, app/api/validate-session/route.ts
  - Security: lib/security.ts (bcryptjs hashing, session tokens)
  - In-memory store: lib/store.ts, types: lib/types.ts
- Phase 3: Observability Core
  - Metrics collection and alerting: lib/metrics.ts
  - Metrics endpoint: app/api/metrics/route.ts
  - Thresholds config: app/api/config/thresholds/route.ts
- Phase 4: Reporting API
  - Summary endpoint: app/api/summary/route.ts (secured)
- Bonus: Web Dashboard
  - app/page.tsx + components/* (charts via Recharts, data via SWR)
  - thresholds form, alerts table, live metrics chart

---

## Quick Start (Local)

Prerequisites
- Node.js 18+ (recommended: 20 LTS)
- Git (optional)

Install and run
- npm install
- npm run dev
- Open http://localhost:3000

Notes
- This build uses in-memory storage for users, sessions, metrics, alerts.
- For persistence, replace lib/store.ts with a DB-backed store (e.g., SQLite/Neon/Redis).

---

## Log Analyzer (Phase 1)

File
- scripts/log-analyzer.ts

Usage
- node scripts/log-analyzer.ts path/to/sample.log
  - Alternatively, npx tsx scripts/log-analyzer.ts path/to/sample.log

Outputs
- Count of INFO, WARN, ERROR
- Top 5 most frequent ERROR messages


---

## API Reference

Conventions
- JSON requests must set header: Content-Type: application/json
- Secured endpoints require header: Authorization: Bearer <token>
- All endpoints return JSON structure on success and error

Auth

1) POST /api/register
- Body: { "email": "a@b.com", "password": "strongpass" }

Example
- curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  

2) POST /api/login
- Body: { "email": "a@b.com", "password": "secret" }
- Response 200: { "token": "...", "user": { ... } }

3) GET /api/validate-session
- Headers: Authorization: Bearer <token>
- Response 200: { "ok": true, "user": { ... } }

Metrics & Alerts

4) GET /api/metrics?n=100
- Collects one read, returns latest readings and recent alerts
- Query n: number of recent metric samples to include

Thresholds (secured)

5) GET /api/config/thresholds
- Headers: Authorization: Bearer <token>

6) POST /api/config/thresholds
- Headers: Authorization: Bearer <token>, Content-Type: application/json
- Body: { "cpuThreshold": 80, "memThreshold": 75 }

Reporting (secured)

7) GET /api/summary?n=10
- Headers: Authorization: Bearer <token>

---

## Dashboard

- Path: /
- Features:
  - Real-time metrics chart (polling via SWR)
  - Alerts table (active + historical)
  - Thresholds form (secured; updates config)
- Usage:
  - Register, then log in to receive a session token
  - The dashboard components send the Authorization header automatically (when integrated with the auth form/session store)

![Dashboard Overview 2](/SCREENSHOTS/dashboard-overview-2.png)
![Alerts Table](/SCREENSHOTS/alerts-table.png)
![Thresholds Config](/SCREENSHOTS/thresholds-config.png)
---

## Architecture Summary

- lib/metrics.ts
  - Metric collectors using systeminformation with os fallback
  - Alert generation when values exceed thresholds
- lib/store.ts
  - In-memory data structures:
    - users: Map<string, User>
    - sessions: Map<string, Session>
    - metrics: ring-buffer-like array
    - alerts: array
    - thresholds: { cpuThreshold, memThreshold }
- lib/security.ts
  - bcryptjs password hashing
  - simple token-based session management (24h TTL)
  - helper to require and validate Authorization header
- app/api/*
  - Route handlers (Next.js App Router) returning JSON only
- components/*
  - UI composed with shadcn/ui, SWR for fetching, Recharts for charts

---

## Security Notes

- Passwords hashed with bcryptjs; no plaintext storage
- Session tokens required for /summary and /config/thresholds
- Sessions expire after 24 hours (configurable)
- All API responses are JSON; error paths return structured messages

---
## Troubleshooting

- “Unexpected token I … is not valid JSON”
  - The client received an HTML/text error page (Internal Server Error) but tried to parse as JSON.
  - Ensure requests set Content-Type: application/json.
  - Verify API returned NextResponse.json(...) on all paths; check server logs.

- “Request failed (500): Internal Server Error”
  - Check the Network tab Response body; look at <v0_app_debug_logs>.
  - Common causes: invalid JSON body; missing headers; uncaught error in route; session token missing.
  - Try re-registering, then logging in again to refresh the token.

---

## Contact
- Email: sujeetmalagundi999@gmail.com
- Phone No : 7204521435
