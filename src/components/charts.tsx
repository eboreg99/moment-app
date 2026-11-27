import { useState } from 'react'
import { formatShort, parseIsoDate } from '../lib/dates'
import { datesInRange, weekdayIndex, WEEKDAYS } from '../lib/stats'
import { moodEmoji, MOODS, type Entry } from '../lib/types'

/** Diverging: 😩/☹️ rot, 😊/🤩 blau, leer = neutrales Grau */
export const MOOD_COLORS: Record<number, string> = { 1: 'var(--mood-1)', 2: 'var(--mood-2)', 3: 'var(--mood-3)', 4: 'var(--mood-4)' }

function Tooltip({ tip }: { tip: { x: number; y: number; text: string } | null }) {
  if (!tip) return null
  return <div className="tooltip" style={{ left: tip.x, top: tip.y }}>{tip.text}</div>
}

type Tip = { x: number; y: number; text: string } | null

function useTip() {
  const [tip, setTip] = useState<Tip>(null)
  const show = (ev: React.MouseEvent | React.PointerEvent, text: string) => {
    const host = (ev.currentTarget as Element).closest('.chart') as HTMLElement
    const r = host.getBoundingClientRect()
    setTip({ x: ev.clientX - r.left, y: ev.clientY - r.top, text })
  }
  return { tip, show, hide: () => setTip(null) }
}

const entryText = (d: string, e?: Entry) =>
  e ? `${formatShort(d)}: ${moodEmoji(e.mood)} ${MOODS.find((m) => m.value === e.mood)?.label ?? ''}` : `${formatShort(d)}: nicht erfasst`

export function MoodLegend() {
  return (
    <div className="legend">
      {[...MOODS].reverse().map((m) => (
        <span key={m.value}><i style={{ background: MOOD_COLORS[m.value] }} />{m.emoji} {m.label}</span>
      ))}
      <span><i style={{ background: 'var(--empty)' }} />nicht erfasst</span>
    </div>
  )
}

/** Verlauf: Stimmung pro Tag als Linie (Lücken bei fehlenden Tagen) */
export function TrendChart({ entries, from, to }: { entries: Entry[]; from: string; to: string }) {
  const { tip, show, hide } = useTip()
  const map = new Map(entries.map((e) => [e.entry_date, e]))
  const days = datesInRange(from, to)
  const weekly = days.length > 62

  // Punkte: pro Tag (Monat) bzw. Wochendurchschnitt (Jahr); null = Lücke
  const points: { key: string; value: number | null; text: string }[] = weekly
    ? Array.from({ length: Math.ceil(days.length / 7) }, (_, w) => {
        const chunk = days.slice(w * 7, w * 7 + 7)
        const moods = chunk.map((d) => map.get(d)?.mood).filter((m): m is NonNullable<typeof m> => m !== undefined)
        const avg = moods.length ? moods.reduce((a, b) => a + b, 0) / moods.length : null
        return {
          key: chunk[0],
          value: avg,
          text: `Woche ab ${formatShort(chunk[0])}: ${avg === null ? 'keine Einträge' : `Ø ${avg.toFixed(2)} (${moods.length} Tage)`}`,
        }
      })
    : days.map((d) => ({ key: d, value: map.get(d)?.mood ?? null, text: entryText(d, map.get(d)) }))

  const W = 360, H = 170, L = 24, R = 6, T = 10, B = 20
  const x = (i: number) => L + (points.length === 1 ? 0 : (i * (W - L - R)) / (points.length - 1))
  const y = (m: number) => T + ((4 - m) * (H - T - B)) / 3

  const segments: string[] = []
  let cur: string[] = []
  points.forEach((p, i) => {
    if (p.value !== null) cur.push(`${x(i)},${y(p.value)}`)
    else { if (cur.length) segments.push(cur.join(' ')); cur = [] }
  })
  if (cur.length) segments.push(cur.join(' '))

  const ticks = weekly
    ? points.map((p, i) => ({ p, i })).filter(({ p, i }) => i === 0 || p.key.slice(5, 7) !== points[i - 1].key.slice(5, 7))
    : points.map((p, i) => ({ p, i })).filter(({ i }) => i % 7 === 0)
  const half = (W - L - R) / Math.max(1, points.length - 1) / 2

  return (
    <div className="chart" onPointerLeave={hide}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={weekly ? 'Stimmungsverlauf, Wochendurchschnitt' : 'Stimmungsverlauf'}>
        {[1, 2, 3, 4].map((m) => (
          <g key={m}>
            <line x1={L} x2={W - R} y1={y(m)} y2={y(m)} className="grid" />
            <text x={L - 6} y={y(m) + 5} textAnchor="end" className="axis-emoji">{moodEmoji(m)}</text>
          </g>
        ))}
        {ticks.map(({ p, i }) => (
          <text key={p.key} x={x(i)} y={H - 4} textAnchor="middle" className="axis">
            {weekly ? parseIsoDate(p.key).toLocaleDateString('de-CH', { month: 'narrow' }) : Number(p.key.slice(8))}
          </text>
        ))}
        {segments.map((pts, i) => <polyline key={i} points={pts} className="trend-line" />)}
        {points.map((p, i) => (
          <g key={p.key}>
            {p.value !== null && <circle cx={x(i)} cy={y(p.value)} r={3.5} className="trend-dot" />}
            <rect x={x(i) - half} y={T} width={half * 2} height={H - T - B} fill="transparent"
              onPointerMove={(ev) => show(ev, p.text)} />
          </g>
        ))}
      </svg>
      <Tooltip tip={tip} />
    </div>
  )
}

/** Durchschnitt pro Wochentag als Balken (Skala 1–4) */
export function WeekdayChart({ data }: { data: { day: string; avg: number | null; count: number }[] }) {
  const { tip, show, hide } = useTip()
  const W = 360, H = 170, L = 24, B = 20, T = 18
  const slot = (W - L) / 7
  const y = (v: number) => T + ((4 - v) * (H - T - B)) / 3
  return (
    <div className="chart" onPointerLeave={hide}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Durchschnittliche Stimmung pro Wochentag">
        {[1, 2, 3, 4].map((m) => (
          <g key={m}>
            <line x1={L} x2={W} y1={y(m)} y2={y(m)} className="grid" />
            <text x={L - 6} y={y(m) + 5} textAnchor="end" className="axis-emoji">{moodEmoji(m)}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = L + slot * i + slot / 2
          const bw = Math.min(32, slot - 10)
          return (
            <g key={d.day} onPointerMove={(ev) => show(ev, d.avg ? `${d.day}: Ø ${d.avg.toFixed(2)} (${d.count} Tage)` : `${d.day}: keine Einträge`)}>
              <rect x={L + slot * i} y={T} width={slot} height={H - T - B} fill="transparent" />
              {d.avg !== null && (
                <>
                  <path className="bar" d={roundedTop(cx - bw / 2, y(d.avg), bw, y(1) - y(d.avg), 4)} />
                  <text x={cx} y={y(d.avg) - 5} textAnchor="middle" className="value">{d.avg.toFixed(1)}</text>
                </>
              )}
              <text x={cx} y={H - 4} textAnchor="middle" className="axis">{d.day}</text>
            </g>
          )
        })}
      </svg>
      <Tooltip tip={tip} />
    </div>
  )
}

function roundedTop(x: number, y: number, w: number, h: number, r: number) {
  if (h <= 0) return ''
  const rr = Math.min(r, h, w / 2)
  return `M${x},${y + h} V${y + rr} Q${x},${y} ${x + rr},${y} H${x + w - rr} Q${x + w},${y} ${x + w},${y + rr} V${y + h} Z`
}

/** Heatmap: Monat als Kalender, Jahr als Wochen-Raster (Spalten = Wochen, Zeilen = Mo–So) */
export function Heatmap({ entries, from, to, mode }: { entries: Entry[]; from: string; to: string; mode: 'month' | 'year' }) {
  const { tip, show, hide } = useTip()
  const map = new Map(entries.map((e) => [e.entry_date, e]))
  const days = datesInRange(from, to)
  const offset = weekdayIndex(from)
  const color = (d: string) => (map.get(d) ? MOOD_COLORS[map.get(d)!.mood] : 'var(--empty)')

  if (mode === 'month') {
    return (
      <div className="chart" onPointerLeave={hide}>
        <div className="cal">
          {WEEKDAYS.map((w) => <span key={w} className="cal-head">{w}</span>)}
          {Array.from({ length: offset }, (_, i) => <span key={`pad${i}`} />)}
          {days.map((d) => (
            <span key={d} className="cal-cell" style={{ background: color(d) }}
              onPointerMove={(ev) => show(ev, entryText(d, map.get(d)))}>
              {Number(d.slice(8))}
            </span>
          ))}
        </div>
        <Tooltip tip={tip} />
      </div>
    )
  }

  const cell = 11, gap = 2, L = 22, T = 14
  const weeks = Math.ceil((offset + days.length) / 7)
  const W = L + weeks * (cell + gap), H = T + 7 * (cell + gap)
  return (
    <div className="chart" onPointerLeave={hide}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Jahres-Heatmap">
        {['Mo', 'Mi', 'Fr'].map((w) => {
          const r = WEEKDAYS.indexOf(w)
          return <text key={w} x={0} y={T + r * (cell + gap) + cell - 2} className="axis small-axis">{w}</text>
        })}
        {days.map((d, i) => {
          const k = i + offset
          const col = Math.floor(k / 7), row = k % 7
          return (
            <g key={d}>
              {d.endsWith('-01') && (
                <text x={L + col * (cell + gap)} y={T - 4} className="axis small-axis">
                  {parseIsoDate(d).toLocaleDateString('de-CH', { month: 'short' })}
                </text>
              )}
              <rect x={L + col * (cell + gap)} y={T + row * (cell + gap)} width={cell} height={cell} rx={2}
                style={{ fill: color(d) }} onPointerMove={(ev) => show(ev, entryText(d, map.get(d)))} />
            </g>
          )
        })}
      </svg>
      <Tooltip tip={tip} />
    </div>
  )
}
