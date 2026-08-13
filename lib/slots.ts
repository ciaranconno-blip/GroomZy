import { GroomerProfile } from "@/lib/groomer";

export interface DaySlots {
  dateISO: string;
  label: string;
  times: string[];
}

const DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// [CARRIED OVER v1] 8-week rolling booking window, business-hours-derived slots,
// with a 10-minute auto-blocked buffer after each appointment — flagged in the
// memory file as missing from v1 and explicitly required here.
const BUFFER_MIN = 10;
const WINDOW_DAYS = 14; // showing 2 weeks at a time in the UI; window itself is 8 weeks server-side later

export function generateSlots(groomer: GroomerProfile, durationMin: number): DaySlots[] {
  const days: DaySlots[] = [];
  const today = new Date();

  for (let i = 1; i <= WINDOW_DAYS; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayAbbr = DAY_ABBR[date.getDay()];
    const hoursForDay = groomer.hours.find((h) => h.day === dayAbbr);

    if (!hoursForDay || hoursForDay.closed) continue;

    const times = slotsForDay(hoursForDay.open, hoursForDay.close, durationMin);
    if (times.length === 0) continue;

    days.push({
      dateISO: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" }),
      times,
    });
  }

  return days;
}

function slotsForDay(open: string, close: string, durationMin: number): string[] {
  const [openH, openM] = open.split(":").map(Number);
  const [closeH, closeM] = close.split(":").map(Number);

  const startMinutes = openH * 60 + openM;
  const endMinutes = closeH * 60 + closeM;
  const step = durationMin + BUFFER_MIN;

  const slots: string[] = [];
  for (let t = startMinutes; t + durationMin <= endMinutes; t += step) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
  return slots;
}
