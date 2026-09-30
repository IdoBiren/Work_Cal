import { useState, type FormEvent } from 'react'
import { formatDayLabel, WEEKDAY_NAMES } from '../lib/dates'
import { DEFAULT_START, defaultEndForDay, slotLabel } from '../lib/slots'
import { formatEmployeeForDay } from '../lib/schedule'
import Button from './ui/Button'
import type { DayCoverage, EmployeeAvailability } from '../lib/coverage'
import type { ExtraShift } from '../data/useWeekPlan'

interface DayActions {
  /** Account-less staff not yet confirmed this week — shown greyed, not counted. */
  unconfirmedStaff: EmployeeAvailability[]
  extraShifts: ExtraShift[]
  onAddExtra: (extra: Omit<ExtraShift, 'id'>) => void
  onRemoveExtra: (extra: ExtraShift) => void
}

function DayDetails({
  weekday,
  employees,
  unconfirmedStaff,
  extraShifts,
  onAddExtra,
  onRemoveExtra,
}: DayActions & { weekday: number; employees: EmployeeAvailability[] }) {
  const dayEnd = defaultEndForDay(weekday)
  const [name, setName] = useState('')
  const [start, setStart] = useState(DEFAULT_START)
  const [end, setEnd] = useState(dayEnd)

  const dayEmployees = employees.filter((emp) => emp.days[weekday]?.available)
  const dayUnconfirmed = unconfirmedStaff.filter((emp) => emp.days[weekday]?.available)
  const label = (emp: EmployeeAvailability) =>
    formatEmployeeForDay(emp.displayName, emp.days[weekday].start, emp.days[weekday].end, weekday)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || start >= end) return
    onAddExtra({ displayName: trimmed, weekday, start, end })
    setName('')
  }

  return (
    <div className="border-t border-slate-100 px-4 py-3 bg-slate-50 text-sm">
      <p className="font-medium text-slate-700 mb-1">מי פנוי ביום זה:</p>
      {dayEmployees.length > 0 || dayUnconfirmed.length > 0 ? (
        <ul className="list-disc pr-5 space-y-0.5">
          {dayEmployees.map((emp) => {
            const extra = extraShifts.find((x) => `extra:${x.id}` === emp.uid)
            return (
              <li key={emp.uid}>
                {label(emp)}
                {extra && (
                  <>
                    <span className="text-xs text-slate-400"> (תוספת לשבוע זה)</span>
                    <button
                      type="button"
                      onClick={() => onRemoveExtra(extra)}
                      className="ms-2 text-xs text-red-600 hover:underline"
                      aria-label={`הסר את ${extra.displayName}`}
                    >
                      ✕
                    </button>
                  </>
                )}
              </li>
            )
          })}
          {dayUnconfirmed.map((emp) => (
            <li key={emp.uid} className="text-slate-400">
              {label(emp)} (לא אישר/ה)
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-400">אף אחד לא סימן זמינות</p>
      )}

      <form onSubmit={submit} className="mt-3 flex flex-wrap items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="שם"
          className="border border-slate-300 rounded-lg px-2 py-1 bg-white min-w-0 flex-1"
        />
        <input
          type="time"
          value={start}
          min="07:00"
          max={dayEnd}
          onChange={(e) => setStart(e.target.value)}
          className="border border-slate-300 rounded-lg px-2 py-1 bg-white"
        />
        <span className="text-slate-400">עד</span>
        <input
          type="time"
          value={end}
          min="07:00"
          max={dayEnd}
          onChange={(e) => setEnd(e.target.value)}
          className="border border-slate-300 rounded-lg px-2 py-1 bg-white"
        />
        <Button type="submit" variant="secondary" disabled={!name.trim() || start >= end}>
          הוסף עובד ליום זה
        </Button>
      </form>
    </div>
  )
}

export default function CoverageGrid({
  days,
  dates,
  employees,
  unconfirmedStaff,
  extraShifts,
  onAddExtra,
  onRemoveExtra,
}: DayActions & {
  days: DayCoverage[]
  dates: Date[]
  employees: EmployeeAvailability[]
}) {
  const [openDay, setOpenDay] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      {days.map((day) => {
        const totalShortage = day.slots.reduce((sum, s) => sum + s.shortage, 0)
        const isOpen = openDay === day.weekday

        return (
          <div key={day.weekday} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-4 py-3"
              onClick={() => setOpenDay(isOpen ? null : day.weekday)}
            >
              <span className="font-semibold text-slate-800">
                יום {WEEKDAY_NAMES[day.weekday]}{' '}
                <span className="text-xs text-slate-400 font-normal">{formatDayLabel(dates[day.weekday])}</span>
              </span>
              {totalShortage > 0 ? (
                <span className="text-xs font-medium bg-red-100 text-red-700 rounded-full px-2 py-1">
                  חוסר של {totalShortage}
                </span>
              ) : (
                <span className="text-xs font-medium bg-green-100 text-green-700 rounded-full px-2 py-1">מכוסה</span>
              )}
            </button>

            <div className="px-4 pb-3 grid grid-cols-3 sm:grid-cols-9 gap-1">
              {day.slots.map((slot, i) => (
                <div
                  key={i}
                  title={slotLabel(i)}
                  className={`text-center rounded-md py-1 text-xs font-medium ${
                    slot.shortage > 0
                      ? 'bg-red-100 text-red-700'
                      : slot.required === 0
                        ? 'bg-slate-50 text-slate-300'
                        : 'bg-green-50 text-green-700'
                  }`}
                >
                  <div className="text-[10px] opacity-70">{slotLabel(i).split('–')[0]}</div>
                  <div>
                    {slot.have}/{slot.required}
                  </div>
                </div>
              ))}
            </div>

            {isOpen && (
              <DayDetails
                weekday={day.weekday}
                employees={employees}
                unconfirmedStaff={unconfirmedStaff}
                extraShifts={extraShifts}
                onAddExtra={onAddExtra}
                onRemoveExtra={onRemoveExtra}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
