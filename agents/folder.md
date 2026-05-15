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
├── example/
│   └── example.json    ← bundled sample budget used to seed first visits
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── package.json
└── src/
    ├── main.tsx         ← app entry point
    ├── App.tsx          ← top-level view routing (list ↔ detail)
    ├── test-setup.ts    ← @testing-library/jest-dom setup
    ├── types/
    │   └── index.ts         ← Budget, Day, Activity, Category types
    ├── store/
    │   └── budgetStore.ts   ← Zustand store with persist middleware
    ├── utils/
    │   ├── dateUtils.ts     ← generateDays, toCalendarEvent
    │   ├── budgetUtils.ts   ← calcTotalCost, formatNumber
    │   ├── importExport.ts  ← slugify, parseBudget, exportBudget
    │   └── categorySummary.ts ← category cost aggregation for analytics
    └── components/
        ├── BudgetList/      ← Budget list page + create form
        │   ├── BudgetList.tsx
        │   ├── BudgetForm.tsx
        │   └── ImportButton.tsx
        ├── BudgetDetail/    ← Calendar/table/analytics detail page header + layout
        │   └── BudgetDetail.tsx
        ├── ActivityTable/   ← Read-only activity table view
        │   ├── ActivityTable.tsx
        │   └── ActivityTable.test.tsx
        ├── Analytics/       ← Budget cost breakdown pie chart + legend
        │   ├── AnalyticsView.tsx
        │   └── AnalyticsView.test.tsx
        ├── Calendar/        ← FullCalendar wrapper
        │   └── CalendarView.tsx
        ├── Activity/        ← Add/edit Activity modal form
        │   └── ActivityForm.tsx
        └── Category/        ← Category management (inline in BudgetDetail)
            └── CategoryManager.tsx
```
