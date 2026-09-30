import { DAY_SHORT_LABELS, WORKDAYS, formatDayLabel, weekDates } from './dates'
import { SLOT_START_HOUR, dayEndHour, shortTime } from './slots'
import type { EmployeeAvailability } from './coverage'

const DAY_START = `${String(SLOT_START_HOUR).padStart(2, '0')}:00`

function dayEndTime(weekday: number): string {
  return `${String(dayEndHour(weekday)).padStart(2, '0')}:00`
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName
}

/** First names always listed first in a copied day, in this order; everyone else keeps their original order after them. */
const PRIORITY_FIRST_NAMES = [['נאוה', 'נירית'], ['אסיף']]

function priorityOf(name: string): number {
  const first = firstName(name)
  const rank = PRIORITY_FIRST_NAMES.findIndex((group) => group.includes(first))
  return rank === -1 ? PRIORITY_FIRST_NAMES.length : rank
}

/** e.g. "הדר מ 9:00" or "מריאל עד 13:00" or plain "יהונתן" if available the whole day. */
export function formatEmployeeForDay(name: string, start: string, end: string, weekday: number): string {
  let label = name
  if (start > DAY_START) label += ` מ ${shortTime(start)}`
  if (end < dayEndTime(weekday)) label += ` עד ${shortTime(end)}`
  return label
}

/** Builds a copy-paste-ready weekly schedule as plain text, from who's available each day. */
export function buildScheduleText(weekId: string, employees: EmployeeAvailability[]): string {
  const dates = weekDates(weekId)
  const header = `הסידור לשבוע ${formatDayLabel(dates[0])}–${formatDayLabel(dates[5])}:`

  const lines = WORKDAYS.map((weekday) => {
    const names = employees
      .filter((emp) => emp.days[weekday]?.available)
      .sort((a, b) => priorityOf(a.displayName) - priorityOf(b.displayName))
      .map((emp) => formatEmployeeForDay(firstName(emp.displayName), emp.days[weekday].start, emp.days[weekday].end, weekday))

    return `${DAY_SHORT_LABELS[weekday]}-${names.length > 0 ? names.join(', ') : 'אין'}`
  })

  return [header, ...lines].join('\n')
}
