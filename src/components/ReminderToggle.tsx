import { useEffect, useState } from 'react'
import { currentSubscription, disablePush, enablePush, pushSupported } from '../lib/push'

export function ReminderToggle() {
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supported = pushSupported()

  useEffect(() => {
    if (!supported) return
    currentSubscription().then((s) => setEnabled(Boolean(s))).catch(() => setEnabled(false))
  }, [supported])

  if (!supported) {
    return <p className="muted small">Erinnerungen werden in diesem Browser nicht unterstützt.</p>
  }

  const toggle = async () => {
    setBusy(true)
    setError(null)
    try {
      if (enabled) { await disablePush(); setEnabled(false) }
      else { await enablePush(); setEnabled(true) }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="reminder">
      <div>
        <strong>Erinnerungen</strong>
        <p className="muted small">Um 19:00 Uhr, und ab 7:00 Uhr, falls der Vortag fehlt.</p>
        {error && <p className="error small">{error}</p>}
      </div>
      <button className={enabled ? '' : 'primary'} onClick={toggle} disabled={busy || enabled === null}>
        {enabled ? 'Ausschalten' : 'Einschalten'}
      </button>
    </div>
  )
}
