import { useRef, useState } from 'react'
import { Download, Upload, Share2, Copy, ClipboardPaste, Trash2 } from 'lucide-react'
import { Card, SectionTitle, Sheet, Field, inputClass, primaryBtn } from '../components/ui'
import { defaultData, isValidBackup, withDefaults } from '../store'
import { todayKey } from '../utils'
import { shareBackup, saveBackup, copyBackup } from '../backup'

export default function Settings({ data, setData, update, notify }) {
  const fileRef = useRef(null)
  const [showPaste, setShowPaste] = useState(false)
  const [pasteText, setPasteText] = useState('')

  const backupJson = () => JSON.stringify({ ...data, exportedAt: new Date().toISOString() })
  const fileName = `daily-tracker-backup-${todayKey()}.json`

  async function download() {
    try {
      notify(await saveBackup(backupJson(), fileName))
    } catch {
      alert('Could not save the file. Try "Share backup" instead.')
    }
  }

  async function share() {
    try {
      await shareBackup(backupJson(), fileName)
    } catch { /* user closed the share sheet */ }
  }

  async function copyText() {
    await copyBackup(backupJson())
    notify('Backup copied – paste it on the other phone')
  }

  function restore(text) {
    try {
      const obj = JSON.parse(text)
      if (!isValidBackup(obj)) throw new Error()
      if (!confirm('Replace all data on this device with this backup?')) return false
      delete obj.exportedAt
      setData(withDefaults(obj))
      notify('Data restored')
      return true
    } catch {
      alert('This is not a valid Daily Tracker backup.')
      return false
    }
  }

  async function onFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) restore(await file.text())
  }

  function resetAll() {
    if (!confirm('Delete ALL data on this device? This cannot be undone.')) return
    setData(structuredClone(defaultData))
    notify('All data cleared')
  }

  const row =
    'flex w-full items-center gap-3 rounded-xl px-1 py-3 text-left text-sm font-medium active:bg-slate-50'
  const icon = 'grid h-9 w-9 place-items-center rounded-lg'

  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle>General</SectionTitle>
        <Field label="Currency symbol">
          <input
            className={inputClass}
            value={data.settings.currency}
            maxLength={4}
            onChange={(e) => update((d) => { d.settings.currency = e.target.value })}
          />
        </Field>
      </Card>

      <Card>
        <SectionTitle>Backup & move to new phone</SectionTitle>
        <p className="mb-2 text-xs leading-relaxed text-slate-500">
          Your data is saved only on this device. To move it to another phone, create a backup here and
          restore it there. Take a backup regularly so nothing is lost.
        </p>
        <div className="divide-y divide-slate-100">
          <button className={row} onClick={share}>
            <span className={`${icon} bg-sky-50 text-sky-600`}><Share2 size={18} /></span>
            <span>
              Share backup
              <span className="block text-xs font-normal text-slate-500">Send to WhatsApp, Drive, email…</span>
            </span>
          </button>
          <button className={row} onClick={download}>
            <span className={`${icon} bg-emerald-50 text-emerald-600`}><Download size={18} /></span>
            Save backup file
          </button>
          <button className={row} onClick={() => fileRef.current.click()}>
            <span className={`${icon} bg-violet-50 text-violet-600`}><Upload size={18} /></span>
            Restore from backup file
          </button>
          <button className={row} onClick={copyText}>
            <span className={`${icon} bg-slate-100 text-slate-600`}><Copy size={18} /></span>
            Copy backup as text
          </button>
          <button className={row} onClick={() => setShowPaste(true)}>
            <span className={`${icon} bg-slate-100 text-slate-600`}><ClipboardPaste size={18} /></span>
            Restore from pasted text
          </button>
        </div>
        <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={onFile} />
      </Card>

      <Card>
        <button className={`${row} text-rose-600`} onClick={resetAll}>
          <span className={`${icon} bg-rose-50`}><Trash2 size={18} /></span>
          Clear all data
        </button>
      </Card>

      <p className="pb-2 text-center text-xs text-slate-400">
        Tip: Share a backup to WhatsApp or Drive once a month so nothing is lost.
      </p>

      {showPaste && (
        <Sheet open onClose={() => setShowPaste(false)} title="Paste backup text">
          <div className="space-y-4">
            <textarea
              className={`${inputClass} h-40 font-mono text-xs`}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder='{"settings":...}'
            />
            <button
              className={primaryBtn}
              disabled={!pasteText.trim()}
              onClick={() => { if (restore(pasteText)) { setShowPaste(false); setPasteText('') } }}
            >
              Restore
            </button>
          </div>
        </Sheet>
      )}
    </div>
  )
}
