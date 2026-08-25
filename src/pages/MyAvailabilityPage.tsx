import { useEffect, useState } from 'react'
import Layout from '../components/ui/Layout'
import WeekPicker from '../components/WeekPicker'
import DayAvailabilityRow from '../components/DayAvailabilityRow'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'
import { useAvailability } from '../data/useAvailability'
import { weekDates, weekIdOf, WORKDAYS } from '../lib/dates'

export default function MyAvailabilityPage() {
  const [weekId, setWeekId] = useState(weekIdOf(new Date()))
  const { days, setDay, loading, saving, hasAnyAvailability, copyFromPreviousWeek } = useAvailability(weekId)
  const dates = weekDates(weekId)
  const [copyStatus, setCopyStatus] = useState<'copied' | 'empty' | null>(null)
  const [copying, setCopying] = useState(false)

  useEffect(() => setCopyStatus(null), [weekId])

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
              />
            ))}
          </div>
        )}
      </Card>
      {saving && <p className="text-xs text-slate-400 mt-2 text-center">שומר...</p>}
    </Layout>
  )
}
