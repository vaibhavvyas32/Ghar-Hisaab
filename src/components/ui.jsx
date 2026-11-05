import { Check, X, ChevronLeft, ChevronRight, Minus, Plus, CircleCheck } from 'lucide-react'
import { monthLabel, todayKey } from '../utils'

export function Card({ className = '', children }) {
  return (
    <div className={`rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 ${className}`}>
      {children}
    </div>
  )
}

export function SectionTitle({ children, action }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-sm font-semibold text-slate-800">{children}</h2>
      {action}
    </div>
  )
}

// Bottom sheet (slides up from the bottom, good for one-hand phone use)
export function Sheet({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 animate-fade-in bg-slate-900/40" onClick={onClose} />
      <div className="relative max-h-[90dvh] w-full max-w-md animate-sheet-up overflow-y-auto rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:rounded-3xl">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" />
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500 active:bg-slate-200"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function MonthSwitcher({ month, onChange }) {
  const btn =
    'grid h-9 w-9 place-items-center rounded-full text-slate-600 active:bg-slate-100 hover:bg-slate-100'
  return (
    <div className="flex items-center justify-between">
      <button className={btn} onClick={() => onChange(-1)} aria-label="Previous month">
        <ChevronLeft size={20} />
      </button>
      <span className="text-sm font-semibold">{monthLabel(month.y, month.m)}</span>
      <button className={btn} onClick={() => onChange(1)} aria-label="Next month">
        <ChevronRight size={20} />
      </button>
    </div>
  )
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

// Attendance-style month grid. Each day shows ✓ / ✗ / empty.
// getEntry(key) -> { s: 'y' | 'n', label?: string } | undefined
export function MonthCalendar({ month, days, getEntry, onDayClick, accentRing }) {
  const firstWeekday = new Date(month.y, month.m, 1).getDay()
  const today = todayKey()

  return (
    <div>
      <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-medium text-slate-400">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: firstWeekday }).map((_, i) => (
          <div key={'blank' + i} />
        ))}
        {days.map((key, i) => {
          const e = getEntry(key)
          const isToday = key === today
          let style = 'bg-slate-50 text-slate-700'
          if (e?.s === 'y') style = 'bg-emerald-500 text-white'
          if (e?.s === 'n') style = 'bg-rose-100 text-rose-600'
          return (
            <button
              key={key}
              onClick={() => onDayClick(key)}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-medium transition active:scale-95 ${style} ${
                isToday ? `ring-2 ring-offset-1 ${accentRing}` : ''
              }`}
            >
              <span className={e ? 'text-[10px] leading-none opacity-80' : ''}>{i + 1}</span>
              {e?.s === 'y' && <Check size={16} strokeWidth={3} />}
              {e?.s === 'n' && <X size={16} strokeWidth={3} />}
              {e?.label && (
                <span className="absolute -top-1 -right-1 min-w-4 rounded-full bg-slate-900 px-1 text-[9px] leading-4 text-white">
                  {e.label}
                </span>
              )}
            </button>
          )
        })}
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-emerald-500" /> Yes</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-rose-100 ring-1 ring-rose-200" /> No</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-slate-100 ring-1 ring-slate-200" /> Not marked</span>
      </div>
    </div>
  )
}

// Big ✓ / ✗ toggle buttons
export function StatusButtons({ value, onChange, yesText, noText }) {
  const base =
    'flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition active:scale-[0.98]'
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onChange(value === 'y' ? null : 'y')}
        className={`${base} ${
          value === 'y' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-emerald-50 text-emerald-700'
        }`}
      >
        <Check size={18} strokeWidth={3} /> {yesText}
      </button>
      <button
        onClick={() => onChange(value === 'n' ? null : 'n')}
        className={`${base} ${
          value === 'n' ? 'bg-rose-500 text-white shadow-sm' : 'bg-rose-50 text-rose-700'
        }`}
      >
        <X size={18} strokeWidth={3} /> {noText}
      </button>
    </div>
  )
}

export function Stepper({ value, onChange, step = 1, min = 0 }) {
  const btn =
    'grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-700 active:bg-slate-200 disabled:opacity-40'
  const round = (n) => Math.round(n * 100) / 100
  return (
    <div className="flex items-center gap-3">
      <button className={btn} disabled={value <= min} onClick={() => onChange(round(Math.max(min, value - step)))}>
        <Minus size={16} />
      </button>
      <span className="w-8 text-center text-base font-semibold tabular-nums">{value}</span>
      <button className={btn} onClick={() => onChange(round(value + step))}>
        <Plus size={16} />
      </button>
    </div>
  )
}

export function PaidToggle({ paid, onToggle }) {
  return paid ? (
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-white"
    >
      <CircleCheck size={14} /> Paid
    </button>
  ) : (
    <button
      onClick={onToggle}
      className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white active:bg-white/25"
    >
      Mark as paid
    </button>
  )
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  )
}

export const inputClass =
  'w-full rounded-xl border-0 bg-slate-100 px-3.5 py-2.5 text-base outline-none ring-1 ring-transparent focus:bg-white focus:ring-slate-300'

export const primaryBtn =
  'w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-40'
