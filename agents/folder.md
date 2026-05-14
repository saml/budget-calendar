# Folder Structure

```
budget-calendar/
├── AGENTS.md
├── CONTEXT.md
├── docs/
│   └── adr/
│       ├── 0001-single-user-browser-only.md
│       └── 0002-react-vite-typescript-fullcalendar.md
├── agents/              ← AI memory files (not shipped)
│   ├── architecture.md
│   ├── build.md
│   ├── test.md
│   └── folder.md
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── src/
    ├── main.tsx         ← app entry point
    ├── App.tsx
    ├── store/
    │   └── budgetStore.ts   ← Zustand store (all Budget state + localStorage persistence)
    ├── types/
    │   └── index.ts         ← Budget, Day, Activity, Category types
    ├── components/
    │   ├── Calendar/        ← FullCalendar wrapper + Activity event rendering
    │   ├── Budget/          ← Budget list, create/edit budget forms
    │   ├── Activity/        ← Activity create/edit forms
    │   └── Category/        ← Category management
    └── utils/
        └── dateUtils.ts     ← ISO date helpers
```
