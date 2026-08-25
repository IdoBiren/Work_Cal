import { useState } from 'react'
import Layout from '../components/ui/Layout'
import WeekPicker from '../components/WeekPicker'
import DayAvailabilityRow from '../components/DayAvailabilityRow'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import { useAvailability } from '../data/useAvailability'
import { weekDates, weekIdOf, WORKDAYS } from '../lib/dates'

export default function MyAvailabilityPage() {
  const [weekId, setWeekId] = useState(weekIdOf(new Date()))
  const { days, setDay, loading, saving } = useAvailability(weekId)
  const dates = weekDates(weekId)

  return (
    <Layout>
      <WeekPicker weekId={weekId} onChange={setWeekId} />
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
