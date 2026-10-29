import { useEffect, useRef, useState } from 'react'
import {
  TrendingUp, TrendingDown, DoorOpen, Plus, Search, CirclePlus, EllipsisVertical, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Eye, ClipboardCheck, ReceiptText, Info, CircleCheck, Send, TriangleAlert, PackageOpen, SearchX,
} from 'lucide-react'
import {
  BRAND, SKUS, getProduct, thb, fmtDate, depositFor, monthsBetween, TODAY, DAMAGE_FEES, NORMAL_WEAR, REVENUE_SHARE, ROOM_STATUS,
  INVOICE_STATUS, ACTIVITY, PARTNER_DORMS, dormStats, lastMonthStats, shareHistory, roomMonthly, isBilled, totalLossFee, invoiceMonths, invoicesFor, dormName, initials,
} from '../data.js'
import { useStore, go } from '../store.jsx'
import { Badge, Banner, Sheet, ItemThumb, Stepper } from '../ui.jsx'
import { PageHeader, Popover } from './Shell.jsx'

const monthLabel = (d) => d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
const monthShort = (d) => d.toLocaleDateString('en-GB', { month: 'short' })
const sum = (xs) => xs.reduce((s, x) => s + x, 0)

// ---------- small shared pieces ----------
function Trend({ now, prev }) {
  const d = prev ? ((now - prev) / prev) * 100 : 0
  const Icon = d >= 0 ? TrendingUp : TrendingDown
  return (
    <span className="trend num">
      <Icon size={14} aria-hidden="true" />{d >= 0 ? '+' : ''}{d.toFixed(1)}%<span className="sr-only"> vs last month</span>
    </span>
  )
}

function StatusBadge({ map, status }) {
  const [tone, label] = map[status]
  return <Badge tone={tone}>{label}</Badge>
}

function SearchBox({ value, onChange, label }) {
  return (
    <div className="search-d">
      <Search size={16} aria-hidden="true" />
      <input className="input-d" type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={`${label}…`} aria-label={label} />
    </div>
  )
}

// Dashed "⊕ Status" button with a checkbox list. selected = [] means no filter.
function Facet({ title, options, selected, onChange }) {
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

function usePaged(items) {
  const [page, setPage] = useState(0)
  const [per, setPer] = useState(10)
  const pages = Math.max(1, Math.ceil(items.length / per))
  const p = Math.min(page, pages - 1)
  return { shown: items.slice(p * per, (p + 1) * per), reset: () => setPage(0), pager: { count: items.length, page: p, pages, setPage, per, setPer } }
}

function Pager({ count, noun, page, pages, setPage, per, setPer }) {
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

function EmptyRow({ cols, onClear }) {
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

// ---------- L1 Dashboard ----------
function Kpi({ label, value, now, prev, insight, caption }) {
  return (
    <section className="card-d kpi">
      <div className="kpi-body">
        <div className="kpi-top"><h2 className="kpi-label">{label}</h2><Trend now={now} prev={prev} /></div>
        <div className="kpi-value">{value}</div>
      </div>
      <div className="kpi-foot"><strong>{insight}</strong><span>{caption}</span></div>
    </section>
  )
}

// Single-series area chart: 2px line, 10% wash, end label, crosshair + tooltip on hover and arrow keys.
const H = 240, PAD = { l: 64, r: 72, t: 16, b: 32 }
function niceMax(v) {
  const step = [50, 100, 200, 250, 500, 1000, 2000, 2500, 5000].find((s) => v / s <= 4) ?? 10000
  return { max: step * 4, step }
}
function ShareChart({ data }) {
  const [hover, setHover] = useState(null)
  // viewBox width follows the rendered width, so axis text stays 12px at any card size.
  const box = useRef(null)
  const [W, setW] = useState(640)
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)))
    ro.observe(box.current)
    return () => ro.disconnect()
  }, [])
  const { max, step } = niceMax(Math.max(...data.map((d) => d.share)))
  const dx = (W - PAD.l - PAD.r) / (data.length - 1)
  const x = (i) => PAD.l + i * dx
  const y = (v) => PAD.t + (1 - v / max) * (H - PAD.t - PAD.b)
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d.share)}`).join(' ')
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
        aria-label={`Your revenue share by month: ${data.map((d) => `${monthShort(d.month)} ${thb(d.share)}`).join(', ')}. Use arrow keys to read each month.`}
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
        <circle cx={x(hover ?? last)} cy={y(data[hover ?? last].share)} r={5} className="dot" />
        {hover !== last && <text x={x(last) + 10} y={y(data[last].share)} dy="0.32em" className="end-label">{data[last].share.toLocaleString('en-US')}</text>}
      </svg>
      <div className="chart-tip" aria-live="polite" style={{ left: `${(x(hover ?? 0) / W) * 100}%`, visibility: h ? 'visible' : 'hidden' }}>
        {h && <><span className="muted">{monthLabel(h.month)}</span><strong className="num">{thb(h.share)}</strong></>}
      </div>
      <details className="chart-table">
        <summary>Show as table</summary>
        <table className="table-d">
          <thead><tr><th>Month</th><th className="num-col">Your share</th></tr></thead>
          <tbody>{data.map((d) => <tr key={d.month.getTime()}><td>{monthLabel(d.month)}</td><td className="num-col num">{thb(d.share)}</td></tr>)}</tbody>
        </table>
      </details>
    </div>
  )
}

export function Dashboard() {
  const { rooms, dorm } = useStore()
  const s = dormStats(rooms, dorm)
  const last = lastMonthStats(dorm)
  const history = shareHistory(dorm, s.share)
  const activity = ACTIVITY.filter((a) => a.dorm === dorm)
  return (
    <>
      <PageHeader title="Hi, welcome back" desc={`${dormName(dorm)} · ${monthLabel(TODAY)}`}
        action={<a className="btn-d btn-primary" href="#/landlord/rooms"><DoorOpen size={16} aria-hidden="true" />View rooms</a>} />

      <div className="kpi-grid">
        <Kpi label="Upgraded rooms" value={s.upgraded} now={s.upgraded} prev={last.upgraded}
          insight={`${Math.round((s.upgraded / s.total) * 100)}% of rooms subscribe`} caption={`${s.total} rooms in this property`} />
        <Kpi label="Add-on revenue" value={thb(s.revenue)} now={s.revenue} prev={last.revenue}
          insight="Billed on room invoices" caption="Active and notice rooms" />
        <Kpi label={`Your ${REVENUE_SHARE * 100}% share`} value={thb(s.share)} now={s.share} prev={last.share}
          insight={`You keep ${REVENUE_SHARE * 100}%`} caption={`${thb(s.revenue - s.share)} to ${BRAND}`} />
        <Kpi label="Pre-upgraded vacant" value={s.vacant} now={s.vacant} prev={last.vacant}
          insight="Market as pre-upgraded" caption="Setup fee waived" />
      </div>

      <div className="chart-grid">
        <section className="card-d">
          <div className="card-d-head">
            <h2>Your revenue share</h2>
            <p className="muted">{REVENUE_SHARE * 100}% of add-on revenue, last 6 months (THB)</p>
          </div>
          <div className="card-d-body"><ShareChart data={history} /></div>
        </section>
        <section className="card-d">
          <div className="card-d-head">
            <h2>Recent activity</h2>
            <p className="muted">{activity.length} updates this week</p>
          </div>
          <div className="card-d-body act-list">
            {activity.map((a) => (
              <a key={a.room + a.text} className="act-row" href={`#/landlord/rooms/${a.dorm}-${a.room}`}>
                <span className="avatar" aria-hidden="true">{a.who ? initials(a.who) : <DoorOpen size={16} />}</span>
                <span className="grow">
                  <strong>{a.who ?? `Room ${a.room}`} <span className="act-when">· {a.days === 0 ? 'today' : `${a.days}d ago`}</span></strong>
                  <small>{a.who ? `Room ${a.room} · ` : ''}{a.text}</small>
                </span>
                {a.amount != null && <span className="act-amount num">+{thb(a.amount)}</span>}
              </a>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

// ---------- L2 Rooms ----------
function AddonCell({ room }) {
  if (!room.productIds.length) return <span className="muted">—</span>
  return (
    <span className="addon-cell">
      {room.productIds.map((id) => <ItemThumb key={id} product={getProduct(id)} />)}
      <span>{room.productIds.map((id) => getProduct(id).name).join(' + ')}</span>
    </span>
  )
}

export function Rooms({ openId, inspect }) {
  const { rooms, dorm, setDorm, roomSearch, setRoomSearch, setInvoiceSearch } = useStore()
  const [statuses, setStatuses] = useState([])
  const [adding, setAdding] = useState(false)
  const list = rooms.filter((r) => r.dorm === dorm)
  const q = roomSearch.trim().toLowerCase().replace(/^room\s*/, '')
  const filtered = list.filter((r) => (!statuses.length || statuses.includes(r.status))
    && (!q || r.room.includes(q) || r.tenant?.toLowerCase().includes(q)))
  const { shown, reset, pager } = usePaged(filtered)
  const open = openId && rooms.find((r) => r.id === openId)
  // A deep link to another property's room switches the property, so the table behind the sheet matches.
  useEffect(() => {
    if (open && open.dorm !== dorm) { setDorm(open.dorm); setRoomSearch('') }
  }, [open, dorm, setDorm, setRoomSearch])
  const showInvoices = (r) => { setInvoiceSearch(r.room); go('/landlord/invoices') }

  return (
    <>
      <PageHeader title="Rooms" desc={`Add-on status for every room in ${dormName(dorm)}`}
        action={<button type="button" className="btn-d btn-primary" onClick={() => setAdding(true)}><Plus size={16} aria-hidden="true" />Add room</button>} />

      <div className="toolbar">
        <SearchBox label="Search rooms or tenants" value={roomSearch} onChange={(v) => { setRoomSearch(v); reset() }} />
        <Facet title="Status" selected={statuses} onChange={(v) => { setStatuses(v); reset() }}
          options={Object.entries(ROOM_STATUS).map(([value, [, label]]) => ({ value, label, count: list.filter((r) => r.status === value).length }))} />
      </div>

      <div className="table-wrap">
        <table className="table-d table-fixed">
          <thead>
            <tr>
              <th style={{ width: 96 }}>Room</th><th style={{ width: '18%' }}>Tenant</th><th style={{ width: 188 }}>Status</th><th>Add-ons</th>
              <th className="num-col" style={{ width: 160 }}>Monthly add-on</th><th style={{ width: 56 }}><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.id} className="click-row" onClick={(e) => { if (!e.target.closest('a, button, .pop')) go(`/landlord/rooms/${r.id}`) }}>
                <td><a className="room-link" href={`#/landlord/rooms/${r.id}`}>{r.room}</a><small className="cell-sub">Floor {r.floor}</small></td>
                <td className="truncate">{r.tenant ?? <span className="muted">Vacant</span>}</td>
                <td><StatusBadge map={ROOM_STATUS} status={r.status} /></td>
                <td><AddonCell room={r} /></td>
                <td className="num-col num">{r.productIds.length ? thb(roomMonthly(r)) : <span className="muted">—</span>}</td>
                <td className="action-col">
                  <Popover label={`Actions for room ${r.room}`} className="btn-d btn-ghost btn-icon btn-sm" align="end" button={<EllipsisVertical size={16} />}>
                    {(close) => (
                      <div className="menu">
                        <a className="menu-item" href={`#/landlord/rooms/${r.id}`} onClick={close}><Eye size={16} aria-hidden="true" />View details</a>
                        {isBilled(r) && <a className="menu-item" href={`#/landlord/rooms/${r.id}/checkout`} onClick={close}><ClipboardCheck size={16} aria-hidden="true" />Start check-out</a>}
                        {r.tenant && <button type="button" className="menu-item" onClick={() => showInvoices(r)}><ReceiptText size={16} aria-hidden="true" />View invoices</button>}
                      </div>
                    )}
                  </Popover>
                </td>
              </tr>
            ))}
            {!shown.length && <EmptyRow cols={6} onClear={() => { setStatuses([]); setRoomSearch('') }} />}
          </tbody>
        </table>
      </div>
      <Pager noun="room" {...pager} />

      {open && <RoomSheet key={open.id + inspect} room={open} inspect={inspect && isBilled(open)} onInvoices={() => showInvoices(open)} />}
      {adding && <AddRoomSheet onClose={() => setAdding(false)} />}
    </>
  )
}

function AddRoomSheet({ onClose }) {
  const { rooms, setRooms, dorm, showToast } = useStore()
  const [num, setNum] = useState('')
  const [tried, setTried] = useState(false)
  const error = !/^[1-9]\d{2}$/.test(num) ? 'Enter a 3-digit room number, e.g. 407'
    : rooms.some((r) => r.dorm === dorm && r.room === num) ? `Room ${num} already exists` : null
  const submit = (e) => {
    e.preventDefault()
    setTried(true)
    if (error) return
    setRooms((rs) => [...rs, {
      id: `${dorm}-${num}`, dorm, room: num, floor: Number(num[0]), status: 'none', tenant: null, productIds: [], start: null, term: 6, moveOut: null, elec: [700, 780, 650],
    }])
    showToast(`Room ${num} added`)
    onClose()
  }
  return (
    <Sheet side title="Add room" onClose={onClose}>
      <form className="sheet-form" onSubmit={submit} noValidate>
        <div className="sheet-body stack">
          <p className="muted">New rooms start with no add-ons. Tenants subscribe from the {BRAND} app.</p>
          <label className="field-d">
            <span>Room number <span className="req" aria-hidden="true">*</span></span>
            <input className="input-d" inputMode="numeric" maxLength={3} value={num} onChange={(e) => setNum(e.target.value.trim())}
              required aria-invalid={tried && !!error} aria-describedby="room-num-err" autoFocus />
            {tried && error && <small id="room-num-err" className="field-err">{error}</small>}
          </label>
          <div className="kv-d">
            <div><dt>Property</dt><dd>{dormName(dorm)}</dd></div>
            <div><dt>Floor</dt><dd>{/^[1-9]/.test(num) ? num[0] : '—'}</dd></div>
            <div><dt>Rent</dt><dd className="num">{thb(PARTNER_DORMS.find((d) => d.id === dorm).rent)}/mo</dd></div>
          </div>
        </div>
        <div className="sheet-foot">
          <button type="button" className="btn-d btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-d btn-primary">Add room</button>
        </div>
      </form>
    </Sheet>
  )
}

// ---------- L3 Room detail + check-out inspection ----------
const closeRoom = () => go('/landlord/rooms')

function RoomSheet({ room, inspect, onInvoices }) {
  return (
    <Sheet side title={inspect ? `Check-out · Room ${room.room}` : `Room ${room.room}`} onClose={closeRoom}>
      {inspect ? <Inspection room={room} /> : <RoomDetail room={room} onInvoices={onInvoices} />}
    </Sheet>
  )
}

function RoomDetail({ room, onInvoices }) {
  const monthly = roomMonthly(room)
  const skus = room.productIds.flatMap((id) => getProduct(id).items)
  return (
    <>
      <div className="sheet-body stack">
        <div className="row-d"><StatusBadge map={ROOM_STATUS} status={room.status} /><span className="muted">{dormName(room.dorm)} · Floor {room.floor}</span></div>
        {room.status === 'notice' && <Banner tone="warning" icon={TriangleAlert}>Moving out on <strong>{fmtDate(room.moveOut)}</strong>. Do the check-out inspection on move-out day.</Banner>}
        {room.status === 'preupgraded' && <Banner tone="info" icon={Info}>Items stay in this room. Market it as pre-upgraded: the next tenant takes over with the setup fee waived.</Banner>}

        <dl className="kv-d">
          <div><dt>Tenant</dt><dd>{room.tenant ?? 'Vacant'}</dd></div>
          <div><dt>Monthly add-on</dt><dd className="num">{monthly ? thb(monthly) : '—'}</dd></div>
          {isBilled(room) && <>
            <div><dt>Deposit held</dt><dd className="num">{thb(depositFor(monthly))}</dd></div>
            <div><dt>Started</dt><dd>{fmtDate(room.start)}</dd></div>
            <div><dt>Term</dt><dd>{room.term} months</dd></div>
            <div><dt>Your share</dt><dd className="num">{thb(Math.round(monthly * REVENUE_SHARE))}/mo</dd></div>
          </>}
        </dl>

        <section>
          <h3 className="sheet-section">Items in room</h3>
          {skus.length ? skus.map((sku) => (
            <div className="item-row" key={sku}>
              <ItemThumb sku={sku} />
              <div className="grow"><strong>{SKUS[sku].name}</strong><span className="muted">{SKUS[sku].models.split(',')[0]}</span></div>
              <Badge tone={room.status === 'preupgraded' ? 'info' : 'success'}>{room.status === 'preupgraded' ? 'Waiting for tenant' : 'Installed'}</Badge>
            </div>
          )) : (
            <div className="center-state compact">
              <div className="circle circle-muted"><PackageOpen size={24} aria-hidden="true" /></div>
              <strong>No add-ons in this room</strong>
              <p>When a tenant subscribes in the {BRAND} app, the items and fee show up here.</p>
            </div>
          )}
        </section>
      </div>
      <div className="sheet-foot">
        {room.tenant && <button type="button" className="btn-d btn-outline" onClick={onInvoices}><ReceiptText size={16} aria-hidden="true" />View invoices</button>}
        {isBilled(room)
          ? <a className="btn-d btn-primary" href={`#/landlord/rooms/${room.id}/checkout`}><ClipboardCheck size={16} aria-hidden="true" />Start check-out inspection</a>
          : <button type="button" className="btn-d btn-outline" onClick={closeRoom}>Close</button>}
      </div>
    </>
  )
}

const CONDITIONS = [['ok', 'OK'], ['wear', 'Normal wear'], ['damaged', 'Damaged']]
const STEPS = ['Items', 'Damage', 'Deposit']

function Inspection({ room }) {
  const { setRooms, showToast } = useStore()
  const skus = room.productIds.flatMap((id) => getProduct(id).items)
  const [step, setStep] = useState(0)
  const [cond, setCond] = useState(() => Object.fromEntries(skus.map((s) => [s, 'ok'])))
  const [picked, setPicked] = useState({})
  const months = monthsBetween(room.start, TODAY)
  const feeOptions = (sku) => [
    ...DAMAGE_FEES.filter((d) => d.sku === sku).map((d) => ({ key: d.label, label: d.label, fee: d.fee })),
    { key: 'total', label: 'Total loss (depreciated buyout)', fee: totalLossFee(sku, months) },
    { key: 'other', label: 'Other damage, assessed by operator', fee: 0 },
  ]
  const charges = skus.filter((s) => cond[s] === 'damaged').map((sku) => {
    const opts = feeOptions(sku)
    const o = opts.find((x) => x.key === picked[sku]) ?? opts.find((x) => x.key !== 'total')
    return { sku, ...o }
  })
  const damage = sum(charges.map((c) => c.fee))
  const deposit = depositFor(roomMonthly(room))
  const refund = Math.max(0, deposit - damage)
  const owed = Math.max(0, damage - deposit)

  const complete = () => {
    setRooms((rs) => rs.map((r) => (r.id === room.id ? { ...r, status: 'preupgraded', tenant: null, lastTenant: r.tenant, moveOut: null } : r)))
    showToast(`Room ${room.room} marked pre-upgraded`)
    closeRoom()
  }

  return (
    <>
      <div className="sheet-body stack">
        <Stepper steps={STEPS} current={step} label="Check-out inspection progress" />

        {step === 0 && <>
          <p className="muted">Check each item with the tenant on move-out day.</p>
          {skus.map((sku) => (
            <fieldset className="inspect-row" key={sku}>
              <ItemThumb sku={sku} />
              <legend className="grow"><strong>{SKUS[sku].name}</strong></legend>
              <div className="seg">
                {CONDITIONS.map(([v, label]) => (
                  <label key={v} className={v === 'damaged' ? 'bad' : ''}>
                    <input type="radio" name={`cond-${sku}`} value={v} checked={cond[sku] === v} onChange={() => setCond({ ...cond, [sku]: v })} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <p className="caption">{NORMAL_WEAR} Faults not caused by misuse go to the manufacturer warranty, so mark them OK and the operator handles them.</p>
        </>}

        {step === 1 && (charges.length ? <>
          <p className="muted">Pick the fee from the damage schedule for each damaged item.</p>
          {charges.map((c) => (
            <label className="field-d" key={c.sku}>
              <span>{SKUS[c.sku].name}</span>
              <div className="row-d">
                <select className="input-d" value={c.key} onChange={(e) => setPicked({ ...picked, [c.sku]: e.target.value })}>
                  {feeOptions(c.sku).map((o) => <option key={o.key} value={o.key}>{o.label}{o.fee ? ` · ${thb(o.fee)}` : ''}</option>)}
                </select>
                <strong className="num fee">{thb(c.fee)}</strong>
              </div>
              {c.key === 'total' && <small className="muted">Retail {thb(SKUS[c.sku].retail)}, {months} months in use. Never more than retail.</small>}
              {c.key === 'other' && <small className="muted">No fee now. The operator inspects and bills it separately.</small>}
            </label>
          ))}
        </> : <Banner tone="success" icon={CircleCheck}>No tenant damage recorded. The full deposit goes back to the tenant.</Banner>)}

        {step === 2 && <>
          <div className="lines">
            <div className="line"><span>Deposit held</span><span className="amount">{thb(deposit)}</span></div>
            {charges.map((c) => (
              <div className="line" key={c.sku}><span>{SKUS[c.sku].short}: {c.label}</span><span className="amount">{c.fee ? `−${thb(c.fee)}` : 'Billed by operator'}</span></div>
            ))}
            <div className="line total"><span>{owed ? 'Balance due from tenant' : 'Refund to tenant'}</span><span className="amount">{thb(owed || refund)}</span></div>
          </div>
          <p className="caption">{owed ? 'The balance goes on the tenant’s final room invoice.' : 'Refund within 3–5 business days.'}</p>
          <Banner tone="info" icon={Info}>Items stay in the room. Room {room.room} will be marked <strong>Pre-upgraded vacant</strong> for the next tenant.</Banner>
        </>}
      </div>
      <div className="sheet-foot">
        <span className="grow muted">Step {step + 1} of {STEPS.length}</span>
        {step === 0
          ? <a className="btn-d btn-outline" href={`#/landlord/rooms/${room.id}`}>Cancel</a>
          : <button type="button" className="btn-d btn-outline" onClick={() => setStep(step - 1)}>Previous</button>}
        {step < STEPS.length - 1
          ? <button type="button" className="btn-d btn-primary" onClick={() => setStep(step + 1)}>Next</button>
          : <button type="button" className="btn-d btn-primary" onClick={complete}>Complete check-out</button>}
      </div>
    </>
  )
}

// ---------- L4 Monthly invoices ----------
export function Invoices() {
  const { rooms, dorm, invoiceSearch, setInvoiceSearch, showToast } = useStore()
  const months = invoiceMonths()
  const [mi, setMi] = useState(0)
  const [statuses, setStatuses] = useState([])
  const [paidIds, setPaidIds] = useState([])
  const [openId, setOpenId] = useState(null)
  const all = invoicesFor(rooms, dorm, mi).map((inv) => (paidIds.includes(inv.id) ? { ...inv, status: 'paid' } : inv))
  const q = invoiceSearch.trim().toLowerCase().replace(/^room\s*/, '')
  const filtered = all.filter((i) => (!statuses.length || statuses.includes(i.status))
    && (!q || i.room.room.includes(q) || i.tenant.toLowerCase().includes(q)))
  const { shown, reset, pager } = usePaged(filtered)
  const addon = sum(all.map((i) => i.addon))
  const unpaid = all.filter((i) => i.status !== 'paid')
  const open = all.find((i) => i.id === openId)

  const send = () => showToast(mi === 0
    ? `${monthLabel(months[0])} invoices sent to ${all.length} tenants`
    : `Payment reminders sent to ${unpaid.length} tenants`)

  return (
    <>
      <PageHeader title="Invoices" desc={`Monthly room invoices with the ${BRAND} add-on line`}
        action={<button type="button" className="btn-d btn-primary" onClick={send} disabled={mi > 0 && !unpaid.length}>
          <Send size={16} aria-hidden="true" />{mi === 0 ? 'Send invoices' : 'Send reminders'}
        </button>} />

      <section className="card-d stat-strip" aria-label={`${monthLabel(months[mi])} summary`}>
        <div><small>Billed in {monthLabel(months[mi]).split(' ')[0]}</small><strong className="num">{thb(sum(all.map((i) => i.total)))}</strong></div>
        <div><small>{BRAND} add-ons</small><strong className="num">{thb(addon)}</strong></div>
        <div><small>Your {REVENUE_SHARE * 100}% share</small><strong className="num">{thb(Math.round(addon * REVENUE_SHARE))}</strong></div>
        <div><small>Pay to {BRAND} (85%)</small><strong className="num">{thb(addon - Math.round(addon * REVENUE_SHARE))}</strong></div>
      </section>

      <div className="toolbar">
        <select className="input-d select-d" value={mi} onChange={(e) => { setMi(Number(e.target.value)); reset() }} aria-label="Invoice month">
          {months.map((m, i) => <option key={i} value={i}>{monthLabel(m)}</option>)}
        </select>
        <SearchBox label="Search rooms or tenants" value={invoiceSearch} onChange={(v) => { setInvoiceSearch(v); reset() }} />
        <Facet title="Status" selected={statuses} onChange={(v) => { setStatuses(v); reset() }}
          options={Object.entries(INVOICE_STATUS).map(([value, [, label]]) => ({ value, label, count: all.filter((i) => i.status === value).length }))} />
      </div>

      <div className="table-wrap">
        <table className="table-d table-fixed">
          <thead>
            <tr>
              <th style={{ width: 80 }}>Room</th><th>Tenant</th><th className="num-col">Rent</th><th className="num-col">Water</th><th className="num-col">Electricity</th>
              <th className="num-col addon-col" style={{ width: 168 }}>{BRAND} add-on</th><th className="num-col">Total</th><th style={{ width: 112 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((inv) => {
              const amt = (label) => inv.lines.find((l) => l.label === label).amount
              return (
                <tr key={inv.id} className="click-row" onClick={(e) => { if (!e.target.closest('button')) setOpenId(inv.id) }}>
                  <td><button type="button" className="room-link" onClick={() => setOpenId(inv.id)} aria-label={`Open invoice for room ${inv.room.room}`}>{inv.room.room}</button></td>
                  <td className="truncate" title={inv.tenant}>{inv.tenant}</td>
                  <td className="num-col num">{thb(amt('Room rent'))}</td>
                  <td className="num-col num">{thb(amt('Water'))}</td>
                  <td className="num-col num">{thb(amt('Electricity'))}</td>
                  <td className="num-col num addon-col">{inv.addon ? thb(inv.addon) : <span className="muted">—</span>}</td>
                  <td className="num-col num"><strong>{thb(inv.total)}</strong></td>
                  <td><StatusBadge map={INVOICE_STATUS} status={inv.status} /></td>
                </tr>
              )
            })}
            {!shown.length && <EmptyRow cols={8} onClear={() => { setStatuses([]); setInvoiceSearch('') }} />}
          </tbody>
        </table>
      </div>
      <Pager noun="invoice" {...pager} />

      {open && (
        <Sheet side title={`Invoice · Room ${open.room.room}`} onClose={() => setOpenId(null)}>
          <div className="sheet-body stack">
            <div className="row-d"><StatusBadge map={INVOICE_STATUS} status={open.status} /><span className="muted">{monthLabel(open.date)} · Due {fmtDate(open.due)}</span></div>
            <dl className="kv-d">
              <div><dt>Tenant</dt><dd>{open.tenant}</dd></div>
              <div><dt>Room</dt><dd>{dormName(open.room.dorm)}, {open.room.room}</dd></div>
            </dl>
            <div className="lines">
              {open.lines.map((l) => (
                <div className={`line ${l.addon ? 'hl' : ''}`} key={l.label}><span>{l.label}</span><span className="amount">{thb(l.amount)}</span></div>
              ))}
              <div className="line total"><span>Total</span><span className="amount">{thb(open.total)}</span></div>
            </div>
            {open.addon > 0 && (
              <div className="split">
                <h3 className="sheet-section">Add-on split</h3>
                <div className="lines">
                  <div className="line"><span>Your {REVENUE_SHARE * 100}% share</span><span className="amount">{thb(Math.round(open.addon * REVENUE_SHARE))}</span></div>
                  <div className="line"><span>Pay to {BRAND} (85%)</span><span className="amount">{thb(open.addon - Math.round(open.addon * REVENUE_SHARE))}</span></div>
                </div>
              </div>
            )}
          </div>
          <div className="sheet-foot">
            <button type="button" className="btn-d btn-outline" onClick={() => setOpenId(null)}>Close</button>
            {open.status !== 'paid' && (
              <button type="button" className="btn-d btn-primary" onClick={() => {
                setPaidIds([...paidIds, open.id]); showToast(`Room ${open.room.room} marked paid`); setOpenId(null)
              }}>Mark as paid</button>
            )}
          </div>
        </Sheet>
      )}
    </>
  )
}

export function LandlordNotFound() {
  return (
    <div className="center-state">
      <div className="circle circle-muted"><SearchX size={24} aria-hidden="true" /></div>
      <h1 className="section-title">Page not found</h1>
      <p>This page doesn’t exist.</p>
      <a className="btn-d btn-primary" href="#/landlord" style={{ marginTop: 16 }}>Back to dashboard</a>
    </div>
  )
}
