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
- Detail view: styled budget header + collapsible category manager + FullCalendar week/day view
- Activity editor: centered modal with backdrop for add/edit/delete
- Routing: local `useState` in `App.tsx`

## Domain Model

See [CONTEXT.md](../CONTEXT.md) for canonical terminology. Summary:

- **Budget** — top-level entity. Has a name, start date, end date, single currency, and a list of user-defined Categories.
- **Day** — a specific date within a Budget's date range. Contains zero or more Activities.
- **Activity** — a time-stamped item on a Day. Has a description, a time, an optional cost (number), and an optional Category.
- **Category** — a user-defined label scoped to one Budget (e.g., "transportation", "food", "hotel").

## Data Shape (localStorage)

```ts
type Budget = {
  id: string;
  name: string;
  startDate: string;   // ISO date "YYYY-MM-DD"
  endDate: string;     // ISO date "YYYY-MM-DD"
  currency: string;    // e.g. "USD"
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
  categoryId?: string;
};
```

All Budgets are stored as a JSON array under the key `budget-calendar:budgets` in `localStorage`.

Zustand persists only `budgets`; `activeBudgetId` stays in memory.

## Calendar View

FullCalendar renders Activities as timed events in a day/week view. Each Activity maps to a FullCalendar event:
- `start`: combined date + time
- `title`: description (+ cost if present)
- `extendedProps`: `{ activity, date }`

The detail calendar now also supports an Itinerary view that defaults on open and spans the full budget date range with a custom `timeGrid` duration.
