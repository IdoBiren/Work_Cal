import { useMemo } from 'react'
import { useWeekAvailability } from './useWeekAvailability'
import { useFixedEmployees } from './useFixedEmployees'
import { useStaff } from './useStaff'
import { useWeekPlan } from './useWeekPlan'
import type { EmployeeAvailability } from '../lib/coverage'

/**
 * Everyone working the week: per-week entries, fixed-schedule employees, account-less staff the
 * manager confirmed for this week, and one-off additions. Unconfirmed staff are returned separately
 * so they can be shown without counting toward coverage.
 */
export function useWeekRoster(weekId: string) {
  const { employees: weeklyEmployees, loading: loadingAvail, error: availError } = useWeekAvailability(weekId)
  const { employees: fixedEmployees, loading: loadingFixed, error: fixedError } = useFixedEmployees()
  const { staff, loading: loadingStaff, error: staffError } = useStaff()
  const plan = useWeekPlan(weekId)

  const { employees, unconfirmedStaff } = useMemo(() => {
    // Fixed employees' permanent schedule always wins over any stale per-week entry of theirs.
    const fixedUids = new Set(fixedEmployees.map((e) => e.uid))
    const confirmed = new Set(plan.confirmedStaff)
    const toEmployee = (s: (typeof staff)[number]): EmployeeAvailability => ({
      uid: `staff:${s.id}`,
      displayName: s.displayName,
      days: s.days,
    })
    const extras: EmployeeAvailability[] = plan.extraShifts.map((x) => ({
      uid: `extra:${x.id}`,
      displayName: x.displayName,
      days: { [x.weekday]: { available: true, start: x.start, end: x.end } },
    }))

    return {
      employees: [
        ...weeklyEmployees.filter((e) => !fixedUids.has(e.uid)),
        ...fixedEmployees,
        ...staff.filter((s) => confirmed.has(s.id)).map(toEmployee),
        ...extras,
      ],
      unconfirmedStaff: staff.filter((s) => !confirmed.has(s.id)).map(toEmployee),
    }
  }, [weeklyEmployees, fixedEmployees, staff, plan.confirmedStaff, plan.extraShifts])

  return {
    employees,
    unconfirmedStaff,
    staff,
    plan,
    loading: loadingAvail || loadingFixed || loadingStaff || plan.loading,
    error: availError ?? fixedError ?? staffError ?? plan.error,
  }
}
