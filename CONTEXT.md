# Budget Calendar

A single-user web app for planning travel itineraries with associated costs, rendered as a day-by-day, hour-by-hour calendar.

## Language

**Budget**:
A named financial and scheduling envelope covering a contiguous date range, denominated in a single currency, with a user-defined set of categories.
_Avoid_: Trip, journey, plan, itinerary (itinerary is the *view*, not the entity)

**Day**:
A specific calendar date within a Budget's date range.
_Avoid_: Date, entry-date

**Activity**:
A time-stamped item on a Day with a description, an optional cost, and an optional category. The atomic unit of both the itinerary and the budget.
_Avoid_: Expense, entry, event, line item

**Category**:
A user-defined label scoped to a single Budget, used to classify Activities (e.g., transportation, food, hotel).
_Avoid_: Tag, type, kind

## Relationships

- A **Budget** spans one or more **Days**
- A **Day** contains zero or more **Activities**
- An **Activity** belongs to exactly one **Day** and optionally one **Category**
- A **Category** belongs to exactly one **Budget**

## Example dialogue

> **Dev:** "Should the calendar show expenses or activities?"
> **Domain expert:** "Activities — not every activity costs money. A hotel check-in at 3pm is an activity with no cost; the hotel charge itself is an activity with a cost."

> **Dev:** "If a user wants to reuse categories across budgets, should we make them global?"
> **Domain expert:** "No — categories are per-Budget. A camping budget and a business travel budget have completely different category sets."
