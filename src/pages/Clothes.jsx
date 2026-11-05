import { useState } from 'react'
import { Plus, Pencil, Trash2, Shirt } from 'lucide-react'
import {
  Card, SectionTitle, Sheet, MonthSwitcher, MonthCalendar, StatusButtons,
  Stepper, PaidToggle, Field, inputClass, primaryBtn,
} from '../components/ui'
import {
  currentMonth, shiftMonth, monthDays, monthKey, todayKey, prettyDate, money, monthLabel,
  clothesEntryTotal,
} from '../utils'
import { newId } from '../store'

// Tailwind needs full class names, so each colour theme is spelled out here.
const THEMES = {
  violet: {
    hero: 'from-violet-600 to-violet-700 shadow-violet-700/20',
    heroSub: 'text-violet-100',
    ring: 'ring-violet-500',
  },
  amber: {
    hero: 'from-amber-500 to-orange-600 shadow-orange-600/20',
    heroSub: 'text-amber-50',
    ring: 'ring-amber-500',
  },
}

// service: 'dryclean' | 'press'
export default function Clothes({ service, title, theme, data, update, notify }) {
  const t = THEMES[theme]
  const cur = data.settings.currency
  const store = data[service]
  const [month, setMonth] = useState(currentMonth())
  const [openDay, setOpenDay] = useState(null)
  const [editCat, setEditCat] = useState(null) // null | {} (new) | category

  const days = monthDays(month.y, month.m)
  const mKey = monthKey(month.y, month.m)
  const today = todayKey()
  const todayTotals = clothesEntryTotal(store.entries[today])

  // Month summary + per-category breakdown
  let visits = 0, items = 0, total = 0
  const breakdown = {}
  days.forEach((k) => {
    const e = store.entries[k]
    if (e?.s !== 'y') return
    visits++
    Object.values(e.items || {}).forEach((it) => {
      items += it.count
      total += it.count * it.price
      const b = (breakdown[it.name] ||= { count: 0, cost: 0 })
      b.count += it.count
      b.cost += it.count * it.price
    })
  })

  function saveDay(key, s, itemsObj) {
    update((d) => {
      if (!s) delete d[service].entries[key]
      else d[service].entries[key] = { s, items: s === 'y' ? itemsObj : {} }
    })
    setOpenDay(null)
  }

  function saveCategory(cat) {
    update((d) => {
      const list = d[service].categories
      const i = list.findIndex((c) => c.id === cat.id)
      if (i >= 0) list[i] = cat
      else list.push({ ...cat, id: newId() })
    })
    setEditCat(null)
    notify('Category saved')
  }

  function deleteCategory(cat) {
    if (!confirm(`Delete "${cat.name}"? Past entries keep their old price.`)) return
    update((d) => {
      d[service].categories = d[service].categories.filter((c) => c.id !== cat.id)
    })
    setEditCat(null)
  }

  return (
    <div className="space-y-4">
      {/* Month summary */}
      <div className={`rounded-2xl bg-gradient-to-br p-5 text-white shadow-lg ${t.hero}`}>
        <div className="flex items-start justify-between">
          <div>
            <p className={`text-xs font-medium ${t.heroSub}`}>{title} · {monthLabel(month.y, month.m)}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">{money(total, cur)}</p>
          </div>
          <PaidToggle paid={!!store.paid[mKey]} onToggle={() => update((d) => { d[service].paid[mKey] = !d[service].paid[mKey] })} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl bg-white/10 py-2">
            <p className="text-lg font-semibold">{visits}</p>
            <p className={`text-[11px] ${t.heroSub}`}>Days given</p>
          </div>
          <div className="rounded-xl bg-white/10 py-2">
            <p className="text-lg font-semibold">{items}</p>
            <p className={`text-[11px] ${t.heroSub}`}>Clothes</p>
          </div>
        </div>
      </div>

      {/* Today */}
      <Card>
        <SectionTitle>Today · {prettyDate(today)}</SectionTitle>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            {store.entries[today]?.s === 'y'
              ? `${todayTotals.count} clothes · ${money(todayTotals.cost, cur)}`
              : store.entries[today]?.s === 'n'
                ? 'Marked as not given today.'
                : 'Nothing marked yet.'}
          </p>
          <button
            onClick={() => setOpenDay(today)}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white active:scale-95"
          >
            <Plus size={16} /> {store.entries[today] ? 'Edit' : 'Add'}
          </button>
        </div>
      </Card>

      {/* Calendar */}
      <Card>
        <div className="mb-3">
          <MonthSwitcher month={month} onChange={(step) => setMonth(shiftMonth(month, step))} />
        </div>
        <MonthCalendar
          month={month}
          days={days}
          accentRing={t.ring}
          getEntry={(k) => {
            const e = store.entries[k]
            if (!e) return undefined
            const { count } = clothesEntryTotal(e)
            return { s: e.s, label: count ? String(count) : '' }
          }}
          onDayClick={setOpenDay}
        />
      </Card>

      {/* Breakdown */}
      {Object.keys(breakdown).length > 0 && (
        <Card>
          <SectionTitle>This month by type</SectionTitle>
          <ul className="divide-y divide-slate-100">
            {Object.entries(breakdown).map(([name, b]) => (
              <li key={name} className="flex items-center justify-between py-2.5 text-sm">
                <span>{name} <span className="text-slate-400">× {b.count}</span></span>
                <span className="font-semibold">{money(b.cost, cur)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Categories */}
      <Card>
        <SectionTitle
          action={
            <button
              onClick={() => setEditCat({})}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-slate-700 active:bg-slate-100"
            >
              <Plus size={16} /> Add
            </button>
          }
        >
          Clothes types & prices
        </SectionTitle>
        {store.categories.length === 0 && (
          <p className="py-4 text-center text-sm text-slate-400">No types yet. Add one to start.</p>
        )}
        <ul className="divide-y divide-slate-100">
          {store.categories.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setEditCat(c)}
                className="flex w-full items-center justify-between py-3 text-left text-sm active:bg-slate-50"
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-500">
                    <Shirt size={16} />
                  </span>
                  {c.name}
                </span>
                <span className="flex items-center gap-3">
                  <span className="font-semibold">{money(c.price, cur)}</span>
                  <Pencil size={14} className="text-slate-400" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Card>

      {openDay && (
        <ClothesDaySheet
          key={openDay}
          dayKey={openDay}
          entry={store.entries[openDay]}
          categories={store.categories}
          cur={cur}
          onClose={() => setOpenDay(null)}
          onSave={(s, itemsObj) => saveDay(openDay, s, itemsObj)}
        />
      )}

      {editCat && (
        <CategorySheet
          cat={editCat}
          cur={cur}
          onClose={() => setEditCat(null)}
          onSave={saveCategory}
          onDelete={deleteCategory}
        />
      )}
    </div>
  )
}

function ClothesDaySheet({ dayKey, entry, categories, cur, onClose, onSave }) {
  const [s, setS] = useState(entry?.s || 'y')
  // counts: { [catId]: number }
  const [counts, setCounts] = useState(() => {
    const c = {}
    Object.entries(entry?.items || {}).forEach(([id, it]) => { c[id] = it.count })
    return c
  })

  // Show current types + any old type from this entry that was deleted since
  const rows = categories.map((c) => ({ id: c.id, name: c.name, price: entry?.items?.[c.id]?.price ?? c.price }))
  Object.entries(entry?.items || {}).forEach(([id, it]) => {
    if (!categories.some((c) => c.id === id)) rows.push({ id, name: it.name, price: it.price })
  })

  const total = rows.reduce((sum, r) => sum + (counts[r.id] || 0) * r.price, 0)
  const totalCount = rows.reduce((sum, r) => sum + (counts[r.id] || 0), 0)

  function save() {
    const items = {}
    rows.forEach((r) => {
      if (counts[r.id] > 0) items[r.id] = { name: r.name, price: r.price, count: counts[r.id] }
    })
    onSave(s, items)
  }

  return (
    <Sheet open onClose={onClose} title={prettyDate(dayKey)}>
      <div className="space-y-5">
        <StatusButtons value={s} onChange={setS} yesText="Given" noText="Not given" />

        {s === 'y' && (
          <div className="rounded-2xl bg-slate-50 px-4 py-2">
            {rows.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-400">Add clothes types first.</p>
            )}
            {rows.map((r) => (
              <div key={r.id} className="flex items-center justify-between border-b border-slate-200/70 py-3 last:border-0">
                <div>
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-slate-500">{money(r.price, cur)} each</p>
                </div>
                <Stepper
                  value={counts[r.id] || 0}
                  onChange={(v) => setCounts({ ...counts, [r.id]: v })}
                />
              </div>
            ))}
          </div>
        )}

        {s === 'y' && (
          <div className="flex items-center justify-between px-1">
            <span className="text-sm text-slate-500">{totalCount} clothes</span>
            <span className="text-xl font-bold">{money(total, cur)}</span>
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
          <button className={primaryBtn} disabled={!s || (s === 'y' && totalCount === 0)} onClick={save}>
            Save
          </button>
        </div>
      </div>
    </Sheet>
  )
}

function CategorySheet({ cat, cur, onClose, onSave, onDelete }) {
  const isNew = !cat.id
  const [name, setName] = useState(cat.name || '')
  const [price, setPrice] = useState(cat.price ?? '')

  return (
    <Sheet open onClose={onClose} title={isNew ? 'New clothes type' : 'Edit clothes type'}>
      <div className="space-y-4">
        <Field label="Name (e.g. Jeans, Blazer, Bedsheet)">
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </Field>
        <Field label={`Price per piece (${cur})`}>
          <input
            type="number"
            inputMode="decimal"
            className={inputClass}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </Field>
        <div className="flex gap-2">
          {!isNew && (
            <button
              onClick={() => onDelete(cat)}
              className="grid w-14 place-items-center rounded-xl bg-rose-50 text-rose-600 active:bg-rose-100"
              aria-label="Delete"
            >
              <Trash2 size={18} />
            </button>
          )}
          <button
            className={primaryBtn}
            disabled={!name.trim() || !(Number(price) >= 0) || price === ''}
            onClick={() => onSave({ ...cat, name: name.trim(), price: Number(price) })}
          >
            Save
          </button>
        </div>
      </div>
    </Sheet>
  )
}
