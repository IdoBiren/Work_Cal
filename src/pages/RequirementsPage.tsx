import { useEffect, useState } from 'react'
import Layout from '../components/ui/Layout'
import WeekPicker from '../components/WeekPicker'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useRequirements } from '../data/useRequirements'
import { WEEKDAY_NAMES } from '../lib/dates'
import { SLOT_COUNT, slotLabel } from '../lib/slots'
import { weekIdOf } from '../lib/dates'
import type { WeekdayRequirements } from '../lib/coverage'

function RequirementsEditor({
  value,
  onChange,
}: {
  value: WeekdayRequirements
  onChange: (next: WeekdayRequirements) => void
}) {
  const setSlot = (weekday: number, slotIndex: number, n: number) => {
    const row = [...value[weekday]]
    row[slotIndex] = Math.max(0, n)
    onChange({ ...value, [weekday]: row })
  }

  const setWholeDay = (weekday: number) => {
    const n = Number(window.prompt('כמה עובדים נדרשים בכל שעות היום?', '1') ?? '')
    if (!Number.isFinite(n)) return
    onChange({ ...value, [weekday]: Array(SLOT_COUNT).fill(Math.max(0, n)) })
  }

  const copyToAll = (weekday: number) => {
    const row = [...value[weekday]]
    const next: WeekdayRequirements = {}
    for (let i = 0; i < 7; i++) next[i] = [...row]
    onChange(next)
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: 7 }, (_, weekday) => (
        <div key={weekday} className="border-b border-slate-100 pb-3 last:border-0">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-slate-700 text-sm">יום {WEEKDAY_NAMES[weekday]}</span>
            <div className="flex gap-1">
              <button className="text-xs text-blue-600 underline" onClick={() => setWholeDay(weekday)}>
                החל על כל היום
              </button>
              <span className="text-slate-300">|</span>
              <button className="text-xs text-blue-600 underline" onClick={() => copyToAll(weekday)}>
                העתק לכל הימים
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-9 gap-1">
            {Array.from({ length: SLOT_COUNT }, (_, slotIndex) => (
              <label key={slotIndex} className="text-center">
                <div className="text-[10px] text-slate-400">{slotLabel(slotIndex).split('–')[0]}</div>
                <input
                  type="number"
                  min={0}
                  value={value[weekday]?.[slotIndex] ?? 0}
                  onChange={(e) => setSlot(weekday, slotIndex, Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-md text-center py-1 text-sm"
                />
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function RequirementsPage() {
  const [weekId, setWeekId] = useState(weekIdOf(new Date()))
  const { template, override, saveTemplate, saveOverride, loading } = useRequirements(weekId)
  const [hasOverride, setHasOverride] = useState(false)
  const [overrideDraft, setOverrideDraft] = useState<WeekdayRequirements>(template)

  useEffect(() => {
    setHasOverride(!!override)
    setOverrideDraft(override ?? template)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekId, loading])

  return (
    <Layout>
      <div className="space-y-6">
        <Card>
          <h2 className="font-bold text-slate-800 mb-1">תבנית קבועה</h2>
          <p className="text-xs text-slate-500 mb-3">כמה עובדים נדרשים בכל שעה, כברירת מחדל לכל שבוע.</p>
          <RequirementsEditor value={template} onChange={saveTemplate} />
        </Card>

        <Card>
          <h2 className="font-bold text-slate-800 mb-3">דריסה לשבוע ספציפי</h2>
          <WeekPicker weekId={weekId} onChange={setWeekId} />
          <label className="flex items-center gap-2 mb-3 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-blue-600"
              checked={hasOverride}
              onChange={(e) => {
                setHasOverride(e.target.checked)
                if (!e.target.checked) saveOverride(null)
              }}
            />
            לשבוע הזה יש דרישות שונות מהתבנית הקבועה
          </label>
          {hasOverride && (
            <>
              <RequirementsEditor value={overrideDraft} onChange={setOverrideDraft} />
              <Button className="mt-3" onClick={() => saveOverride(overrideDraft)}>
                שמירת הדריסה לשבוע זה
              </Button>
            </>
          )}
        </Card>
      </div>
    </Layout>
  )
}
