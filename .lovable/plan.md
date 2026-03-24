

## Plan: Simplify motor section in AlignmentSemana

### File: `src/components/AlignmentSemana.tsx`

**Remove:** The "Motor summary cards" grid (lines 289–303).

**Replace:** The dual-bar "Por motor — plan vs real" section (lines 255–287) with a single progress bar per motor:
- Bar background = full width (represents `goalHours` = 100%)
- Filled portion = `actualHours / goalHours` percentage, colored with `m.color`
- Right-aligned text: `{actualHours}h / {goalHours}h · {pct}%`
- Goal source: `mp.weekly_goal_hours` from DB (already used in `motorData` as `goalHours`)
- Remove `plannedHours` from the display (no longer needed)
- Title changes to "Por motor — progreso semanal"

No other files or sections touched.

