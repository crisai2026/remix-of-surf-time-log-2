// Fake data for demo mode — fully fictional, no personal context

const now = new Date();

function todayAt(h: number, m: number) {
  const d = new Date(now);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

function daysAgo(days: number, h: number, m: number) {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

function daysAgoEnd(days: number, h: number, m: number) {
  return daysAgo(days, h, m);
}

function dateStr(daysAgoN: number) {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgoN);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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

function makeEntry(id: string, projectIdx: number, taskIdx: number | null, desc: string, daysAgoN: number, startH: number, startM: number, endH: number, endM: number) {
  const start = daysAgo(daysAgoN, startH, startM);
  const end = daysAgoEnd(daysAgoN, endH, endM);
  const duration = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 1000);
  return {
    id, project_id: DEMO_PROJECTS[projectIdx].id, description: desc,
    start_time: start, end_time: end, duration_seconds: duration,
    is_running: false, is_out_of_plan: false, paused_at: null, paused_seconds: 0,
    motor: null, task_id: taskIdx !== null ? DEMO_TASKS[taskIdx].id : null,
    calendar_event_id: null, planned_category: null,
    created_at: now.toISOString(), user_id: null,
    projects: DEMO_PROJECTS[projectIdx],
    tasks: taskIdx !== null ? DEMO_TASKS[taskIdx] : null,
  };
}

// Today's entries
export const DEMO_TIME_ENTRIES = [
  makeEntry("demo-e1", 0, 0, "Write documentation", 0, 9, 0, 10, 30),
  makeEntry("demo-e2", 1, 1, "Watch lecture 4", 0, 10, 45, 11, 40),
  makeEntry("demo-e3", 2, 2, "Build landing page", 0, 13, 0, 14, 15),
  makeEntry("demo-e4", 3, 3, "Review inbox", 0, 14, 30, 15, 0),
  makeEntry("demo-e5", 4, 4, "Plan sprint", 0, 15, 15, 16, 0),
];

// Extended entries spanning the current week (for Dashboard, Alignment, Log)
export const DEMO_WEEK_ENTRIES = [
  // Today
  ...DEMO_TIME_ENTRIES,
  // Yesterday
  makeEntry("demo-w1", 0, 0, "Refactor module", 1, 9, 0, 11, 0),
  makeEntry("demo-w2", 1, 1, "Read paper on transformers", 1, 11, 30, 12, 30),
  makeEntry("demo-w3", 4, 4, "Weekly review", 1, 14, 0, 15, 0),
  // 2 days ago
  makeEntry("demo-w4", 0, 0, "Code review", 2, 9, 0, 10, 30),
  makeEntry("demo-w5", 2, 2, "API integration", 2, 10, 45, 12, 15),
  makeEntry("demo-w6", 3, 3, "Team sync", 2, 13, 0, 13, 45),
  // 3 days ago
  makeEntry("demo-w7", 1, 1, "Complete exercises", 3, 9, 0, 10, 45),
  makeEntry("demo-w8", 0, 0, "Architecture design", 3, 11, 0, 13, 0),
  makeEntry("demo-w9", 4, 4, "Backlog grooming", 3, 14, 0, 15, 30),
  // 4 days ago
  makeEntry("demo-w10", 2, 2, "Database schema", 4, 9, 0, 11, 0),
  makeEntry("demo-w11", 0, 0, "Write tests", 4, 11, 30, 13, 0),
  makeEntry("demo-w12", 3, 3, "Process emails", 4, 14, 0, 14, 30),
  // 5 days ago
  makeEntry("demo-w13", 1, 1, "Watch lecture 3", 5, 9, 0, 10, 30),
  makeEntry("demo-w14", 0, 0, "Deploy pipeline", 5, 10, 45, 12, 30),
  // 6 days ago
  makeEntry("demo-w15", 2, 2, "UI components", 6, 10, 0, 12, 0),
  makeEntry("demo-w16", 4, 4, "Sprint planning", 6, 13, 0, 14, 30),
];

// Entries for trend (past weeks)
export const DEMO_TREND_ENTRIES = [
  // 1 week ago
  makeEntry("demo-tr1", 0, null, "Deep Work", 8, 9, 0, 11, 0),
  makeEntry("demo-tr2", 1, null, "Learn AI", 9, 10, 0, 11, 30),
  makeEntry("demo-tr3", 2, null, "Side Project", 10, 9, 0, 11, 0),
  makeEntry("demo-tr4", 0, null, "Deep Work", 11, 9, 0, 12, 0),
  // 2 weeks ago
  makeEntry("demo-tr5", 0, null, "Deep Work", 15, 9, 0, 11, 0),
  makeEntry("demo-tr6", 1, null, "Learn AI", 16, 10, 0, 12, 0),
  makeEntry("demo-tr7", 2, null, "Side Project", 17, 9, 0, 10, 30),
  // 3 weeks ago
  makeEntry("demo-tr8", 0, null, "Deep Work", 22, 9, 0, 11, 30),
  makeEntry("demo-tr9", 1, null, "Learn AI", 23, 10, 0, 11, 0),
];

// Heatmap entries (past 12 weeks)
export const DEMO_HEATMAP_ENTRIES = [
  ...DEMO_WEEK_ENTRIES,
  ...DEMO_TREND_ENTRIES,
  // Scatter more entries across past weeks
  ...[14, 18, 20, 25, 27, 30, 32, 35, 38, 40, 42, 45, 48, 50, 55, 58, 60, 65, 70, 75].map((d, i) => 
    makeEntry(`demo-hm${i}`, i % 5, null, DEMO_PROJECTS[i % 5].name, d, 9, 0, 10 + (i % 3), 0)
  ),
];

export const DEMO_TAGS = [
  { id: "demo-tag1", name: "Deep work", color: "#6366F1", created_at: now.toISOString(), user_id: null },
  { id: "demo-tag2", name: "Planning", color: "#D97706", created_at: now.toISOString(), user_id: null },
];

export const DEMO_STREAK = 5;

// --- DEMO WEEKLY PLAN (fictional, no personal categories) ---
import type { PlanBlock, CategoryStyle } from "@/lib/weeklyPlan";

export const DEMO_CATEGORY_STYLES: Record<string, CategoryStyle> = {
  deepwork:    { textColor: "#0C447C", lightBg: "#E6F1FB", darkBg: "#152840", motorLabel: "Engine 1 · Deep Work" },
  learnai:     { textColor: "#6366F1", lightBg: "#EEEDFE", darkBg: "#2A2854", motorLabel: "Engine 2 · Learn AI" },
  sideproject: { textColor: "#2E7D32", lightBg: "#E8F5E9", darkBg: "#1B3A1B", motorLabel: "Engine 3 · Side Project" },
  admin:       { textColor: "#78716C", lightBg: "#F5F5F4", darkBg: "#2A2724" },
  focusblock:  { textColor: "#D97706", lightBg: "#FEF3C7", darkBg: "#3A2E10" },
};

export const DEMO_CATEGORY_TO_PROJECT: Record<string, string> = {
  deepwork: "Deep Work",
  learnai: "Learn AI",
  sideproject: "Side Project",
  admin: "Admin",
  focusblock: "Focus Block",
};

export const DEMO_ACTIVITY_OPTIONS = [
  { label: "Deep Work", category: "deepwork", motor: 1 },
  { label: "Learn AI", category: "learnai", motor: 2 },
  { label: "Side Project", category: "sideproject", motor: 3 },
  { label: "Admin", category: "admin" },
  { label: "Focus Block", category: "focusblock" },
];

export const DEMO_WEEKLY_PLAN: PlanBlock[][] = [
  // Monday
  [
    { start: "09:00", end: "11:30", activity: "Deep Work", category: "deepwork", motor: 1 },
    { start: "11:45", end: "12:30", activity: "Learn AI", category: "learnai", motor: 2 },
    { start: "13:30", end: "15:00", activity: "Side Project", category: "sideproject", motor: 3 },
    { start: "15:15", end: "16:00", activity: "Admin", category: "admin" },
  ],
  // Tuesday
  [
    { start: "09:00", end: "10:30", activity: "Focus Block", category: "focusblock" },
    { start: "10:45", end: "12:30", activity: "Deep Work", category: "deepwork", motor: 1 },
    { start: "13:30", end: "14:15", activity: "Learn AI", category: "learnai", motor: 2 },
    { start: "14:30", end: "16:00", activity: "Side Project", category: "sideproject", motor: 3 },
  ],
  // Wednesday
  [
    { start: "09:00", end: "11:00", activity: "Deep Work", category: "deepwork", motor: 1 },
    { start: "11:15", end: "12:00", activity: "Learn AI", category: "learnai", motor: 2 },
    { start: "13:00", end: "14:30", activity: "Side Project", category: "sideproject", motor: 3 },
    { start: "14:45", end: "15:30", activity: "Admin", category: "admin" },
  ],
  // Thursday
  [
    { start: "09:00", end: "11:30", activity: "Deep Work", category: "deepwork", motor: 1 },
    { start: "11:45", end: "12:30", activity: "Learn AI", category: "learnai", motor: 2 },
    { start: "13:30", end: "15:00", activity: "Focus Block", category: "focusblock" },
    { start: "15:15", end: "16:00", activity: "Admin", category: "admin" },
  ],
  // Friday
  [
    { start: "09:00", end: "10:30", activity: "Deep Work", category: "deepwork", motor: 1 },
    { start: "10:45", end: "11:30", activity: "Learn AI", category: "learnai", motor: 2 },
    { start: "12:00", end: "13:30", activity: "Side Project", category: "sideproject", motor: 3 },
    { start: "14:00", end: "15:00", activity: "Focus Block", category: "focusblock" },
  ],
];

export const DEMO_MOTOR_GOALS: Record<number, { label: string; category: string; weeklyHours: number }> = {
  1: { label: "Engine 1 · Deep Work", category: "deepwork", weeklyHours: 12 },
  2: { label: "Engine 2 · Learn AI", category: "learnai", weeklyHours: 8 },
  3: { label: "Engine 3 · Side Project", category: "sideproject", weeklyHours: 6 },
};
