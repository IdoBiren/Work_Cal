import { addDays, format, startOfWeek } from 'date-fns'

export const WEEKDAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

/** Weekday indices the system operates on (Sun..Fri) — Saturday is excluded everywhere. */
export const WORKDAYS = [0, 1, 2, 3, 4, 5]

/** weekId = date of the Sunday that starts the week containing `date`, as YYYY-MM-DD. */
export function weekIdOf(date: Date): string {
  const sunday = startOfWeek(date, { weekStartsOn: 0 })
  return format(sunday, 'yyyy-MM-dd')
}

export function weekIdToSunday(weekId: string): Date {
  const [y, m, d] = weekId.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function shiftWeekId(weekId: string, weeks: number): string {
  const sunday = weekIdToSunday(weekId)
  return weekIdOf(addDays(sunday, weeks * 7))
}

/** Returns the 7 dates (Sun..Sat) of the given week. */
export function weekDates(weekId: string): Date[] {
  const sunday = weekIdToSunday(weekId)
  return Array.from({ length: 7 }, (_, i) => addDays(sunday, i))
}

export function formatDayLabel(date: Date): string {
  return format(date, 'd/M')
}
