import { useMemo } from 'react'
import { useWeekAvailability } from './useWeekAvailability'
import { useFixedEmployees } from './useFixedEmployees'

/** Everyone's availability for the week: per-week entries plus fixed-schedule employees. */
export function useWeekRoster(weekId: string) {
  const { employees: weeklyEmployees, loading: loadingAvail, error: availError } = useWeekAvailability(weekId)
  const { employees: fixedEmployees, loading: loadingFixed, error: fixedError } = useFixedEmployees()

  // Fixed employees' permanent schedule always wins over any stale per-week entry of theirs.
  const employees = useMemo(() => {
    const fixedUids = new Set(fixedEmployees.map((e) => e.uid))
    return [...weeklyEmployees.filter((e) => !fixedUids.has(e.uid)), ...fixedEmployees]
  }, [weeklyEmployees, fixedEmployees])

  return { employees, loading: loadingAvail || loadingFixed, error: availError ?? fixedError }
}
