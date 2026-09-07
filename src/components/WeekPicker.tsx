import { formatDayLabel, shiftWeekId, weekDates, weekIdOf, weekOffsetFromToday } from '../lib/dates'
import Button from './ui/Button'

function relativeWeekLabel(offset: number): string {
  if (offset === 0) return 'השבוע הנוכחי'
  if (offset === 1) return 'השבוע הבא'
  if (offset === -1) return 'שבוע שעבר'
  if (offset > 1) return `בעוד ${offset} שבועות`
  return `לפני ${Math.abs(offset)} שבועות`
}

export default function WeekPicker({
  weekId,
  onChange,
}: {
  weekId: string
  onChange: (weekId: string) => void
}) {
  const dates = weekDates(weekId)
  const offset = weekOffsetFromToday(weekId)
  const isCurrentWeek = offset === 0

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
      <Button variant="secondary" onClick={() => onChange(shiftWeekId(weekId, -1))}>
        ← שבוע קודם
      </Button>
      <div className="text-center">
        <div
          className={`inline-block px-2 py-0.5 rounded-full text-sm font-bold mb-0.5 ${
            isCurrentWeek ? 'text-blue-700 bg-blue-50' : 'text-amber-800 bg-amber-100'
          }`}
        >
          {relativeWeekLabel(offset)}
        </div>
        <div className="text-slate-800">
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
