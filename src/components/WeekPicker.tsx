import { formatDayLabel, shiftWeekId, weekDates, weekIdOf } from '../lib/dates'
import Button from './ui/Button'

export default function WeekPicker({
  weekId,
  onChange,
}: {
  weekId: string
  onChange: (weekId: string) => void
}) {
  const dates = weekDates(weekId)
  const isCurrentWeek = weekId === weekIdOf(new Date())

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
      <Button variant="secondary" onClick={() => onChange(shiftWeekId(weekId, -1))}>
        ← שבוע קודם
      </Button>
      <div className="text-center">
        <div className="font-semibold text-slate-800">
          {formatDayLabel(dates[0])} – {formatDayLabel(dates[6])}
        </div>
        {!isCurrentWeek && (
          <button
            className="text-xs text-blue-600 underline"
            onClick={() => onChange(weekIdOf(new Date()))}
          >
            חזרה להשבוע
          </button>
        )}
      </div>
      <Button variant="secondary" onClick={() => onChange(shiftWeekId(weekId, 1))}>
        שבוע הבא →
      </Button>
    </div>
  )
}
