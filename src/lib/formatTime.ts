const TZ = "Pacific/Auckland";

/** Convert a UTC ISO string to NZDT date string YYYY-MM-DD */
export function toNZDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-CA", { timeZone: TZ });
}

/** Get today's date in NZDT as YYYY-MM-DD */
export function todayISO(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

/** Get NZDT midnight for a given YYYY-MM-DD date as a UTC ISO string */
export function nzMidnightToUTC(dateStr: string): string {
  // Create a date at midnight in NZ timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  });
  // We need to find the UTC time that corresponds to midnight NZ on dateStr
  // Approach: parse dateStr, set to NZ midnight by calculating offset
  const [y, m, d] = dateStr.split("-").map(Number);
  // Create a rough date and adjust
  const rough = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  // Get what NZ date this rough UTC date maps to
  const nzDate = rough.toLocaleDateString("en-CA", { timeZone: TZ });
  const [ny, nm, nd] = nzDate.split("-").map(Number);
  // Adjust by the difference in days
  const dayDiff = (ny * 10000 + nm * 100 + nd) - (y * 10000 + m * 100 + d);
  rough.setUTCDate(rough.getUTCDate() - dayDiff);
  // Fine-tune: find exact NZ midnight
  const nzCheck = rough.toLocaleDateString("en-CA", { timeZone: TZ });
  if (nzCheck !== dateStr) {
    rough.setUTCDate(rough.getUTCDate() + (nzCheck < dateStr ? 1 : -1));
  }
  // Now rough is close to NZ midnight, adjust hours
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ, hour: "numeric", minute: "numeric", second: "numeric", hour12: false,
  }).formatToParts(rough);
  const h = parseInt(parts.find(p => p.type === "hour")?.value || "0");
  const min = parseInt(parts.find(p => p.type === "minute")?.value || "0");
  const s = parseInt(parts.find(p => p.type === "second")?.value || "0");
  rough.setUTCHours(rough.getUTCHours() - h);
  rough.setUTCMinutes(rough.getUTCMinutes() - min);
  rough.setUTCSeconds(rough.getUTCSeconds() - s);
  return rough.toISOString();
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
}

export function formatTimer(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString("en-NZ", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  });
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString("en-NZ", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: TZ,
  });
}

export function getWeekDates(): string[] {
  return getWeekDatesForOffset(0);
}

export function getWeekDatesForOffset(offset: number): string[] {
  // Get today in NZDT
  const todayStr = todayISO();
  const [y, m, d] = todayStr.split("-").map(Number);
  const today = new Date(y, m - 1, d);
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((day + 6) % 7) + offset * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(monday);
    dt.setDate(monday.getDate() + i);
    const yy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
  });
}
