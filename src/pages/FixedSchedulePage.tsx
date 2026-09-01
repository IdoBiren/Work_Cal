import Layout from '../components/ui/Layout'
import DayAvailabilityRow from '../components/DayAvailabilityRow'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import { useFixedSchedule } from '../data/useFixedSchedule'
import { WORKDAYS } from '../lib/dates'

export default function FixedSchedulePage() {
  const { days, setDay, loading } = useFixedSchedule()

  return (
    <Layout>
      <p className="text-sm text-slate-500 mb-3">
        אלה הזמנים הקבועים שלך — הם יחולו אוטומטית על כל שבוע, בלי צורך למלא כל שבוע מחדש.
      </p>
      <Card>
        {loading ? (
          <Spinner />
        ) : (
          <div>
            {WORKDAYS.map((weekday) => (
              <DayAvailabilityRow
                key={weekday}
                weekday={weekday}
                value={days[weekday]}
                onChange={(value) => setDay(weekday, value)}
              />
            ))}
          </div>
        )}
      </Card>
    </Layout>
  )
}
