# React + Vite + TypeScript + FullCalendar as the frontend stack

The frontend is built with React (via Vite) in TypeScript, using FullCalendar for the calendar UI, Zustand for state management, and Tailwind CSS for styling.

**FullCalendar** was chosen over React Big Calendar and custom implementations because it natively supports hour-by-hour day/week views (the core UI requirement), has a first-class React adapter, and handles time slot rendering and drag-and-drop without custom layout code.

**Zustand** over Redux or Context API because the data model is flat (one store: budgets → days → activities) and single-user state requires no complex async coordination.

## Considered options

- Vue 3 + Vite — viable, but React ecosystem has broader component library support (including FullCalendar's React adapter)
- SvelteKit — lighter bundle, but less mature ecosystem for the calendar use case
- Python (PyScript / Brython) — not practical for browser-native UI development; TypeScript is the right tool here
