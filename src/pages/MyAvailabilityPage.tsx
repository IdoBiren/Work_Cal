import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/ui/Layout'
import WeekPicker from '../components/WeekPicker'
import DayAvailabilityRow from '../components/DayAvailabilityRow'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'
import ErrorNote from '../components/ui/ErrorNote'
import { useAvailability } from '../data/useAvailability'
import { useWeekRoster } from '../data/useWeekRoster'
import { useAuth } from '../auth/AuthProvider'
import { weekDates, weekIdOf, WORKDAYS } from '../lib/dates'
import { firstName, formatEmployeeForDay } from '../lib/schedule'

export default function MyAvailabilityPage() {
  const [weekId, setWeekId] = useState(weekIdOf(new Date()))
  const { days, setDay, loading, saving, error, hasAnyAvailability, copyFromPreviousWeek } = useAvailability(weekId)
  const { user } = useAuth()
  const { employees, error: rosterError } = useWeekRoster(weekId)
  const dates = weekDates(weekId)
  const [copyStatus, setCopyStatus] = useState<'copied' | 'empty' | null>(null)
  const [copying, setCopying] = useState(false)

  useEffect(() => setCopyStatus(null), [weekId])

  // Who else is working each day, so employees can plan around their coworkers.
  const coworkersByDay = useMemo(() => {
    const byDay: Record<number, string[]> = {}
    for (const weekday of WORKDAYS) {
      byDay[weekday] = employees
        .filter((emp) => emp.uid !== user?.uid && emp.days[weekday]?.available)
        .map((emp) =>
          formatEmployeeForDay(firstName(emp.displayName), emp.days[weekday].start, emp.days[weekday].end, weekday),
        )
    }
    return byDay
  }, [employees, user])

  const handleCopy = async () => {
    if (hasAnyAvailability && !window.confirm('הפעולה תדרוס את הזמינות הקיימת בשבוע זה. להמשיך?')) return
    setCopying(true)
    setCopyStatus(null)
    try {
      const copied = await copyFromPreviousWeek()
      setCopyStatus(copied ? 'copied' : 'empty')
    } finally {
      setCopying(false)
    }
  }

  return (
    <Layout>
      <WeekPicker weekId={weekId} onChange={setWeekId} />
      <div className="mb-3">
        <Button variant="secondary" onClick={handleCopy} disabled={loading || saving || copying}>
          העתק מהשבוע הקודם
        </Button>
        {copyStatus === 'copied' && <p className="text-xs text-green-600 mt-1">הועתק מהשבוע הקודם</p>}
        {copyStatus === 'empty' && <p className="text-xs text-slate-400 mt-1">לא נמצאה זמינות בשבוע הקודם</p>}
      </div>
      <ErrorNote message={error ?? rosterError} />
      <Card>
        {loading ? (
          <Spinner />
        ) : (
          <div>
            {WORKDAYS.map((weekday) => (
              <DayAvailabilityRow
                key={weekday}
                weekday={weekday}
                date={dates[weekday]}
                value={days[weekday]}
                onChange={(value) => setDay(weekday, value)}
                coworkers={coworkersByDay[weekday]}
              />
            ))}
          </div>
        )}
      </Card>
      {saving && <p className="text-xs text-slate-400 mt-2 text-center">שומר...</p>}
    </Layout>
  )
}
