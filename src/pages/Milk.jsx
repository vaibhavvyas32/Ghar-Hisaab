import { useState } from 'react'
import { Settings2 } from 'lucide-react'
import {
  Card, SectionTitle, Sheet, MonthSwitcher, MonthCalendar, StatusButtons,
  Stepper, PaidToggle, Field, inputClass, primaryBtn,
} from '../components/ui'
import {
  currentMonth, shiftMonth, monthDays, monthKey, todayKey, prettyDate, money, monthLabel,
} from '../utils'

export default function Milk({ data, update, notify }) {
  const cur = data.settings.currency
  const milk = data.milk
  const [month, setMonth] = useState(currentMonth())
  const [openDay, setOpenDay] = useState(null)
  const [showRate, setShowRate] = useState(false)

  const days = monthDays(month.y, month.m)
  const mKey = monthKey(month.y, month.m)
  const today = todayKey()
  const todayEntry = milk.entries[today]

  // Month summary
  let delivered = 0, missed = 0, litres = 0, total = 0
  days.forEach((k) => {
    const e = milk.entries[k]
    if (e?.s === 'y') { delivered++; litres += e.qty; total += e.qty * e.rate }
    if (e?.s === 'n') missed++
  })

  function setDay(key, s, qty, rate) {
    update((d) => {
      if (!s) delete d.milk.entries[key]
      else d.milk.entries[key] = { s, qty: s === 'y' ? qty : 0, rate }
    })
  }

  function quickMark(s) {
    setDay(today, s, todayEntry?.qty || milk.qty, todayEntry?.rate || milk.rate)
  }

  return (
    <div className="space-y-4">
      {/* Month summary */}
      <div className="rounded-2xl bg-gradient-to-br from-sky-600 to-sky-700 p-5 text-white shadow-lg shadow-sky-700/20">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-sky-100">Bill for {monthLabel(month.y, month.m)}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">{money(total, cur)}</p>
          </div>
          <PaidToggle paid={!!milk.paid[mKey]} onToggle={() => update((d) => { d.milk.paid[mKey] = !d.milk.paid[mKey] })} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Stat label="Delivered" value={delivered} />
          <Stat label="Missed" value={missed} />
          <Stat label="Litres" value={Math.round(litres * 100) / 100} />
        </div>
      </div>

      {/* Today quick entry */}
      <Card>
        <SectionTitle>Today · {prettyDate(today)}</SectionTitle>
        <StatusButtons value={todayEntry?.s} onChange={quickMark} yesText="Delivered" noText="Not delivered" />
        <p className="mt-3 text-xs text-slate-500">
          {todayEntry?.s === 'y'
            ? `${todayEntry.qty} L × ${money(todayEntry.rate, cur)} = ${money(todayEntry.qty * todayEntry.rate, cur)}`
            : todayEntry?.s === 'n'
              ? 'Marked as not delivered today.'
              : 'Tap ✓ or ✗ to mark today.'}
        </p>
      </Card>

      {/* Rate / per-day cost */}
      <Card className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Cost per day</p>
          <p className="text-lg font-semibold">
            {money(milk.qty * milk.rate, cur)}
            <span className="ml-2 text-xs font-normal text-slate-500">
              {milk.qty} L × {money(milk.rate, cur)}/L
            </span>
          </p>
        </div>
        <button
          onClick={() => setShowRate(true)}
          className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 active:bg-slate-200"
        >
          <Settings2 size={16} /> Edit
        </button>
      </Card>

      {/* Calendar */}
      <Card>
        <div className="mb-3">
          <MonthSwitcher month={month} onChange={(step) => setMonth(shiftMonth(month, step))} />
        </div>
        <MonthCalendar
          month={month}
          days={days}
          accentRing="ring-sky-500"
          getEntry={(k) => {
            const e = milk.entries[k]
            if (!e) return undefined
            return { s: e.s, label: e.s === 'y' && e.qty !== milk.qty ? String(e.qty) : '' }
          }}
          onDayClick={setOpenDay}
        />
      </Card>

      {openDay && (
        <MilkDaySheet
          key={openDay}
          dayKey={openDay}
          entry={milk.entries[openDay]}
          milk={milk}
          cur={cur}
          onClose={() => setOpenDay(null)}
          onSave={(s, qty, rate) => { setDay(openDay, s, qty, rate); setOpenDay(null) }}
        />
      )}

      {showRate && (
        <RateSheet
          milk={milk}
          cur={cur}
          monthText={monthLabel(month.y, month.m)}
          onClose={() => setShowRate(false)}
          onSave={(rate, qty, applyToMonth) => {
            update((d) => {
              d.milk.rate = rate
              d.milk.qty = qty
              if (applyToMonth) {
                days.forEach((k) => { if (d.milk.entries[k]) d.milk.entries[k].rate = rate })
              }
            })
            setShowRate(false)
            notify('Milk rate updated')
          }}
        />
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-white/10 py-2">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-[11px] text-sky-100">{label}</p>
    </div>
  )
}

function MilkDaySheet({ dayKey, entry, milk, cur, onClose, onSave }) {
  const [s, setS] = useState(entry?.s || 'y')
  const [qty, setQty] = useState(entry?.qty || milk.qty)
  const [rate, setRate] = useState(entry?.rate || milk.rate)

  return (
    <Sheet open onClose={onClose} title={prettyDate(dayKey)}>
      <div className="space-y-5">
        <StatusButtons value={s} onChange={setS} yesText="Delivered" noText="Not delivered" />

        {s === 'y' && (
          <div className="space-y-4 rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Quantity (litres)</span>
              <Stepper value={qty} onChange={setQty} step={0.5} min={0.5} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium">Rate per litre</span>
              <input
                type="number"
                inputMode="decimal"
                className={`${inputClass} w-28 text-right`}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
              />
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <span className="text-sm text-slate-500">Cost for this day</span>
              <span className="text-lg font-bold">{money(qty * rate, cur)}</span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {entry && (
            <button
              onClick={() => onSave(null)}
              className="rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-600 active:bg-slate-200"
            >
              Clear
            </button>
          )}
          <button className={primaryBtn} disabled={!s} onClick={() => onSave(s, qty, rate)}>
            Save
          </button>
        </div>
      </div>
    </Sheet>
  )
}

function RateSheet({ milk, cur, monthText, onClose, onSave }) {
  const [rate, setRate] = useState(milk.rate)
  const [qty, setQty] = useState(milk.qty)
  const [apply, setApply] = useState(false)

  return (
    <Sheet open onClose={onClose} title="Milk settings">
      <div className="space-y-4">
        <Field label={`Price per litre (${cur})`}>
          <input
            type="number"
            inputMode="decimal"
            className={inputClass}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />
        </Field>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Default litres per day</span>
          <Stepper value={qty} onChange={setQty} step={0.5} min={0.5} />
        </div>
        <div className="flex items-center justify-between rounded-xl bg-sky-50 px-4 py-3">
          <span className="text-sm text-sky-900">Cost per day</span>
          <span className="font-bold text-sky-900">{money(rate * qty, cur)}</span>
        </div>
        <label className="flex items-center gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            className="h-5 w-5 accent-slate-900"
            checked={apply}
            onChange={(e) => setApply(e.target.checked)}
          />
          Also apply new price to all entries in {monthText}
        </label>
        <button className={primaryBtn} disabled={!(rate > 0)} onClick={() => onSave(rate, qty, apply)}>
          Save
        </button>
      </div>
    </Sheet>
  )
}
