// Fake data for demo mode — matches the real app's data shapes

const now = new Date();
const today = now.toISOString().split("T")[0];

function todayAt(h: number, m: number) {
  const d = new Date(now);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

export const DEMO_PROJECTS = [
  { id: "demo-p1", name: "Learn AI", color: "#0C447C", sort_order: 0, created_at: now.toISOString(), icon: null, motor_number: 1, user_id: null, weekly_goal_hours: 10 },
  { id: "demo-p2", name: "Side project", color: "#2E7D32", sort_order: 1, created_at: now.toISOString(), icon: null, motor_number: 2, user_id: null, weekly_goal_hours: 8 },
  { id: "demo-p3", name: "Exercise", color: "#E65100", sort_order: 2, created_at: now.toISOString(), icon: null, motor_number: 3, user_id: null, weekly_goal_hours: 5 },
];

export const DEMO_TASKS = [
  { id: "demo-t1", name: "Neural networks", project_id: "demo-p1", created_at: now.toISOString(), user_id: null },
  { id: "demo-t2", name: "Auth flow", project_id: "demo-p2", created_at: now.toISOString(), user_id: null },
];

export const DEMO_TIME_ENTRIES = [
  {
    id: "demo-e1", project_id: "demo-p1", description: "Neural networks chapter",
    start_time: todayAt(9, 0), end_time: todayAt(10, 12), duration_seconds: 4320,
    is_running: false, is_out_of_plan: false, paused_at: null, paused_seconds: 0,
    motor: null, task_id: "demo-t1", calendar_event_id: null, planned_category: null,
    created_at: now.toISOString(), user_id: null,
    projects: DEMO_PROJECTS[0], tasks: DEMO_TASKS[0],
  },
  {
    id: "demo-e2", project_id: "demo-p2", description: "Auth flow",
    start_time: todayAt(10, 30), end_time: todayAt(11, 18), duration_seconds: 2880,
    is_running: false, is_out_of_plan: false, paused_at: null, paused_seconds: 0,
    motor: null, task_id: "demo-t2", calendar_event_id: null, planned_category: null,
    created_at: now.toISOString(), user_id: null,
    projects: DEMO_PROJECTS[1], tasks: DEMO_TASKS[1],
  },
  {
    id: "demo-e3", project_id: "demo-p3", description: "Morning run",
    start_time: todayAt(7, 0), end_time: todayAt(7, 40), duration_seconds: 2400,
    is_running: false, is_out_of_plan: false, paused_at: null, paused_seconds: 0,
    motor: null, task_id: null, calendar_event_id: null, planned_category: null,
    created_at: now.toISOString(), user_id: null,
    projects: DEMO_PROJECTS[2], tasks: null,
  },
];

export const DEMO_TAGS = [
  { id: "demo-tag1", name: "Deep work", color: "#6366F1", created_at: now.toISOString(), user_id: null },
  { id: "demo-tag2", name: "Cardio", color: "#EF4444", created_at: now.toISOString(), user_id: null },
];
