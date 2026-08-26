import { useState } from 'react'
import { formatDayLabel, WEEKDAY_NAMES } from '../lib/dates'
import { slotLabel } from '../lib/slots'
import { formatEmployeeForDay } from '../lib/schedule'
import type { DayCoverage, EmployeeAvailability } from '../lib/coverage'

export default function CoverageGrid({
  days,
  dates,
  employees,
}: {
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
              <div className="border-t border-slate-100 px-4 py-3 bg-slate-50 text-sm">
                <p className="font-medium text-slate-700 mb-1">מי פנוי ביום זה:</p>
                {(() => {
                  const dayEmployees = employees.filter((emp) => emp.days[day.weekday]?.available)
                  return dayEmployees.length > 0 ? (
                    <ul className="list-disc pr-5 space-y-0.5">
                      {dayEmployees.map((emp) => (
                        <li key={emp.uid}>
                          {formatEmployeeForDay(
                            emp.displayName,
                            emp.days[day.weekday].start,
                            emp.days[day.weekday].end,
                            day.weekday,
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-400">אף אחד לא סימן זמינות</p>
                  )
                })()}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
