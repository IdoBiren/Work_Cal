import { SLOT_COUNT, rangeCoversSlot } from './slots'
import { WORKDAYS } from './dates'

export interface DayAvailability {
  available: boolean
  start: string
  end: string
}

export interface EmployeeAvailability {
  uid: string
  displayName: string
  days: Record<number, DayAvailability>
}

export type WeekdayRequirements = Record<number, number[]> // weekday(0-6) -> 9 numbers

export interface SlotCoverage {
  required: number
  have: number
  shortage: number
  availableEmployees: { uid: string; displayName: string }[]
}

export interface DayCoverage {
  weekday: number
  slots: SlotCoverage[]
}

/**
 * Pure function: given who is available and how many are required per hour slot,
 * compute per-day, per-slot coverage and shortages.
 */
export function computeCoverage(
  employees: EmployeeAvailability[],
  requirements: WeekdayRequirements,
): DayCoverage[] {
  const days: DayCoverage[] = []

  for (const weekday of WORKDAYS) {
    const requiredForDay = requirements[weekday] ?? Array(SLOT_COUNT).fill(0)
    const slots: SlotCoverage[] = []

    for (let slotIndex = 0; slotIndex < SLOT_COUNT; slotIndex++) {
      const availableEmployees = employees
        .filter((emp) => {
          const day = emp.days[weekday]
          return day?.available && rangeCoversSlot(day.start, day.end, slotIndex)
        })
        .map((emp) => ({ uid: emp.uid, displayName: emp.displayName }))

      const required = requiredForDay[slotIndex] ?? 0
      const have = availableEmployees.length

      slots.push({
        required,
        have,
        shortage: Math.max(0, required - have),
        availableEmployees,
      })
    }

    days.push({ weekday, slots })
  }

  return days
}
