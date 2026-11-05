// Backup helpers. Inside the Android app we use native plugins,
// in a normal browser we use the browser's own download / share / clipboard.
import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import { Clipboard } from '@capacitor/clipboard'

const isApp = Capacitor.isNativePlatform()

function browserDownload(json, fileName) {
  const blob = new Blob([json], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = fileName
  a.click()
  URL.revokeObjectURL(a.href)
}

// Open the share sheet (WhatsApp, Drive, Gmail…) with the backup file
export async function shareBackup(json, fileName) {
  if (isApp) {
    const { uri } = await Filesystem.writeFile({
      path: fileName,
      data: json,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    })
    await Share.share({ title: 'Daily Tracker backup', files: [uri] })
    return
  }
  const file = new File([json], fileName, { type: 'application/json' })
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: 'Daily Tracker backup' })
  } else {
    browserDownload(json, fileName)
  }
}

// Save the backup file on the phone. Returns a short text saying where.
export async function saveBackup(json, fileName) {
  if (isApp) {
    await Filesystem.writeFile({
      path: fileName,
      data: json,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    })
    return `Saved to Documents/${fileName}`
  }
  browserDownload(json, fileName)
  return 'Backup downloaded'
}

export async function copyBackup(json) {
  if (isApp) await Clipboard.write({ string: json })
  else await navigator.clipboard.writeText(json)
}
