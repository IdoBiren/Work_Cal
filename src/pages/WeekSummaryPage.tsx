import { useMemo, useState } from 'react'
import Layout from '../components/ui/Layout'
import WeekPicker from '../components/WeekPicker'
import CoverageGrid from '../components/CoverageGrid'
import Spinner from '../components/ui/Spinner'
import { useWeekAvailability } from '../data/useWeekAvailability'
import { useRequirements } from '../data/useRequirements'
import { computeCoverage } from '../lib/coverage'
import { weekDates, weekIdOf } from '../lib/dates'

export default function WeekSummaryPage() {
  const [weekId, setWeekId] = useState(weekIdOf(new Date()))
  const { employees, loading: loadingAvail } = useWeekAvailability(weekId)
  const { effective, loading: loadingReq } = useRequirements(weekId)
  const dates = weekDates(weekId)

  const coverage = useMemo(() => computeCoverage(employees, effective), [employees, effective])

  return (
    <Layout>
      <WeekPicker weekId={weekId} onChange={setWeekId} />
      {loadingAvail || loadingReq ? <Spinner /> : <CoverageGrid days={coverage} dates={dates} />}
    </Layout>
  )
}
