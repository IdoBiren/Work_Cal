import { useMemo, useState } from 'react'
import Layout from '../components/ui/Layout'
import WeekPicker from '../components/WeekPicker'
import CoverageGrid from '../components/CoverageGrid'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'
import ErrorNote from '../components/ui/ErrorNote'
import { useWeekRoster } from '../data/useWeekRoster'
import { useRequirements } from '../data/useRequirements'
import { computeCoverage } from '../lib/coverage'
import { buildScheduleText } from '../lib/schedule'
import { DAY_SHORT_LABELS, WORKDAYS, weekDates, weekIdOf } from '../lib/dates'
import { shortTime } from '../lib/slots'
import type { StaffMember } from '../data/useStaff'

/** e.g. "א, ב 9:00–13:00, ה" — a compact reminder of a staff member's fixed days. */
function staffDaysSummary(member: StaffMember): string {
  const parts = WORKDAYS.filter((d) => member.days[d]?.available).map(
    (d) => `${DAY_SHORT_LABELS[d]} ${shortTime(member.days[d].start)}–${shortTime(member.days[d].end)}`,
  )
  return parts.length > 0 ? parts.join(', ') : 'לא הוגדרו ימים'
}

export default function WeekSummaryPage() {
  const [weekId, setWeekId] = useState(weekIdOf(new Date()))
  const { employees, unconfirmedStaff, staff, plan, loading, error } = useWeekRoster(weekId)
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
        <Button variant="secondary" onClick={handleCopySchedule} disabled={loading}>
          העתק סידור
        </Button>
        {copyStatus === 'copied' && <p className="text-xs text-green-600 mt-1">הועתק!</p>}
      </div>
      <ErrorNote message={error} />
      {loading || loadingReq ? (
        <Spinner />
      ) : (
        <>
          {staff.length > 0 && (
            <Card className="mb-3">
              <h2 className="font-bold text-slate-800 mb-1">אישור נוכחות לשבוע</h2>
              <p className="text-xs text-slate-500 mb-2">סמנו מי מהעובדים הקבועים אישר שהוא מגיע השבוע. רק מי שסומן נספר בכיסוי ובסידור.</p>
              <ul className="space-y-1">
                {staff.map((member) => (
                  <li key={member.id}>
                    <label className="flex items-start gap-2 cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={plan.confirmedStaff.includes(member.id)}
                        onChange={() => plan.toggleConfirmed(member.id)}
                        className="h-5 w-5 accent-blue-600 shrink-0"
                      />
                      <span className="text-sm text-slate-700">
                        {member.displayName}
                        <span className="block text-xs text-slate-400">{staffDaysSummary(member)}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          <CoverageGrid
            days={coverage}
            dates={dates}
            employees={employees}
            unconfirmedStaff={unconfirmedStaff}
            extraShifts={plan.extraShifts}
            onAddExtra={plan.addExtra}
            onRemoveExtra={plan.removeExtra}
          />
        </>
      )}
    </Layout>
  )
}
