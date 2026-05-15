# Architecture

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite + TypeScript |
| Calendar UI | FullCalendar (React adapter) |
| State management | Zustand |
| Persistence | `localStorage` (JSON) |
| Styling | Tailwind CSS |

No backend. Single-user. All data is stored in `localStorage`.

## Implemented app shape

- Landing view: budget list + create/delete
- Budget list: per-row export + JSON import next to create
- Detail view: styled budget header + collapsible category manager + calendar/table toggle
- Budget list: shows per-budget total cost alongside dates
- Budget detail: shows total cost in the header subtitle
- Activity editor: centered modal with backdrop for add/edit/delete
- Routing: local `useState` in `App.tsx`
- Calendar interactions: click-to-create pre-fills slot time, activities can be dragged/resized through FullCalendar, and copy/paste uses local clipboard state in the calendar view.
- Category colors are auto-assigned from a fixed palette by category index and shown both in the calendar and as dots in the category manager.
- Table view: read-only activity table flattens budget days into rows and sorts client-side by date or category.
- Import/export helpers parse single-budget JSON, ignore extra fields, and remap imported IDs so budgets never overwrite existing ones.

## Domain Model

See [CONTEXT.md](../CONTEXT.md) for canonical terminology. Summary:

- **Budget** — top-level entity. Has a name, start date, end date, and a list of user-defined Categories.
- **Day** — a specific date within a Budget's date range. Contains zero or more Activities.
- **Activity** — a time-stamped item on a Day. Has a description, a time, an optional cost (number), an optional count (positive integer), an optional duration in minutes, and an optional Category.
- **Category** — a user-defined label scoped to one Budget (e.g., "transportation", "food", "hotel").

## Data Shape (localStorage)

```ts
type Budget = {
  id: string;
  name: string;
  startDate: string;   // ISO date "YYYY-MM-DD"
  endDate: string;     // ISO date "YYYY-MM-DD"
  categories: Category[];
  days: Day[];
};

type Category = {
  id: string;
  name: string;
};

type Day = {
  date: string;        // ISO date "YYYY-MM-DD"
  activities: Activity[];
};

type Activity = {
  id: string;
  time: string;        // "HH:mm"
  description: string;
  cost?: number;
  count?: number;
  duration?: number;   // minutes
  categoryId?: string;
};
```

All Budgets are stored as a JSON array under the key `budget-calendar:budgets` in `localStorage`.

Zustand persists only `budgets`; `activeBudgetId` stays in memory.

## Calendar View

FullCalendar renders Activities as timed events in a day/week view. Each Activity maps to a FullCalendar event:
- `start`: combined date + time
- `duration`: activity duration in minutes, defaulting to 30
- `title`: description (+ total cost if present)
- `extendedProps`: `{ activity, date }`
- `backgroundColor`: category palette color when the activity has a matching category

The detail calendar now also supports an Itinerary view that defaults on open and spans the full budget date range with a custom `timeGrid` duration.
