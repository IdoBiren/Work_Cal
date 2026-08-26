export const SLOT_START_HOUR = 7
export const SLOT_END_HOUR = 16
export const SLOT_COUNT = SLOT_END_HOUR - SLOT_START_HOUR

/** Friday (weekday index 5, Sunday=0) is a short day. */
const FRIDAY_WEEKDAY = 5
const FRIDAY_END_HOUR = 13

export function dayEndHour(weekday: number): number {
  return weekday === FRIDAY_WEEKDAY ? FRIDAY_END_HOUR : SLOT_END_HOUR
}

/** How many of the SLOT_COUNT hourly slots are actually in use for this weekday. */
export function slotCountForDay(weekday: number): number {
  return dayEndHour(weekday) - SLOT_START_HOUR
}

export function slotLabel(index: number): string {
  const hour = SLOT_START_HOUR + index
  return `${String(hour).padStart(2, '0')}:00–${String(hour + 1).padStart(2, '0')}:00`
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Does the half-open range [start, end) cover the full hour of slot `index`? */
export function rangeCoversSlot(start: string, end: string, index: number): boolean {
  const slotStart = (SLOT_START_HOUR + index) * 60
  const slotEnd = slotStart + 60
  const startMin = timeToMinutes(start)
  const endMin = timeToMinutes(end)
  return startMin <= slotStart && endMin >= slotEnd
}

export const DEFAULT_START = `${String(SLOT_START_HOUR).padStart(2, '0')}:00`
export const DEFAULT_END = `${String(SLOT_END_HOUR).padStart(2, '0')}:00`

export function defaultEndForDay(weekday: number): string {
  return `${String(dayEndHour(weekday)).padStart(2, '0')}:00`
}

/** Drops a leading zero for display: "09:00" -> "9:00". */
export function shortTime(time: string): string {
  const [h, m] = time.split(':')
  return `${Number(h)}:${m}`
}
