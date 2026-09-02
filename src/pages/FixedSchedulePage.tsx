import Layout from '../components/ui/Layout'
import DayAvailabilityRow from '../components/DayAvailabilityRow'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'
import ErrorNote from '../components/ui/ErrorNote'
import { useFixedSchedule } from '../data/useFixedSchedule'
import { WORKDAYS } from '../lib/dates'

export default function FixedSchedulePage() {
  const { days, setDay, loading, error, importable, importPrevious } = useFixedSchedule()

  return (
    <Layout>
      <p className="text-sm text-slate-500 mb-3">
        אלה הזמנים הקבועים שלך — הם יחולו אוטומטית על כל שבוע, בלי צורך למלא כל שבוע מחדש.
      </p>

      {importable && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="text-sm text-slate-700 mb-2">
            הוגדרת כעובד קבוע, ולכן המסך הזה החליף את "הזמינות שלי". מצאנו זמינות שמילאת בעבר — רוצה להעביר אותה
            לכאן כזמנים הקבועים שלך?
          </p>
          <Button onClick={importPrevious}>העבר את הזמינות הקודמת שלי</Button>
        </div>
      )}

      <ErrorNote message={error} />

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
