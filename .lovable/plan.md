

## Recover orphaned data

All your original data (6 projects, 12 time entries, plus tasks/tags/time_entry_tags) has `user_id = NULL` because it was created before authentication existed. Your new account (`4110b200-faf5-4708-8160-445b4bf81c84`) can't see it due to RLS policies filtering by `auth.uid() = user_id`.

### Plan

**Step 1 — Assign orphaned data to your account**

Run UPDATE statements (via the insert tool) to set `user_id` on all NULL rows across these tables:
- `projects` — 6 rows
- `time_entries` — 12 rows  
- `tasks` — any rows with NULL user_id
- `tags` — any rows with NULL user_id

All will be assigned to your user ID `4110b200-faf5-4708-8160-445b4bf81c84`.

**Step 2 — Verify**

Query each table to confirm no orphaned rows remain.

### Result

After this, logging in will show all your original projects (Proyectos, Aprender AI, JobHunt, Familia, Whanau Support, Rutina) and their associated time entries.

