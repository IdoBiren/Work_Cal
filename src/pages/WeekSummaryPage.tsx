import { useMemo, useState } from 'react'
import Layout from '../components/ui/Layout'
import WeekPicker from '../components/WeekPicker'
import CoverageGrid from '../components/CoverageGrid'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'
import { useWeekAvailability } from '../data/useWeekAvailability'
import { useRequirements } from '../data/useRequirements'
import { computeCoverage } from '../lib/coverage'
import { buildScheduleText } from '../lib/schedule'
import { weekDates, weekIdOf } from '../lib/dates'

export default function WeekSummaryPage() {
  const [weekId, setWeekId] = useState(weekIdOf(new Date()))
  const { employees, loading: loadingAvail } = useWeekAvailability(weekId)
  const { effective, loading: loadingReq } = useRequirements(weekId)
  const dates = weekDates(weekId)
  const [copyStatus, setCopyStatus] = useState<'copied' | null>(null)

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
        <Button variant="secondary" onClick={handleCopySchedule} disabled={loadingAvail}>
          העתק סידור
        </Button>
        {copyStatus === 'copied' && <p className="text-xs text-green-600 mt-1">הועתק!</p>}
      </div>
      {loadingAvail || loadingReq ? (
        <Spinner />
      ) : (
        <CoverageGrid days={coverage} dates={dates} employees={employees} />
      )}
    </Layout>
  )
}
