# Single-user, browser-only (no backend)

All Budget data is stored in `localStorage`. There is no server, no auth, and no database. The app runs entirely in the browser.

We chose this because the app is a personal planning tool — sharing and collaboration are out of scope. This eliminates an entire infrastructure layer and its associated complexity (auth, API, deployment, data sync).

## Considered options

- Local-first with file export (JSON/CSV) — accepted as a future addition, not baseline infrastructure
- Python/FastAPI backend with SQLite — rejected; adds a deployment dependency for a tool that doesn't need it
- Multi-user with accounts — out of scope for this version

## Consequences

If multi-user or cross-device sync is added later, `localStorage` as the persistence layer will need to be replaced. That migration is significant but deliberate — it was a known trade-off made for simplicity now.
