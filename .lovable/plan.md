

## Plan: MAREA Bug Fixes (5 bugs, priority order)

### Bug 1 — Date filtering (timezone-aware)

**Root cause**: `todayISO()` uses `new Date().toISOString().split("T")[0]` which returns UTC date, not NZDT (UTC+13). Same issue in `getWeekDatesForOffset()`. All date comparisons using `.startsWith(date)` compare against UTC dates, causing entries to appear on wrong days for NZ users.

**Files**: `src/lib/formatTime.ts`, `src/components/DashboardCharts.tsx`, `src/components/TimelineView.tsx`

**Changes**:
- Update `todayISO()` to use `toLocaleDateString('en-CA', { timeZone: 'Pacific/Auckland' })` which returns `YYYY-MM-DD` in NZDT
- Update `getWeekDatesForOffset()` to calculate dates in NZDT
- Add a helper `toNZDate(isoString)` that converts a UTC timestamp to NZDT date string
- In `DashboardCharts.tsx` and everywhere that uses `.startsWith(date)` for filtering: replace with `toNZDate(e.start_time) === date` comparison
- In `useTimeEntries` hook: adjust the date range query to use NZDT boundaries (convert NZDT midnight to UTC for the Supabase query)

---

### Bug 2 — Sunday entries not visible

**Root cause**: The "Hoy" section in DashboardCharts only shows today's entries. Weekend entries from the bar chart have no corresponding detail view.

**Files**: `src/components/DashboardCharts.tsx`

**Changes**:
- Make the bar chart bars clickable — clicking a bar sets a `selectedBarDay` state
- When a day is selected, show that day's entries below the bar chart (similar to how heatmap breakdown works)
- This makes all 7 days' entries accessible, including weekends

---

### Bug 3 — Alignment mode uses real data

**Root cause**: AlignmentSemana already reads from Supabase (confirmed by code review). The main issue is AlignmentAhora: it uses `CATEGORY_TO_PROJECT` reverse lookup which has a case mismatch ("Jobhunt" vs "JobHunt" in DB), and `MOTOR_GOALS` is hardcoded instead of reading from DB `weekly_goal_hours`. Also there's a duplicate "Jobhunt" project in the DB causing confusion.

**Files**: `src/components/AlignmentAhora.tsx`, `src/components/AlignmentSemana.tsx`

**Changes**:
- AlignmentAhora: derive motor info from projects DB (using `motor_number`) instead of hardcoded `MOTOR_GOALS`
- Fix `PROJECT_TO_CATEGORY` reverse lookup to be case-insensitive
- AlignmentAhora: show actual running entry info dynamically, using project data from DB
- AlignmentSemana: already works with real data, but ensure the `CATEGORY_TO_PROJECT` lookup is case-insensitive

---

### Bug 4 — "Fuera de plan" saves correctly

**Root cause**: `handleOutOfPlan` in AlignmentAhora uses `projects?.[0]` (first project in list = Whanau Support) and doesn't set `is_out_of_plan: true`.

**Files**: `src/components/AlignmentAhora.tsx`, `src/lib/hooks/useTimeEntries.ts`

**Changes**:
- Create/find a generic "Fuera de plan" project (or use a designated project)
- Set `is_out_of_plan: true` on the entry
- Set `planned_category` to the current plan block's category
- Store the user's typed label as `description`
- Stop any running timer before starting the new one
- Display the custom description in the current block card

---

### Bug 5 — Motor labels and colors consistent

**Root cause**: DashboardCharts shows `"Motor 1"` and project name separately. Should show `"1 · ProjectName"`. Should only show projects with `motor_number`. Colors should match between Tracker and Alignment.

**Files**: `src/components/DashboardCharts.tsx`, `src/components/AlignmentSemana.tsx`

**Changes**:
- DashboardCharts: change motor label format from `"Motor ${n}"` + separate `projectName` to `"${n} · ${projectName}"`
- Remove the separate `projectName` column in the motor display
- Use project's `color` from DB consistently (already mostly done)
- AlignmentSemana: same label format `"${n} · ${projectName}"` instead of `"Motor ${n} · ${projectName}"`
- Ensure only projects with `motor_number != null` appear in motor sections (already filtered)

### Technical details

- Timezone handling uses `Intl.DateTimeFormat` with `timeZone: 'Pacific/Auckland'` for consistent NZDT conversion
- Case-insensitive project name matching for category lookups
- The duplicate "Jobhunt" project in DB (one with motor_number=1 "JobHunt", one without "Jobhunt") should be noted to the user as a data issue to clean up

### Files to edit: 6
1. `src/lib/formatTime.ts`
2. `src/lib/hooks/useTimeEntries.ts`
3. `src/components/DashboardCharts.tsx`
4. `src/components/AlignmentAhora.tsx`
5. `src/components/AlignmentSemana.tsx`
6. `src/components/TimelineView.tsx`

