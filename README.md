# CodeXray Observability & Security Microservice

A simplified observability and security microservice that collects system metrics, generates alerts, and exposes secure APIs. Includes a bonus web dashboard for visualization and configuration, plus a standalone Log Analyzer script.

## Features

- Secure auth with password hashing (bcryptjs), in-memory sessions
- Metrics collection (CPU %, Memory %) with alerting on thresholds
- In-memory storage for metrics and alerts
- Secure reporting API (/api/summary)
- Bonus dashboard (Next.js App Router) with charts (Recharts) and SWR
- Log Analyzer Node script (Phase 1)

## Folder Structure

- app/api/* — REST API routes
- app/page.tsx — Dashboard UI
- lib/* — Store, types, security, metrics collection
- components/* — UI components for auth, charts, thresholds, alerts
- scripts/log-analyzer.ts — Phase 1 Log Analyzer utility

## APIs

- POST /api/register — { email, password } → { token, user }
- POST /api/login — { email, password } → { token, user }
- GET /api/validate-session — header Authorization: Bearer <token>
- GET /api/metrics?n=100 — collects once, returns latest, last N readings, and recent alerts
- GET /api/summary?n=10 — SECURED, requires Authorization header
- GET /api/config/thresholds — SECURED, get thresholds
- POST /api/config/thresholds — SECURED, set thresholds { cpuThreshold, memThreshold }

## Security

- Passwords are hashed using bcryptjs. No plaintext storage.
- Session tokens are required for /summary and thresholds endpoints.
- Sessions expire after 24 hours.
- This project uses in-memory stores for simplicity; swap with a database for persistence.

## Log Analyzer (Phase 1)

- Script: scripts/log-analyzer.ts
- Usage: node scripts/log-analyzer.ts path/to/sample.log
- Outputs:
  - Count of INFO/WARN/ERROR
  - Top 5 most frequent ERROR messages

## Notes

- The dashboard uses SWR with refreshInterval to poll metrics; no useEffect fetches.
- Metrics collection uses `systeminformation` when available, with a `node:os` fallback.
- For production, consider durable storage (SQLite/Redis/Postgres) and HTTPS/TLS.
