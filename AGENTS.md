# About

Single-user travel budget calendar web app. React + Vite + TypeScript + FullCalendar + Zustand + Tailwind CSS.

Domain summary:
- Budget: date range + categories + days
- Day: one date in a budget
- Activity: time-stamped item with optional cost/category
- Category: scoped to one budget
- Calendar detail view defaults to an Itinerary time-grid that spans the full budget date range.

No backend; persistence is via Zustand `persist` to `localStorage`.

# Workflow

1. Use TDD.
2. Update memory files in `agents/` when implementation details change.
3. Do not run git.

# Build / test

See `agents/build.md` and `agents/test.md`.

# Folder structure

See `agents/folder.md`.

# Current interactions

- Calendar detail supports click-to-create with pre-filled time, drag/drop move + resize, and Cmd/Ctrl click selection with copy/paste via local UI state.
