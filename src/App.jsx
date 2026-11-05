import { useEffect, useState } from 'react'
import { Milk as MilkIcon, WashingMachine, Shirt, Settings as SettingsIcon } from 'lucide-react'
import { loadData, saveData } from './store'
import Milk from './pages/Milk'
import Clothes from './pages/Clothes'
import Settings from './pages/Settings'

const TABS = [
  { id: 'milk', label: 'Milk', icon: MilkIcon, active: 'text-sky-600' },
  { id: 'dryclean', label: 'Dry Clean', icon: WashingMachine, active: 'text-violet-600' },
  { id: 'press', label: 'Press', icon: Shirt, active: 'text-orange-600' },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, active: 'text-slate-900' },
]

export default function App() {
  const [data, setData] = useState(loadData)
  const [tab, setTab] = useState(() => localStorage.getItem('daily-tracker-tab') || 'milk')
  const [toast, setToast] = useState(null)

  // Save on every change
  useEffect(() => saveData(data), [data])
  useEffect(() => localStorage.setItem('daily-tracker-tab', tab), [tab])

  // update(d => { d.milk.rate = 70 })  – edit a copy, then save it
  function update(change) {
    setData((prev) => {
      const next = structuredClone(prev)
      change(next)
      return next
    })
  }

  function notify(text) {
    setToast({ text, id: Date.now() })
  }

  const props = { data, update, notify }
  const current = TABS.find((t) => t.id === tab)

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-slate-100/85 px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3 backdrop-blur">
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Daily Tracker</p>
        <h1 className="text-xl font-bold">{current.label}</h1>
      </header>

      <main className="px-4 pt-4 pb-28">
        {tab === 'milk' && <Milk {...props} />}
        {tab === 'dryclean' && (
          <Clothes key="dryclean" service="dryclean" title="Dry Clean" theme="violet" {...props} />
        )}
        {tab === 'press' && (
          <Clothes key="press" service="press" title="Press / Ironing" theme="amber" {...props} />
        )}
        {tab === 'settings' && <Settings {...props} setData={setData} />}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="grid grid-cols-4">
          {TABS.map(({ id, label, icon: Icon, active }) => (
            <button
              key={id}
              onClick={() => { setTab(id); window.scrollTo(0, 0) }}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition ${
                tab === id ? active : 'text-slate-400'
              }`}
            >
              <Icon size={22} strokeWidth={tab === id ? 2.4 : 1.8} />
              {label}
            </button>
          ))}
        </div>
      </nav>

      {toast && (
        <div
          key={toast.id}
          onAnimationEnd={() => setToast(null)}
          className="fixed inset-x-0 bottom-24 z-50 mx-auto w-fit animate-toast rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg"
        >
          {toast.text}
        </div>
      )}
    </div>
  )
}
