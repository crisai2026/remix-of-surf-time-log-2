// Weekly plan data structure
// Days: 0=Monday, 1=Tuesday, 2=Wednesday, 3=Thursday, 4=Friday

export interface PlanBlock {
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
  activity: string;
  category: string; // lowercase key
  motor?: number;   // 1, 2, or 3
}

export interface CategoryStyle {
  textColor: string;
  lightBg: string;
  darkBg: string;
  motorLabel?: string;
}

export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  jobhunt:   { textColor: "#3C3489", lightBg: "#EEEDFE", darkBg: "#2A2854", motorLabel: "Motor 1 · Cash" },
  proyectos: { textColor: "#96680A", lightBg: "#FAEEDA", darkBg: "#3A2E10", motorLabel: "Motor 3 · Proyectos" },
  ai:        { textColor: "#0C447C", lightBg: "#E6F1FB", darkBg: "#152840", motorLabel: "Motor 2 · AI" },
  familia:   { textColor: "#72243E", lightBg: "#FBEAF0", darkBg: "#3A1828", motorLabel: "Motor 4 · Familia" },
  whanau:    { textColor: "#2C2C2A", lightBg: "#D3D1C7", darkBg: "#34332E" },
  hijas:     { textColor: "#4B1528", lightBg: "#F4C0D1", darkBg: "#3A1828" },
  rutina:    { textColor: "#777777", lightBg: "#EDEBE8", darkBg: "#2A2724" },
  buffer:    { textColor: "#AAAAAA", lightBg: "#F5F5F5", darkBg: "#2A2724" },
};

export const ACTIVITY_OPTIONS = [
  { label: "Jobhunt", category: "jobhunt", motor: 1 },
  { label: "Proyectos", category: "proyectos", motor: 3 },
  { label: "Aprender AI", category: "ai", motor: 2 },
  { label: "Familia", category: "familia", motor: 4 },
  { label: "Whanau Support", category: "whanau" },
  { label: "Tarde hijas", category: "hijas" },
];

export const MOTOR_GOALS: Record<number, { label: string; category: string; weeklyHours: number }> = {
  1: { label: "Motor 1 · Cash", category: "jobhunt", weeklyHours: 7.5 },
  2: { label: "Motor 2 · AI", category: "ai", weeklyHours: 4 },
  3: { label: "Motor 3 · Proyectos", category: "proyectos", weeklyHours: 5 },
  4: { label: "Motor 4 · Familia", category: "familia", weeklyHours: 3.5 },
};

// Map categories to project names in DB
export const CATEGORY_TO_PROJECT: Record<string, string> = {
  jobhunt: "Jobhunt",
  ai: "Aprender AI",
  proyectos: "Proyectos",
  familia: "Familia",
  whanau: "Whanau Support",
  hijas: "Tarde hijas",
  rutina: "Rutina",
  buffer: "Buffer",
};

export const WEEKLY_PLAN: PlanBlock[][] = [
  // Monday (0)
  [
    { start: "07:15", end: "08:30", activity: "Despertar/desayuno", category: "rutina" },
    { start: "08:30", end: "09:00", activity: "Drop Off", category: "rutina" },
    { start: "09:00", end: "09:30", activity: "Ordenar", category: "rutina" },
    { start: "09:30", end: "11:00", activity: "Prep reunión", category: "familia", motor: 4 },
    { start: "11:00", end: "13:00", activity: "Jobhunt", category: "jobhunt", motor: 1 },
    { start: "13:30", end: "14:15", activity: "Aprender AI", category: "ai", motor: 2 },
    { start: "15:00", end: "17:30", activity: "Whanau Support", category: "whanau" },
  ],
  // Tuesday (1)
  [
    { start: "07:15", end: "08:30", activity: "Despertar/desayuno", category: "rutina" },
    { start: "08:30", end: "09:00", activity: "Ordenar", category: "rutina" },
    { start: "09:00", end: "09:30", activity: "Buffer", category: "buffer" },
    { start: "09:30", end: "11:30", activity: "Reunión hermanos", category: "familia" },
    { start: "12:00", end: "13:30", activity: "Proyectos", category: "proyectos", motor: 3 },
    { start: "13:45", end: "14:30", activity: "Aprender AI", category: "ai", motor: 2 },
    { start: "15:00", end: "17:30", activity: "Tarde hijas", category: "hijas" },
  ],
  // Wednesday (2)
  [
    { start: "07:15", end: "08:30", activity: "Despertar/desayuno", category: "rutina" },
    { start: "08:30", end: "09:00", activity: "Drop Off", category: "rutina" },
    { start: "09:00", end: "09:30", activity: "Ordenar", category: "rutina" },
    { start: "09:30", end: "12:00", activity: "Jobhunt", category: "jobhunt", motor: 1 },
    { start: "13:00", end: "13:45", activity: "Aprender AI", category: "ai", motor: 2 },
    { start: "15:00", end: "17:30", activity: "Whanau Support", category: "whanau" },
  ],
  // Thursday (3)
  [
    { start: "07:15", end: "08:30", activity: "Despertar/desayuno", category: "rutina" },
    { start: "08:30", end: "09:00", activity: "Drop Off", category: "rutina" },
    { start: "09:00", end: "09:30", activity: "Ordenar", category: "rutina" },
    { start: "09:30", end: "12:00", activity: "Proyectos", category: "proyectos", motor: 3 },
    { start: "13:00", end: "13:45", activity: "Aprender AI", category: "ai", motor: 2 },
    { start: "15:00", end: "17:30", activity: "Whanau Support", category: "whanau" },
  ],
  // Friday (4)
  [
    { start: "07:15", end: "08:30", activity: "Despertar/desayuno", category: "rutina" },
    { start: "08:30", end: "09:00", activity: "Ordenar", category: "rutina" },
    { start: "09:00", end: "11:00", activity: "Jobhunt", category: "jobhunt", motor: 1 },
    { start: "11:30", end: "13:00", activity: "Proyectos", category: "proyectos", motor: 3 },
    { start: "13:15", end: "14:00", activity: "Aprender AI", category: "ai", motor: 2 },
    { start: "14:00", end: "14:30", activity: "Buffer", category: "buffer" },
  ],
];

export function getCurrentDayIndex(): number {
  const d = new Date().getDay();
  return (d + 6) % 7; // 0=Mon, 6=Sun
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function getCurrentBlock(): { block: PlanBlock; index: number } | null {
  const dayIndex = getCurrentDayIndex();
  if (dayIndex > 4) return null; // weekend
  const plan = WEEKLY_PLAN[dayIndex];
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  
  for (let i = 0; i < plan.length; i++) {
    const b = plan[i];
    if (nowMin >= timeToMinutes(b.start) && nowMin < timeToMinutes(b.end)) {
      return { block: b, index: i };
    }
  }
  return null;
}

export function getNextBlock(): PlanBlock | null {
  const dayIndex = getCurrentDayIndex();
  if (dayIndex > 4) return null;
  const plan = WEEKLY_PLAN[dayIndex];
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  
  for (const b of plan) {
    if (timeToMinutes(b.start) > nowMin) return b;
  }
  return null;
}

export function getTodayPlan(): PlanBlock[] {
  const dayIndex = getCurrentDayIndex();
  if (dayIndex > 4) return [];
  return WEEKLY_PLAN[dayIndex];
}

export function getDayName(dayIndex: number): string {
  const names = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  return names[dayIndex] || "";
}

export function getPlannedMinutesForWeek(category: string): number {
  let total = 0;
  for (const day of WEEKLY_PLAN) {
    for (const block of day) {
      if (block.category === category) {
        total += timeToMinutes(block.end) - timeToMinutes(block.start);
      }
    }
  }
  return total;
}

export function getPlannedMinutesForDay(dayIndex: number, category: string): number {
  if (dayIndex > 4) return 0;
  const plan = WEEKLY_PLAN[dayIndex];
  let total = 0;
  for (const block of plan) {
    if (block.category === category) {
      total += timeToMinutes(block.end) - timeToMinutes(block.start);
    }
  }
  return total;
}
