# About

Single-user travel budget calendar web app. Users create Budgets (date range + currency), populate each Day with time-stamped Activities (optional cost + category), and view the full itinerary hour-by-hour on a calendar.

No backend. All data lives in `localStorage`. See [CONTEXT.md](CONTEXT.md) for domain language and [docs/adr/](docs/adr/) for architectural decisions.

# Architecture

See [agents/architecture.md](agents/architecture.md) for implementation details.

# Workflow

1. Use TDD (use /tdd skill)
2. Update memory files in [agents/](agents/) directory.
3. Do not run git. User manages git.

# Build

See [agents/build.md](agents/build.md).

# Test

See [agents/test.md](agents/test.md).

# Folder structure

See [agents/folder.md](agents/folder.md).
