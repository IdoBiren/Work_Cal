import { formatDayLabel, WEEKDAY_NAMES } from '../lib/dates'
import { DEFAULT_START, defaultEndForDay } from '../lib/slots'
import type { DayAvailability } from '../lib/coverage'

export default function DayAvailabilityRow({
  weekday,
  date,
  value,
  onChange,
}: {
  weekday: number
  date: Date
  value: DayAvailability
  onChange: (value: DayAvailability) => void
}) {
  const dayEnd = defaultEndForDay(weekday)

  const toggle = () => {
    if (value.available) {
      onChange({ ...value, available: false })
    } else {
      onChange({ available: true, start: value.start || DEFAULT_START, end: value.end || dayEnd })
    }
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
      <label className="flex items-center gap-2 w-28 shrink-0 cursor-pointer">
        <input type="checkbox" checked={value.available} onChange={toggle} className="h-5 w-5 accent-blue-600" />
        <span className="text-sm font-medium text-slate-700">
          יום {WEEKDAY_NAMES[weekday]}
          <span className="block text-xs text-slate-400 font-normal">{formatDayLabel(date)}</span>
        </span>
      </label>

      {value.available && (
        <div className="flex items-center gap-2 text-sm">
          <input
            type="time"
            value={value.start}
            min="07:00"
            max={dayEnd}
            onChange={(e) => onChange({ ...value, start: e.target.value })}
            className="border border-slate-300 rounded-lg px-2 py-1"
          />
          <span className="text-slate-400">עד</span>
          <input
            type="time"
            value={value.end}
            min="07:00"
            max={dayEnd}
            onChange={(e) => onChange({ ...value, end: e.target.value })}
            className="border border-slate-300 rounded-lg px-2 py-1"
          />
        </div>
      )}
    </div>
  )
}
