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
- Activities inherit calendar colors from their budget category index; uncategorized activities keep FullCalendar's default blue.
- Budget detail now has calendar, table, and analytics tabs. The table view groups activities by category with subtotals, and the analytics view shows a pie-chart cost breakdown using the category palette.
- Budget list now supports JSON export per row and single-budget JSON import beside the create form. Imported budgets are remapped to fresh IDs.
- First visit seeds a bundled sample budget from `example/example.json` once via `src/seed.ts`, guarded by `budget-calendar:seeded` in localStorage.
- Theme preference is a separate persisted Zustand store with a 3-way Light/Dark/System toggle, and App owns the document-level `dark` class sync.
- GitHub Pages deployment uses Vite `base: '/budget-calendar/'` and a GitHub Actions workflow that publishes `dist/` to the `gh-pages` branch from `master`.
