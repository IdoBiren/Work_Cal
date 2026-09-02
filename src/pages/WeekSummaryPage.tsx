import { useMemo, useState } from 'react'
import Layout from '../components/ui/Layout'
import WeekPicker from '../components/WeekPicker'
import CoverageGrid from '../components/CoverageGrid'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'
import ErrorNote from '../components/ui/ErrorNote'
import { useWeekAvailability } from '../data/useWeekAvailability'
import { useFixedEmployees } from '../data/useFixedEmployees'
import { useRequirements } from '../data/useRequirements'
import { computeCoverage } from '../lib/coverage'
import { buildScheduleText } from '../lib/schedule'
import { weekDates, weekIdOf } from '../lib/dates'

export default function WeekSummaryPage() {
  const [weekId, setWeekId] = useState(weekIdOf(new Date()))
  const { employees: weeklyEmployees, loading: loadingAvail, error: availError } = useWeekAvailability(weekId)
  const { employees: fixedEmployees, loading: loadingFixed, error: fixedError } = useFixedEmployees()
  const { effective, loading: loadingReq } = useRequirements(weekId)
  const dates = weekDates(weekId)
  const [copyStatus, setCopyStatus] = useState<'copied' | null>(null)

  // Fixed employees' permanent schedule always wins over any stale per-week entry of theirs.
  const employees = useMemo(() => {
    const fixedUids = new Set(fixedEmployees.map((e) => e.uid))
    return [...weeklyEmployees.filter((e) => !fixedUids.has(e.uid)), ...fixedEmployees]
  }, [weeklyEmployees, fixedEmployees])

  const loading = loadingAvail || loadingFixed

  const coverage = useMemo(() => computeCoverage(employees, effective), [employees, effective])

  const handleCopySchedule = async () => {
    const text = buildScheduleText(weekId, employees)
    try {
      await navigator.clipboard.writeText(text)
      setCopyStatus('copied')
      setTimeout(() => setCopyStatus(null), 2000)
    } catch {
      window.prompt('העתק ידנית (Ctrl+C):', text)
    }
  }

  return (
    <Layout>
      <WeekPicker weekId={weekId} onChange={setWeekId} />
      <div className="mb-3">
        <Button variant="secondary" onClick={handleCopySchedule} disabled={loading}>
          העתק סידור
        </Button>
        {copyStatus === 'copied' && <p className="text-xs text-green-600 mt-1">הועתק!</p>}
      </div>
      <ErrorNote message={availError ?? fixedError} />
      {loading || loadingReq ? (
        <Spinner />
      ) : (
        <CoverageGrid days={coverage} dates={dates} employees={employees} />
      )}
    </Layout>
  )
}
