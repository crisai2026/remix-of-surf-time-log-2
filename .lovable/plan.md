

## Plan: Fix Play Button in Alignment View

### Root Cause

The `handleToggleTimer` function only starts the timer when `!running && displayCategory`. The issue is that `displayCategory` can be `null` when the current time falls in a gap between plan blocks (e.g., 13:00-13:30 gap on Monday). In that case `currentBlock` is `null`, `activeCategory` is `null`, so `displayCategory` is `null` — and the Play button silently does nothing.

Additionally, for categories like "rutina" or "buffer" where the user might also want to start, `findOrCreateProject` needs to handle auto-creation properly.

### Fix — `src/components/AlignmentAhora.tsx`

1. **Make `handleToggleTimer` work when between blocks**: If `displayCategory` is null but `currentBlock` shows a block (or even "Tiempo libre"), open the activity switcher instead of doing nothing — so the user can pick what to track.

2. **Fallback behavior**: If `displayCategory` is truthy, start the planned activity as currently intended. If null, fall back to opening the switcher sheet so the user always gets a response from the Play button.

3. **Simplify**: Change the Play button's `onClick` to always call `handleToggleTimer`, and update `handleToggleTimer`:
   - If `displayCategory` exists → start that activity (current behavior)
   - If `displayCategory` is null → open the activity switcher (`setShowSwitcher(true)`)

This ensures the Play button ALWAYS does something visible.

### Technical Detail

```typescript
const handleToggleTimer = async () => {
  if (!running) {
    if (displayCategory) {
      await handleStartActivity(displayCategory);
    } else {
      setShowSwitcher(true);
    }
  }
};
```

Single file change, ~3 lines modified.

