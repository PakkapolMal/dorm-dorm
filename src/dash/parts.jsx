import { useEffect, useRef, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Search, CirclePlus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, SearchX } from 'lucide-react'
import { Badge, ItemThumb } from '../ui.jsx'
import { Popover } from './Shell.jsx'
import { monthLabel, monthShort, getProduct } from '../data.js'

// Pieces shared by the landlord and operator dashboards (DESIGN §5).

export function Trend({ now, prev, vs = 'last month' }) {
  const d = prev ? ((now - prev) / prev) * 100 : 0
  const Icon = d > 0 ? TrendingUp : d < 0 ? TrendingDown : Minus
  return (
    <span className="trend num">
      <Icon size={14} aria-hidden="true" />{d > 0 ? '+' : ''}{d ? `${d.toFixed(1)}%` : '0%'}<span className="sr-only"> vs {vs}</span>
    </span>
  )
}

export function StatusBadge({ map, status }) {
  const [tone, label] = map[status]
  return <Badge tone={tone}>{label}</Badge>
}

// Item thumbnails + names for a list of product ids.
export function AddonCell({ room }) {
  if (!room.productIds.length) return <span className="muted">—</span>
  return (
    <span className="addon-cell">
      {room.productIds.map((id) => <ItemThumb key={id} product={getProduct(id)} />)}
      <span>{room.productIds.map((id) => getProduct(id).name).join(' + ')}</span>
    </span>
  )
}

export function SearchBox({ value, onChange, label }) {
  return (
    <div className="search-d">
      <Search size={16} aria-hidden="true" />
      <input className="input-d" type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={`${label}…`} aria-label={label} />
    </div>
  )
}

// Dashed "⊕ Status" button with a checkbox list. selected = [] means no filter.
export function Facet({ title, options, selected, onChange }) {
  const toggle = (v) => onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v])
  return (
    <Popover className="btn-d btn-sm btn-dashed" button={<>
      <CirclePlus size={16} aria-hidden="true" />{title}
      {selected.length > 0 && <><span className="vsep" aria-hidden="true" /><span className="facet-count">{selected.length} selected</span></>}
    </>}>
      {() => (
        <div className="menu" role="group" aria-label={`Filter by ${title.toLowerCase()}`}>
          {options.map((o) => (
            <label key={o.value} className="menu-item check-item">
              <input type="checkbox" checked={selected.includes(o.value)} onChange={() => toggle(o.value)} />
              <span className="grow">{o.label}</span>
              <span className="num muted">{o.count}</span>
            </label>
          ))}
          {selected.length > 0 && <>
            <div className="menu-sep" />
            <button type="button" className="menu-item center" onClick={() => onChange([])}>Clear filters</button>
          </>}
        </div>
      )}
    </Popover>
  )
}


export function Pager({ count, noun, page, pages, setPage, per, setPer }) {
  return (
    <div className="table-foot">
      <span className="muted">{count} {noun}{count === 1 ? '' : 's'}</span>
      <div className="pager">
        <label className="pager-per">Rows per page
          <select className="input-d select-d" value={per} onChange={(e) => { setPer(Number(e.target.value)); setPage(0) }}>
            {[10, 20, 50].map((n) => <option key={n}>{n}</option>)}
          </select>
        </label>
        <span className="num">Page {page + 1} of {pages}</span>
        <div className="pager-btns">
          <button type="button" className="btn-d btn-outline btn-icon btn-sm" aria-label="First page" disabled={page === 0} onClick={() => setPage(0)}><ChevronsLeft size={16} /></button>
          <button type="button" className="btn-d btn-outline btn-icon btn-sm" aria-label="Previous page" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft size={16} /></button>
          <button type="button" className="btn-d btn-outline btn-icon btn-sm" aria-label="Next page" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}><ChevronRight size={16} /></button>
          <button type="button" className="btn-d btn-outline btn-icon btn-sm" aria-label="Last page" disabled={page >= pages - 1} onClick={() => setPage(pages - 1)}><ChevronsRight size={16} /></button>
        </div>
      </div>
    </div>
  )
}

export function EmptyRow({ cols, onClear }) {
  return (
    <tr><td colSpan={cols} className="empty-cell">
      <div className="center-state">
        <div className="circle circle-muted"><SearchX size={24} aria-hidden="true" /></div>
        <strong>No results</strong>
        <p>Nothing matches the search or filters.</p>
        <button type="button" className="btn-d btn-outline" style={{ marginTop: 12 }} onClick={onClear}>Clear filters</button>
      </div>
    </td></tr>
  )
}

export function Kpi({ label, value, now, prev, vs, insight, caption }) {
  return (
    <section className="card-d kpi">
      <div className="kpi-body">
        <div className="kpi-top"><h2 className="kpi-label">{label}</h2><Trend now={now} prev={prev} vs={vs} /></div>
        <div className="kpi-value">{value}</div>
      </div>
      <div className="kpi-foot"><strong>{insight}</strong><span>{caption}</span></div>
    </section>
  )
}

// Single-series area chart: 2px line, 10% wash, end label, crosshair + tooltip on hover and arrow keys.
const H = 240, PAD = { l: 64, r: 72, t: 16, b: 32 }
function niceMax(v) {
  const step = [5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000].find((s) => v / s <= 4) ?? 10000
  return { max: step * 4, step }
}
// data: [{ month, value }]. name labels the series (aria + table header); fmt formats values.
export function AreaChart({ data, name, fmt }) {
  const [hover, setHover] = useState(null)
  // viewBox width follows the rendered width, so axis text stays 12px at any card size.
  const box = useRef(null)
  const [W, setW] = useState(640)
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)))
    ro.observe(box.current)
    return () => ro.disconnect()
  }, [])
  const { max, step } = niceMax(Math.max(...data.map((d) => d.value)))
  const dx = (W - PAD.l - PAD.r) / (data.length - 1)
  const x = (i) => PAD.l + i * dx
  const y = (v) => PAD.t + (1 - v / max) * (H - PAD.t - PAD.b)
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d.value)}`).join(' ')
  const area = `${line} L${x(data.length - 1)},${y(0)} L${x(0)},${y(0)} Z`
  const last = data.length - 1
  const pick = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const vx = ((e.clientX - r.left) / r.width) * W
    setHover(Math.max(0, Math.min(last, Math.round((vx - PAD.l) / dx))))
  }
  const onKey = (e) => {
    if (e.key === 'ArrowRight') setHover((h) => Math.min(last, (h ?? -1) + 1))
    else if (e.key === 'ArrowLeft') setHover((h) => Math.max(0, (h ?? last + 1) - 1))
    else return
    e.preventDefault()
  }
  const h = hover != null ? data[hover] : null
  return (
    <div className="chart" ref={box}>
      <svg viewBox={`0 0 ${W} ${H}`} tabIndex={0} role="img" onKeyDown={onKey} onBlur={() => setHover(null)}
        aria-label={`${name} by month: ${data.map((d) => `${monthShort(d.month)} ${fmt(d.value)}`).join(', ')}. Use arrow keys to read each month.`}
        onPointerMove={pick} onPointerLeave={() => setHover(null)}>
        {[0, 1, 2, 3, 4].map((k) => (
          <g key={k}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(k * step)} y2={y(k * step)} className="grid" />
            <text x={PAD.l - 10} y={y(k * step)} dy="0.32em" textAnchor="end">{(k * step).toLocaleString('en-US')}</text>
          </g>
        ))}
        {data.map((d, i) => <text key={i} x={x(i)} y={H - 8} textAnchor="middle">{monthShort(d.month)}</text>)}
        <path d={area} className="area" />
        <path d={line} className="line" />
        {h && <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={y(0)} className="cross" />}
        <circle cx={x(hover ?? last)} cy={y(data[hover ?? last].value)} r={5} className="dot" />
        {hover !== last && <text x={x(last) + 10} y={y(data[last].value)} dy="0.32em" className="end-label">{data[last].value.toLocaleString('en-US')}</text>}
      </svg>
      <div className="chart-tip" aria-live="polite" style={{ left: `${(x(hover ?? 0) / W) * 100}%`, visibility: h ? 'visible' : 'hidden' }}>
        {h && <><span className="muted">{monthLabel(h.month)}</span><strong className="num">{fmt(h.value)}</strong></>}
      </div>
      <details className="chart-table">
        <summary>Show as table</summary>
        <table className="table-d">
          <thead><tr><th>Month</th><th className="num-col">{name}</th></tr></thead>
          <tbody>{data.map((d) => <tr key={d.month.getTime()}><td>{monthLabel(d.month)}</td><td className="num-col num">{fmt(d.value)}</td></tr>)}</tbody>
        </table>
      </details>
    </div>
  )
}

