

## Plan: Motor colors from DB everywhere

### Problem
`CATEGORY_STYLES` in `weeklyPlan.ts` has hardcoded colors for each category. When you update a motor's color in the DB (via ProjectManager), the Alignment views still use the old hardcoded colors because they reference `CATEGORY_STYLES[cat]?.textColor` instead of the project's DB color.

DashboardCharts already uses `p.color` from the DB — so Tracker is fine. The issue is in Alignment mode.

### Changes

**1. `src/components/AlignmentSemana.tsx`**
- In `motorData` computation (line 148): use `mp.color` (from DB) as primary color instead of `style?.textColor`
- Generate `lightBg`/`darkBg` dynamically from the project color (lighten for light mode, darken for dark mode) or keep the hardcoded bg as fallback but use DB color for the main color

**2. `src/components/AlignmentAhora.tsx`**
- Where it references `CATEGORY_STYLES[category]?.textColor` for dots/indicators: cross-reference with the project's DB color when a motor project is involved
- In `ensureProjectForCategory`: use the project's existing DB color instead of `style?.textColor`

**3. `src/lib/weeklyPlan.ts`**
- No structural changes needed — `CATEGORY_STYLES` stays as a fallback for non-motor categories (familia, whanau, etc.)
- But motor categories should prefer DB colors

### Approach
The simplest fix: in both Alignment components, when rendering motor-related items, always prefer `project.color` from the DB over `CATEGORY_STYLES`. The `CATEGORY_STYLES` colors remain as defaults for categories that don't have a corresponding project (rutina, buffer, etc.).

### Files: 2
1. `src/components/AlignmentSemana.tsx`
2. `src/components/AlignmentAhora.tsx`

