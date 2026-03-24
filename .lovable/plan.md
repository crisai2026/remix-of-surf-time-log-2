

## Plan: Add Familia as Motor 4 in Weekly Plan

**Problem:** The DB project "Familia" has `motor_number=4` and `weekly_goal_hours=3.5`, but the weekly plan config doesn't treat it as a motor. The `MOTOR_GOALS` object only has motors 1-3, and the `familia` blocks in `WEEKLY_PLAN` don't have `motor: 4`. This means Familia time entries are counted as "actual" motor time but have 0 planned minutes, skewing the 62% calculation.

**File: `src/lib/weeklyPlan.ts`**

1. **Add Motor 4 to `MOTOR_GOALS`:** Add entry `4: { label: "Motor 4 · Familia", category: "familia", weeklyHours: 3.5 }`

2. **Add `motorLabel` to familia in `CATEGORY_STYLES`:** Add `motorLabel: "Motor 4 · Familia"` to the existing familia style entry.

3. **Add `motor: 4` to familia blocks in `WEEKLY_PLAN`:**
   - Monday: "Prep reunión" (09:30-11:00) → add `motor: 4`
   - Tuesday: "Reunión hermanos" (09:30-11:30) → add `motor: 4`

4. **Add Familia to `ACTIVITY_OPTIONS`:** Update the existing "Familia" entry to include `motor: 4`.

No other files need changes — the dashboard already dynamically reads from `MOTOR_GOALS` and processes all motors.

