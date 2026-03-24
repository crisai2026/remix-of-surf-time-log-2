

## Plan: Add "Log" View to MAREA

### Summary
Add a third top-level navigation option "Log" alongside "Tracker" and "Alignment". The Log view shows a chronological list of all time entries, with filters and day-grouped layout.

### Changes

**1. `src/pages/Index.tsx`** — Add "Log" mode
- Extend `AppMode` type: `"tracker" | "alignment" | "log"`
- Add third button "Log" to the top-level toggle
- Render `<ActivityLog />` when `mode === "log"`
- No sub-navigation needed for Log mode

**2. `src/components/ActivityLog.tsx`** — New file
- **Data**: Query `time_entries` with `projects(*)` join from Supabase, filtered by selected time period
- **Filters row**: Horizontal pills for time period ("Hoy", "Esta semana", "Este mes", "Todo" — default "Esta semana") + category dropdown with color dots (default "Todas")
- **Grouping**: Group entries by NZ date, sorted most recent day first. Within each day, sort by `start_time` ascending
- **Day header**: Full date in Spanish (e.g. "Lunes 24 de Marzo") with total hours on the right
- **Entry row**: Color dot (from `project.color`), project name, time range, duration, optional "fuera de plan" badge, optional planned category mismatch text
- **Empty state**: "Sin registros" with muted icon
- **Time formatting**: Reuse existing `formatTime`, `toNZDate`, `nzMidnightToUTC` utilities
- **Date range calculation**: "Hoy" = today NZ, "Esta semana" = current week Mon-Sun, "Este mes" = 1st of month to end, "Todo" = no filter

### Technical details
- Time period filter controls the Supabase query's `gte`/`lt` on `start_time` (converted to UTC via `nzMidnightToUTC`)
- Category filter is client-side on the fetched data (filter by `project_id`)
- Day grouping uses `toNZDate()` to bucket entries
- Spanish day/month names via `toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long", timeZone: "Pacific/Auckland" })`
- Duration display uses existing `formatDuration`

### Files
1. `src/pages/Index.tsx` — modify (add Log mode + toggle button)
2. `src/components/ActivityLog.tsx` — create new

