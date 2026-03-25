// Fake data for demo mode — fully fictional, no personal context

const now = new Date();

function todayAt(h: number, m: number) {
  const d = new Date(now);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

export const DEMO_PROJECTS = [
  { id: "demo-p1", name: "Deep Work", color: "#0C447C", sort_order: 0, created_at: now.toISOString(), icon: null, motor_number: 1, user_id: null, weekly_goal_hours: 12 },
  { id: "demo-p2", name: "Learn AI", color: "#6366F1", sort_order: 1, created_at: now.toISOString(), icon: null, motor_number: 2, user_id: null, weekly_goal_hours: 8 },
  { id: "demo-p3", name: "Side Project", color: "#2E7D32", sort_order: 2, created_at: now.toISOString(), icon: null, motor_number: 3, user_id: null, weekly_goal_hours: 6 },
  { id: "demo-p4", name: "Admin", color: "#78716C", sort_order: 3, created_at: now.toISOString(), icon: null, motor_number: null, user_id: null, weekly_goal_hours: 4 },
  { id: "demo-p5", name: "Focus Block", color: "#D97706", sort_order: 4, created_at: now.toISOString(), icon: null, motor_number: null, user_id: null, weekly_goal_hours: 5 },
];

export const DEMO_TASKS = [
  { id: "demo-t1", name: "Write documentation", project_id: "demo-p1", created_at: now.toISOString(), user_id: null },
  { id: "demo-t2", name: "Watch lecture 4", project_id: "demo-p2", created_at: now.toISOString(), user_id: null },
  { id: "demo-t3", name: "Build landing page", project_id: "demo-p3", created_at: now.toISOString(), user_id: null },
  { id: "demo-t4", name: "Review inbox", project_id: "demo-p4", created_at: now.toISOString(), user_id: null },
  { id: "demo-t5", name: "Plan sprint", project_id: "demo-p5", created_at: now.toISOString(), user_id: null },
];

export const DEMO_TIME_ENTRIES = [
  {
    id: "demo-e1", project_id: "demo-p1", description: "Write documentation",
    start_time: todayAt(9, 0), end_time: todayAt(10, 30), duration_seconds: 5400,
    is_running: false, is_out_of_plan: false, paused_at: null, paused_seconds: 0,
    motor: null, task_id: "demo-t1", calendar_event_id: null, planned_category: null,
    created_at: now.toISOString(), user_id: null,
    projects: DEMO_PROJECTS[0], tasks: DEMO_TASKS[0],
  },
  {
    id: "demo-e2", project_id: "demo-p2", description: "Watch lecture 4",
    start_time: todayAt(10, 45), end_time: todayAt(11, 40), duration_seconds: 3300,
    is_running: false, is_out_of_plan: false, paused_at: null, paused_seconds: 0,
    motor: null, task_id: "demo-t2", calendar_event_id: null, planned_category: null,
    created_at: now.toISOString(), user_id: null,
    projects: DEMO_PROJECTS[1], tasks: DEMO_TASKS[1],
  },
  {
    id: "demo-e3", project_id: "demo-p3", description: "Build landing page",
    start_time: todayAt(13, 0), end_time: todayAt(14, 15), duration_seconds: 4500,
    is_running: false, is_out_of_plan: false, paused_at: null, paused_seconds: 0,
    motor: null, task_id: "demo-t3", calendar_event_id: null, planned_category: null,
    created_at: now.toISOString(), user_id: null,
    projects: DEMO_PROJECTS[2], tasks: DEMO_TASKS[2],
  },
  {
    id: "demo-e4", project_id: "demo-p4", description: "Review inbox",
    start_time: todayAt(14, 30), end_time: todayAt(15, 0), duration_seconds: 1800,
    is_running: false, is_out_of_plan: false, paused_at: null, paused_seconds: 0,
    motor: null, task_id: "demo-t4", calendar_event_id: null, planned_category: null,
    created_at: now.toISOString(), user_id: null,
    projects: DEMO_PROJECTS[3], tasks: DEMO_TASKS[3],
  },
  {
    id: "demo-e5", project_id: "demo-p5", description: "Plan sprint",
    start_time: todayAt(15, 15), end_time: todayAt(16, 0), duration_seconds: 2700,
    is_running: false, is_out_of_plan: false, paused_at: null, paused_seconds: 0,
    motor: null, task_id: "demo-t5", calendar_event_id: null, planned_category: null,
    created_at: now.toISOString(), user_id: null,
    projects: DEMO_PROJECTS[4], tasks: DEMO_TASKS[4],
  },
];

export const DEMO_TAGS = [
  { id: "demo-tag1", name: "Deep work", color: "#6366F1", created_at: now.toISOString(), user_id: null },
  { id: "demo-tag2", name: "Planning", color: "#D97706", created_at: now.toISOString(), user_id: null },
];
