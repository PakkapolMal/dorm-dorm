import { useState } from 'react'
import { Truck, PackageCheck, TriangleAlert, Info, CircleCheck, SearchX, CalendarDays } from 'lucide-react'
import {
  SKUS, PARTNER_DORMS, DAMAGE_FEES, NORMAL_WEAR, RELOCATION_FEE, RETRIEVAL_FEE, REVENUE_SHARE, NOTICE_DAYS, BRAND, TODAY,
  ORDER_STATUS, ASSET_STATUS, EXIT_STATUS, EXIT_PATHS, STAGES, PRIORITY,
  getProduct, thb, thbMo, fmtDate, fmtDay, monthsBetween, nextWaves, lastWave, exitDates, exitFees, clusterOf, dormName, dormStats,
  isBilled, subsHistory, totalLossFee, sum,
} from '../data.js'
import { useStore } from '../store.jsx'
import { Avatar, Badge, Banner, Sheet, Dialog, ItemThumb } from '../ui.jsx'
import { PageHeader } from '../dash/Shell.jsx'
import { AddonCell, StatusBadge, SearchBox, Facet, Pager, EmptyRow, Kpi, AreaChart } from '../dash/parts.jsx'
import { usePaged } from '../dash/usePaged.js'

// ---------- small helpers ----------
const skusOf = (o) => o.productIds.flatMap((id) => getProduct(id).items)
const monthlyOf = (o) => sum(o.productIds.map((id) => getProduct(id).price))
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`
const TODAY_START = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate())
const daysAgo = (d) => Math.floor((TODAY - d) / 86400000)
const ago = (d) => { const n = daysAgo(d); return n <= 0 ? 'today' : `${n}d ago` }
const age = (d) => { const m = Math.max(0, monthsBetween(d, TODAY)); return m < 12 ? `${m} mo` : `${Math.floor(m / 12)} yr ${m % 12} mo` }
const DORM_SHORT = { garden: 'Garden', lotus: 'Lotus', chiangrak: 'Chiang Rak', bu: 'Phahon' }
const CLUSTERS = [...new Set(PARTNER_DORMS.map((d) => clusterOf(d.id)))]
const matches = (x, q) => !q || x.room.includes(q) || x.tenant?.toLowerCase().includes(q) || dormName(x.dorm).toLowerCase().includes(q)
const cleanQuery = (q) => q.trim().toLowerCase().replace(/^room\s*/, '')

function Person({ name, photo }) {
  return <span className="tenant-cell"><Avatar name={name} photo={photo} /><span className="truncate">{name}</span></span>
}
function RoomCell({ x }) {
  return <><strong className="cell-main">Room {x.room}</strong><small className="cell-sub truncate">{dormName(x.dorm)}</small></>
}

// ---------- O1 Dashboard ----------
export function OpDashboard() {
  const { rooms, orders, tickets, exits } = useStore()
  const subs = rooms.filter(isBilled).length
  const history = subsHistory(subs)
  const next = nextWaves()[0]
  const onNext = orders.filter((o) => o.wave === next.getTime() && o.status === 'scheduled')
  const onLast = orders.filter((o) => o.wave === lastWave().getTime())
  const open = tickets.filter((t) => t.stage !== 'resolved')
  const pending = exits.filter((x) => x.status === 'pending')
  const soonest = pending.map((x) => x.notice).sort((a, b) => a - b)[0]
  const items = sum(onNext.map((o) => skusOf(o).length))
  return (
    <>
      <PageHeader title="Operations overview" desc={`${PARTNER_DORMS.length} partner dorms in the Rangsit zone · ${fmtDate(TODAY)}`}
        action={<a className="btn-d btn-primary" href="#/operator/orders"><Truck size={16} aria-hidden="true" />Plan delivery wave</a>} />

      <div className="kpi-grid">
        <Kpi label="Active subscriptions" value={subs} now={subs} prev={history[4].value}
          insight={`${Math.round((subs / rooms.length) * 100)}% of partner rooms`} caption={`${rooms.length} rooms in ${PARTNER_DORMS.length} dorms`} />
        <Kpi label="Next wave orders" value={onNext.length} now={onNext.length} prev={onLast.length} vs="last wave"
          insight={`${fmtDay(next)} wave`} caption={`${plural(items, 'item')} to deliver`} />
        <Kpi label="Open tickets" value={open.length} now={open.length} prev={open.length + 2} vs="last week"
          insight={`${tickets.filter((t) => t.stage === 'new').length} waiting for triage`} caption={`${plural(tickets.filter((t) => t.stage === 'warranty').length, 'warranty claim')} open`} />
        <Kpi label="Pending exits" value={pending.length} now={pending.length} prev={Math.max(1, pending.length - 1)} vs="last week"
          insight={soonest ? `Next last day ${fmtDate(soonest)}` : 'Nothing to process'} caption={`${NOTICE_DAYS}-day notice via LINE OA`} />
      </div>

      <div className="chart-grid">
        <section className="card-d">
          <div className="card-d-head">
            <h2>Active subscriptions</h2>
            <p className="muted">All partner dorms, last 6 months</p>
          </div>
          <div className="card-d-body"><AreaChart data={history} name="Active subscriptions" fmt={(v) => plural(v, 'subscription')} /></div>
        </section>
        <section className="card-d">
          <div className="card-d-head">
            <h2>Upcoming wave · {fmtDay(next)}</h2>
            <p className="muted">{plural(onNext.length, 'order')} · {plural(items, 'item')} · {plural(new Set(onNext.map((o) => clusterOf(o.dorm))).size, 'cluster')}</p>
          </div>
          <div className="card-d-body act-list">
            {onNext.map((o) => (
              <a key={o.id} className="act-row" href="#/operator/orders">
                <Avatar name={o.tenant} photo={o.photo} />
                <span className="grow">
                  <strong>{o.tenant}</strong>
                  <small>Room {o.room}, {dormName(o.dorm)} · {o.productIds.map((id) => getProduct(id).name).join(' + ')}</small>
                </span>
                <span className="act-amount num">{thbMo(monthlyOf(o))}</span>
              </a>
            ))}
            {!onNext.length && (
              <div className="center-state compact">
                <div className="circle circle-muted"><CalendarDays size={24} aria-hidden="true" /></div>
                <strong>No orders on this wave yet</strong>
                <p>Assign new orders from Orders & waves.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  )
}

// ---------- O2 Orders + delivery waves ----------
export function Orders() {
  const { orders, setOrders, assets, setAssets, setRooms, showToast } = useStore()
  const [sel, setSel] = useState([])
  const [assigning, setAssigning] = useState(false)
  const [delivering, setDelivering] = useState(null)
  const [statuses, setStatuses] = useState([])
  const [search, setSearch] = useState('')
  const last = lastWave().getTime()
  const waves = [last, ...nextWaves(TODAY, 2).map((d) => d.getTime())]
  const canSelect = (o) => o.status === 'new' || (o.status === 'scheduled' && o.wave !== last)
  const q = cleanQuery(search)
  const filtered = orders.filter((o) => (!statuses.length || statuses.includes(o.status)) && (matches(o, q) || o.id.toLowerCase().includes(q)))
  const toggle = (ids, on) => setSel((s) => (on ? [...new Set([...s, ...ids])] : s.filter((x) => !ids.includes(x))))
  const batch = delivering && orders.filter((o) => o.wave === delivering && o.status === 'scheduled')

  const deliver = () => {
    // Take a warehouse unit per item; the rooms become Active (the landlord sees it too).
    const next = [...assets]
    for (const o of batch) for (const sku of skusOf(o)) {
      const i = next.findIndex((a) => a.sku === sku && a.status === 'warehouse')
      if (i < 0) { showToast(`Not enough ${SKUS[sku].short.toLowerCase()} stock in the warehouse`, 'error'); setDelivering(null); return }
      next[i] = { ...next[i], status: 'installed', roomId: o.roomId }
    }
    const ids = batch.map((o) => o.id)
    setAssets(next)
    setOrders((os) => os.map((o) => (ids.includes(o.id) ? { ...o, status: 'delivered' } : o)))
    setRooms((rs) => rs.map((r) => {
      const o = batch.find((b) => b.roomId === r.id)
      return o ? { ...r, status: 'active', productIds: o.productIds, start: new Date(delivering), term: o.term } : r
    }))
    showToast(`${plural(batch.length, 'order')} delivered · ${plural(sum(batch.map((o) => skusOf(o).length)), 'item')} installed`)
    setDelivering(null)
  }

  return (
    <>
      <PageHeader title="Orders & delivery waves" desc="Group new orders by dorm cluster, then deliver them on a Wednesday or Saturday wave"
        action={<button type="button" className="btn-d btn-primary" disabled={!sel.length} onClick={() => setAssigning(true)}>
          <CalendarDays size={16} aria-hidden="true" />Assign to wave{sel.length ? ` (${sel.length})` : ''}
        </button>} />

      <div className="wave-grid">
        {waves.map((w) => {
          const ws = orders.filter((o) => o.wave === w)
          const todo = ws.filter((o) => o.status === 'scheduled')
          const isLast = w === last
          return (
            <section key={w} className="card-d wave-card" aria-label={`Wave ${fmtDay(new Date(w))}`}>
              <div className="wave-top">
                <div>
                  <small className="muted">{isLast ? (daysAgo(new Date(w)) === 0 ? 'Today' : 'Out for delivery') : 'Upcoming'}</small>
                  <h2>{fmtDay(new Date(w))}</h2>
                </div>
                {isLast && !todo.length && ws.length > 0 && <Badge tone="success">Delivered</Badge>}
              </div>
              <p className="num">{plural(ws.length, 'order')} · {plural(sum(ws.map((o) => skusOf(o).length)), 'item')}</p>
              <p className="muted wave-clusters">{[...new Set(ws.map((o) => clusterOf(o.dorm)))].join(' · ') || 'No orders yet'}</p>
              <div className="wave-action">
                {isLast && todo.length > 0 && (
                  <button type="button" className="btn-d btn-outline btn-sm" onClick={() => setDelivering(w)}><PackageCheck size={16} aria-hidden="true" />Mark delivered</button>
                )}
              </div>
            </section>
          )
        })}
      </div>

      <div className="toolbar">
        <SearchBox label="Search orders or rooms" value={search} onChange={setSearch} />
        <Facet title="Status" selected={statuses} onChange={setStatuses}
          options={Object.entries(ORDER_STATUS).map(([value, [, label]]) => ({ value, label, count: orders.filter((o) => o.status === value).length }))} />
      </div>

      <div className="table-wrap">
        <table className="table-d table-fixed grouped">
          <thead>
            <tr>
              <th style={{ width: 48 }}><span className="sr-only">Select</span></th><th style={{ width: 96 }}>Order</th><th style={{ width: '17%' }}>Room</th>
              <th style={{ width: '16%' }}>Tenant</th><th>Items</th><th style={{ width: 80 }}>Term</th><th style={{ width: 136 }}>Wave</th><th style={{ width: 120 }}>Status</th>
            </tr>
          </thead>
          {CLUSTERS.map((c) => {
            const rows = filtered.filter((o) => clusterOf(o.dorm) === c)
            if (!rows.length) return null
            const open = rows.filter(canSelect).map((o) => o.id)
            return (
              <tbody key={c}>
                <tr className="group-row">
                  <td><input type="checkbox" aria-label={`Select all open orders in ${c}`} disabled={!open.length}
                    checked={open.length > 0 && open.every((id) => sel.includes(id))} onChange={(e) => toggle(open, e.target.checked)} /></td>
                  <td colSpan={7}><strong>{c}</strong> <span className="muted">· {plural(rows.length, 'order')}</span></td>
                </tr>
                {rows.map((o) => (
                  <tr key={o.id}>
                    <td><input type="checkbox" aria-label={`Select order ${o.id}`} disabled={!canSelect(o)} checked={sel.includes(o.id)} onChange={(e) => toggle([o.id], e.target.checked)} /></td>
                    <td><span className="num">{o.id}</span><small className="cell-sub">{fmtDate(o.ordered)}</small></td>
                    <td><RoomCell x={o} /></td>
                    <td><Person name={o.tenant} photo={o.photo} /></td>
                    <td><AddonCell room={o} /></td>
                    <td>{o.term} mo</td>
                    <td>{o.wave ? fmtDay(new Date(o.wave)) : <span className="muted">Not assigned</span>}</td>
                    <td><StatusBadge map={ORDER_STATUS} status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            )
          })}
          {!filtered.length && <tbody><EmptyRow cols={8} onClear={() => { setStatuses([]); setSearch('') }} /></tbody>}
        </table>
      </div>
      <div className="table-foot"><span className="muted">{plural(filtered.length, 'order')} · {sel.length} selected</span></div>

      {assigning && <AssignSheet ids={sel} onClose={() => setAssigning(false)} onDone={() => { setSel([]); setAssigning(false) }} />}
      {batch && (
        <Dialog title={`Mark ${plural(batch.length, 'order')} delivered?`} confirm="Mark delivered" onConfirm={deliver} onClose={() => setDelivering(null)}>
          <p>{plural(sum(batch.map((o) => skusOf(o).length)), 'item')} move from the warehouse to <strong>Installed</strong> in {batch.map((o) => `${DORM_SHORT[o.dorm]} ${o.room}`).join(', ')}.</p>
          <p>The subscriptions become Active and billing starts on the next room invoice.</p>
        </Dialog>
      )}
    </>
  )
}

function AssignSheet({ ids, onClose, onDone }) {
  const { orders, setOrders, assets, showToast } = useStore()
  const upcoming = nextWaves()
  const [wave, setWave] = useState(upcoming[0].getTime())
  const chosen = orders.filter((o) => ids.includes(o.id))
  // Stock check: everything not yet delivered that will be on a wave, including this selection.
  const need = {}
  for (const o of orders.filter((x) => x.status !== 'delivered' && (ids.includes(x.id) || x.wave))) for (const s of skusOf(o)) need[s] = (need[s] ?? 0) + 1
  const stock = (sku) => assets.filter((a) => a.sku === sku && a.status === 'warehouse').length
  const short = Object.keys(need).filter((s) => need[s] > stock(s))
  const submit = (e) => {
    e.preventDefault()
    setOrders((os) => os.map((o) => (ids.includes(o.id) ? { ...o, wave, status: 'scheduled' } : o)))
    showToast(`${plural(ids.length, 'order')} assigned to ${fmtDay(new Date(wave))}`)
    onDone()
  }
  return (
    <Sheet side title="Assign to wave" onClose={onClose}>
      <form className="sheet-form" onSubmit={submit}>
        <div className="sheet-body stack">
          <section>
            <h3 className="sheet-section">{plural(chosen.length, 'order')}</h3>
            <div className="lines">
              {CLUSTERS.map((c) => {
                const n = chosen.filter((o) => clusterOf(o.dorm) === c)
                return n.length ? <div className="line" key={c}><span>{c}</span><span className="amount">{n.map((o) => o.room).join(', ')}</span></div> : null
              })}
            </div>
          </section>
          <fieldset className="radio-list">
            <legend className="sheet-section">Wave day</legend>
            {upcoming.map((d) => {
              const t = d.getTime()
              const on = orders.filter((o) => o.wave === t && !ids.includes(o.id)).length
              return (
                <label key={t} className="radio-d">
                  <input type="radio" name="wave" value={t} checked={wave === t} onChange={() => setWave(t)} />
                  <span className="grow"><strong>{fmtDay(d)}</strong><small>{on ? `${plural(on, 'order')} already on this wave` : 'No orders yet'}</small></span>
                </label>
              )
            })}
          </fieldset>
          <section>
            <h3 className="sheet-section">Warehouse stock</h3>
            <div className="lines">
              {Object.keys(need).map((s) => (
                <div className="line" key={s}>
                  <span className="row-d"><ItemThumb sku={s} />{SKUS[s].name}</span>
                  <span className="amount">{need[s]} needed · {stock(s)} in stock {need[s] > stock(s) && <Badge tone="danger">Short</Badge>}</span>
                </div>
              ))}
            </div>
            <p className="caption">Counts every order on a wave that is not delivered yet.</p>
          </section>
          {short.length > 0 && <Banner tone="warning" icon={TriangleAlert}>Not enough {short.map((s) => SKUS[s].short.toLowerCase()).join(', ')} in the warehouse. Restock before the wave.</Banner>}
        </div>
        <div className="sheet-foot">
          <button type="button" className="btn-d btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-d btn-primary">Assign to {fmtDay(new Date(wave))}</button>
        </div>
      </form>
    </Sheet>
  )
}

// ---------- O3 Assets ----------
export function Assets() {
  const { assets, rooms, assetSearch, setAssetSearch } = useStore()
  const [statuses, setStatuses] = useState([])
  const [skus, setSkus] = useState([])
  const roomOf = (a) => a.roomId && rooms.find((r) => r.id === a.roomId)
  const q = cleanQuery(assetSearch)
  const filtered = assets.filter((a) => {
    if (statuses.length && !statuses.includes(a.status)) return false
    if (skus.length && !skus.includes(a.sku)) return false
    const r = roomOf(a)
    return !q || a.id.toLowerCase().includes(q) || SKUS[a.sku].name.toLowerCase().includes(q) || (r && matches(r, q))
  })
  const { shown, reset, pager } = usePaged(filtered)
  const count = (s) => assets.filter((a) => a.status === s).length
  return (
    <>
      <PageHeader title="Assets" desc="Every unit by serial number, across all partner dorms" />

      <section className="card-d stat-strip" aria-label="Asset summary">
        <div><small>Total units</small><strong className="num">{assets.length}</strong></div>
        <div><small>Installed</small><strong className="num">{count('installed')}</strong></div>
        <div><small>In warehouse</small><strong className="num">{count('warehouse')}</strong></div>
        <div><small>In repair</small><strong className="num">{count('repair')}</strong></div>
      </section>

      <div className="toolbar">
        <SearchBox label="Search serials or rooms" value={assetSearch} onChange={(v) => { setAssetSearch(v); reset() }} />
        <Facet title="Status" selected={statuses} onChange={(v) => { setStatuses(v); reset() }}
          options={Object.entries(ASSET_STATUS).map(([value, [, label]]) => ({ value, label, count: count(value) }))} />
        <Facet title="Item" selected={skus} onChange={(v) => { setSkus(v); reset() }}
          options={Object.keys(SKUS).map((value) => ({ value, label: SKUS[value].name, count: assets.filter((a) => a.sku === value).length }))} />
      </div>

      <div className="table-wrap">
        <table className="table-d table-fixed">
          <thead>
            <tr>
              <th>Item</th><th style={{ width: 148 }}>Serial</th><th style={{ width: 128 }}>Status</th><th style={{ width: '20%' }}>Location</th>
              <th className="num-col" style={{ width: 112 }}>Age</th><th style={{ width: 152 }}>Warranty ends</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((a) => {
              const r = roomOf(a)
              return (
                <tr key={a.id}>
                  <td><span className="addon-cell"><ItemThumb sku={a.sku} /><span>{SKUS[a.sku].name}</span></span></td>
                  <td className="num">{a.id}</td>
                  <td><StatusBadge map={ASSET_STATUS} status={a.status} /></td>
                  <td>{r ? <RoomCell x={r} /> : <span className="muted">{a.status === 'retired' ? 'Written off' : 'Warehouse, Khlong Nueng'}</span>}</td>
                  <td className="num-col num">{age(a.purchased)}</td>
                  <td>{fmtDate(a.warrantyEnd)}{a.warrantyEnd < TODAY_START && <small className="cell-sub">Expired</small>}</td>
                </tr>
              )
            })}
            {!shown.length && <EmptyRow cols={6} onClear={() => { setStatuses([]); setSkus([]); setAssetSearch('') }} />}
          </tbody>
        </table>
      </div>
      <Pager noun="unit" {...pager} />
    </>
  )
}

// ---------- O4 Issue tickets ----------
export function Tickets() {
  const { tickets } = useStore()
  const [openId, setOpenId] = useState(null)
  const open = tickets.find((t) => t.id === openId)
  return (
    <>
      <PageHeader title="Issue tickets" desc="Triage each report to a warranty claim (free for the tenant) or a damage fee from the schedule" />
      <div className="kanban">
        {STAGES.map(([key, label]) => {
          const col = tickets.filter((t) => t.stage === key)
          return (
            <section key={key} className="kan-col" aria-labelledby={`col-${key}`}>
              <div className="kan-head"><h2 id={`col-${key}`}>{label}</h2><span className="count-chip num">{col.length}</span></div>
              <div className="kan-list">
                {col.map((t) => (
                  <button key={t.id} type="button" className="kan-card" onClick={() => setOpenId(t.id)}>
                    <span className="kan-top"><strong>{t.title}</strong><StatusBadge map={PRIORITY} status={t.priority} /></span>
                    <span className="kan-item"><ItemThumb sku={t.sku} /><span>{SKUS[t.sku].short}</span>{t.fee ? <span className="kan-fee num">{thb(t.fee)}</span> : null}</span>
                    <span className="kan-meta"><span>{t.id} · {DORM_SHORT[t.dorm]} {t.room}</span><span>{ago(t.created)}</span></span>
                  </button>
                ))}
                {!col.length && <p className="kan-empty">No tickets</p>}
              </div>
            </section>
          )
        })}
      </div>
      {open && <TicketSheet key={open.id} t={open} onClose={() => setOpenId(null)} />}
    </>
  )
}

const REPORTED = { fault: 'Not working', damage: 'Damaged', wear: 'Wear or cosmetic' }
const OUTCOMES = {
  warranty: 'Manufacturer warranty claim. The tenant pays nothing.',
  wear: 'Normal wear. No charge.',
  damage: 'Tenant damage, charged from the fee schedule.',
}

function TicketSheet({ t, onClose }) {
  const { setTickets, assets, setAssets, showToast } = useStore()
  const unit = assets.find((a) => a.roomId === t.roomId && a.sku === t.sku)
  const months = unit ? Math.max(0, monthsBetween(unit.purchased, TODAY)) : 0
  const inWarranty = unit && unit.warrantyEnd >= TODAY_START
  const feeOpts = [
    ...DAMAGE_FEES.filter((d) => d.sku === t.sku).map((d) => ({ key: d.label, label: d.label, fee: d.fee })),
    { key: 'total', label: 'Total loss (depreciated buyout)', fee: totalLossFee(t.sku, months) },
  ]
  const [outcome, setOutcome] = useState(null) // operator must choose; no fee by default
  const [feeKey, setFeeKey] = useState(feeOpts[0].key)
  const [confirming, setConfirming] = useState(false)
  const fee = feeOpts.find((o) => o.key === feeKey)
  const update = (patch, msg) => { setTickets((ts) => ts.map((x) => (x.id === t.id ? { ...x, ...patch } : x))); showToast(msg) }
  const setUnit = (status) => unit && setAssets((as) => as.map((a) => (a.id === unit.id ? { ...a, status } : a)))

  const triage = () => {
    if (outcome === 'warranty') { update({ stage: 'warranty', outcome }, `${t.id}: warranty claim filed`); setUnit('repair') }
    else if (outcome === 'wear') update({ stage: 'resolved', outcome }, `${t.id} resolved, no charge`)
    else update({ stage: 'damage', outcome, fee: fee.fee, feeLabel: fee.label }, `${t.id}: damage fee ${thb(fee.fee)} set`)
  }
  const approve = () => {
    update({ stage: 'resolved' }, `${thb(t.fee)} added to room ${t.room}'s next invoice`)
    setConfirming(false)
  }
  const stage = STAGES.find(([k]) => k === t.stage)[1]

  return (
    <>
      <Sheet side title={`Ticket ${t.id}`} onClose={onClose}>
        <div className="sheet-body stack">
          <div className="row-d"><Badge tone={t.stage === 'resolved' ? 'success' : 'neutral'}>{stage}</Badge><StatusBadge map={PRIORITY} status={t.priority} /><span className="muted">Reported {fmtDate(t.created)}</span></div>
          <div className="item-row">
            <ItemThumb sku={t.sku} />
            <div className="grow"><strong>{t.title}</strong><span className="muted">{SKUS[t.sku].name}</span></div>
          </div>
          <dl className="kv-d">
            <div><dt>Tenant</dt><dd>{t.tenant}</dd></div>
            <div><dt>Room</dt><dd>{dormName(t.dorm) ?? t.dorm}, {t.room}</dd></div>
            <div><dt>Serial</dt><dd className="num">{unit?.id ?? '—'}</dd></div>
            <div><dt>Warranty</dt><dd>{unit ? `${inWarranty ? 'Until' : 'Ended'} ${fmtDate(unit.warrantyEnd)}` : '—'}</dd></div>
            <div><dt>Tenant reported</dt><dd>{REPORTED[t.type]}</dd></div>
            <div><dt>In use</dt><dd>{unit ? age(unit.purchased) : '—'}</dd></div>
          </dl>
          {t.detail && <blockquote className="quote">“{t.detail}”</blockquote>}

          {t.stage === 'new' && <Banner tone="info" icon={Info}>Check the tenant’s photos and description on LINE, then start triage.</Banner>}

          {t.stage === 'triage' && (
            <fieldset className="radio-list">
              <legend className="sheet-section">Triage outcome</legend>
              {Object.entries({ warranty: 'Warranty claim', wear: 'Normal wear', damage: 'Damage fee' }).map(([k, label]) => (
                <label key={k} className="radio-d">
                  <input type="radio" name="outcome" value={k} checked={outcome === k} onChange={() => setOutcome(k)} />
                  <span className="grow"><strong>{label}</strong><small>{OUTCOMES[k]}</small></span>
                  <span className="num radio-price">{k === 'damage' ? thb(fee.fee) : '0 THB'}</span>
                </label>
              ))}
              {outcome === 'warranty' && unit && !inWarranty && (
                <Banner tone="warning" icon={TriangleAlert}>The manufacturer warranty ended {fmtDate(unit.warrantyEnd)}. {BRAND} pays for the repair, not the tenant.</Banner>
              )}
              {outcome === 'wear' && <p className="caption">{NORMAL_WEAR}</p>}
              {outcome === 'damage' && (
                <label className="field-d">
                  <span>Fee from the damage schedule</span>
                  <select className="input-d" value={feeKey} onChange={(e) => setFeeKey(e.target.value)}>
                    {feeOpts.map((o) => <option key={o.key} value={o.key}>{o.label} · {thb(o.fee)}</option>)}
                  </select>
                  {feeKey === 'total' && <small className="muted">Retail {thb(SKUS[t.sku].retail)}, {months} months in use. Never more than retail.</small>}
                </label>
              )}
            </fieldset>
          )}

          {t.stage === 'warranty' && <Banner tone="info" icon={Info}>Claim filed with the manufacturer. Unit {unit?.id} is <strong>In repair</strong>. The tenant pays nothing.</Banner>}

          {t.stage === 'damage' && <>
            <div className="lines">
              <div className="line"><span>{t.feeLabel}</span><span className="amount">{thb(t.fee)}</span></div>
            </div>
            <p className="caption">Charged on the tenant’s next room invoice, or taken from the deposit at check-out.</p>
          </>}

          {t.stage === 'resolved' && (
            <Banner tone="success" icon={CircleCheck}>
              Resolved. {t.outcome === 'damage' ? `${thb(t.fee)} damage fee (${t.feeLabel.toLowerCase()}) billed to the tenant.` : OUTCOMES[t.outcome]}
            </Banner>
          )}
        </div>
        <div className="sheet-foot">
          <button type="button" className="btn-d btn-outline" onClick={onClose}>Close</button>
          {t.stage === 'new' && <button type="button" className="btn-d btn-primary" onClick={() => update({ stage: 'triage' }, `${t.id} moved to triage`)}>Start triage</button>}
          {t.stage === 'triage' && <button type="button" className="btn-d btn-primary" onClick={triage} disabled={!outcome}>
            {{ warranty: 'File warranty claim', wear: 'Resolve, no charge', damage: 'Set damage fee' }[outcome] ?? 'Choose an outcome'}
          </button>}
          {t.stage === 'warranty' && <button type="button" className="btn-d btn-primary" onClick={() => { update({ stage: 'resolved' }, `${t.id} repaired and closed`); setUnit('installed') }}>Mark repaired</button>}
          {t.stage === 'damage' && <button type="button" className="btn-d btn-primary" onClick={() => setConfirming(true)}>Approve damage fee</button>}
        </div>
      </Sheet>
      {confirming && (
        <Dialog title={`Approve ${thb(t.fee)} damage fee?`} confirm="Approve fee" onConfirm={approve} onClose={() => setConfirming(false)}>
          <p>{t.tenant}, room {t.room}: {t.feeLabel.toLowerCase()}. The fee goes on the next room invoice and the ticket closes.</p>
        </Dialog>
      )}
    </>
  )
}

// ---------- O5 Exit requests ----------
const feeText = (x) => {
  if (x.path === 'return') return thb(exitFees(x).returnTotal)
  if (x.path === 'relocate') return x.fee ? thb(x.fee) : `${RELOCATION_FEE[0]}–${RELOCATION_FEE[1]} THB`
  return '0 THB'
}

export function Exits() {
  const { exits } = useStore()
  const [statuses, setStatuses] = useState([])
  const [paths, setPaths] = useState([])
  const [search, setSearch] = useState('')
  const [openId, setOpenId] = useState(null)
  const q = cleanQuery(search)
  const filtered = exits.filter((x) => (!statuses.length || statuses.includes(x.status)) && (!paths.length || paths.includes(x.path)) && matches(x, q))
  const { shown, reset, pager } = usePaged(filtered)
  const open = exits.find((x) => x.id === openId)
  return (
    <>
      <PageHeader title="Exit requests" desc={`Tenants leaving early give ${NOTICE_DAYS} days’ notice on LINE OA. Schedule the pickup and settle the deposit.`} />

      <div className="toolbar">
        <SearchBox label="Search rooms or tenants" value={search} onChange={(v) => { setSearch(v); reset() }} />
        <Facet title="Status" selected={statuses} onChange={(v) => { setStatuses(v); reset() }}
          options={Object.entries(EXIT_STATUS).map(([value, [, label]]) => ({ value, label, count: exits.filter((x) => x.status === value).length }))} />
        <Facet title="Pathway" selected={paths} onChange={(v) => { setPaths(v); reset() }}
          options={Object.entries(EXIT_PATHS).map(([value, label]) => ({ value, label, count: exits.filter((x) => x.path === value).length }))} />
      </div>

      <div className="table-wrap">
        <table className="table-d table-fixed">
          <thead>
            <tr>
              <th style={{ width: '17%' }}>Room</th><th>Tenant</th><th style={{ width: 160 }}>Pathway</th><th style={{ width: 128 }}>Notice given</th>
              <th style={{ width: 128 }}>Last day</th><th className="num-col" style={{ width: 120 }}>Fee</th><th style={{ width: 120 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((x) => (
              <tr key={x.id} className="click-row" onClick={(e) => { if (!e.target.closest('button')) setOpenId(x.id) }}>
                <td><button type="button" className="room-link" onClick={() => setOpenId(x.id)} aria-label={`Process exit for room ${x.room}, ${dormName(x.dorm)}`}>Room {x.room}</button><small className="cell-sub truncate">{dormName(x.dorm)}</small></td>
                <td><Person name={x.tenant} photo={x.photo} /></td>
                <td><Badge>{EXIT_PATHS[x.path]}</Badge></td>
                <td>{fmtDate(x.requested)}</td>
                <td>{fmtDate(x.notice)}</td>
                <td className="num-col num">{feeText(x)}</td>
                <td><StatusBadge map={EXIT_STATUS} status={x.status} /></td>
              </tr>
            ))}
            {!shown.length && <EmptyRow cols={7} onClear={() => { setStatuses([]); setPaths([]); setSearch('') }} />}
          </tbody>
        </table>
      </div>
      <Pager noun="request" {...pager} />

      {open && <ExitSheet key={open.id} x={open} onClose={() => setOpenId(null)} />}
    </>
  )
}

const SUBMIT = { transfer: 'Confirm transfer', relocate: 'Schedule move', return: 'Schedule pickup', end: 'Confirm' }

function ExitSheet({ x, onClose }) {
  const { setExits, showToast } = useStore()
  const f = exitFees(x)
  const dates = exitDates(x.notice)
  const [date, setDate] = useState(x.date ?? dates[0].getTime())
  const [fee, setFee] = useState(x.fee ?? RELOCATION_FEE[0])
  const [who, setWho] = useState(x.detail)
  const [tried, setTried] = useState(false)
  const done = x.status === 'scheduled'
  const balance = f.deposit - f.returnTotal
  const whoError = x.path === 'transfer' && !who.trim() ? 'Enter the next tenant’s name and room' : null

  const submit = (e) => {
    e.preventDefault()
    setTried(true)
    if (whoError) return
    const dated = x.path === 'relocate' || x.path === 'return'
    setExits((xs) => xs.map((y) => (y.id === x.id ? {
      ...y, status: 'scheduled', date: dated ? date : null, detail: x.path === 'transfer' ? who.trim() : y.detail, ...(x.path === 'relocate' && { fee }),
    } : y)))
    showToast(dated ? `${x.path === 'return' ? 'Pickup' : 'Move'} for room ${x.room} scheduled on ${fmtDay(new Date(date))}` : `Exit for room ${x.room} confirmed`)
    onClose()
  }

  return (
    <Sheet side title={`Exit · Room ${x.room}`} onClose={onClose}>
      <form className="sheet-form" onSubmit={submit} noValidate>
        <div className="sheet-body stack">
          <div className="row-d"><StatusBadge map={EXIT_STATUS} status={x.status} /><Badge>{EXIT_PATHS[x.path]}</Badge></div>
          <Banner tone={done ? 'info' : 'warning'} icon={CalendarDays}>Last day <strong>{fmtDate(x.notice)}</strong>. Notice given {fmtDate(x.requested)} via LINE OA ({NOTICE_DAYS} days).</Banner>
          <dl className="kv-d">
            <div><dt>Tenant</dt><dd>{x.tenant}</dd></div>
            <div><dt>Room</dt><dd>{dormName(x.dorm) ?? x.dorm}, {x.room}</dd></div>
            <div><dt>Plan</dt><dd>{x.productIds.map((id) => getProduct(id).name).join(' + ')}</dd></div>
            <div><dt>Monthly</dt><dd className="num">{thbMo(f.monthly)}</dd></div>
            <div><dt>Term</dt><dd>{f.remaining ? `${f.remaining} of ${x.term} months left` : `${x.term} months, complete`}</dd></div>
            <div><dt>Deposit held</dt><dd className="num">{thb(f.deposit)}</dd></div>
          </dl>

          {x.path === 'transfer' && <>
            {done ? <dl className="kv-d"><div style={{ gridColumn: '1 / -1' }}><dt>Next tenant</dt><dd>{x.detail}</dd></div></dl> : <label className="field-d">
              <span>Next tenant <span className="req" aria-hidden="true">*</span></span>
              <input className="input-d" value={who} onChange={(e) => setWho(e.target.value)} required
                aria-invalid={tried && !!whoError} aria-describedby="who-err" placeholder="Name and room number" />
              {tried && whoError && <small id="who-err" className="field-err">{whoError}</small>}
            </label>}
            <div className="lines"><div className="line total"><span>Transfer fee</span><span className="amount">0 THB</span></div></div>
            <Banner tone="success" icon={CircleCheck}>The contract and the {thb(f.deposit)} deposit move to the new tenant. The items stay in the room.</Banner>
          </>}

          {x.path === 'relocate' && <>
            <dl className="kv-d"><div style={{ gridColumn: '1 / -1' }}><dt>New address</dt><dd>{x.detail || '—'}</dd></div></dl>
            <fieldset className="radio-list">
              <legend className="sheet-section">Relocation fee</legend>
              {[[RELOCATION_FEE[0], 'Same district'], [RELOCATION_FEE[1], 'Elsewhere in Rangsit / Pathum Thani']].map(([v, label]) => (
                <label key={v} className="radio-d">
                  <input type="radio" name="fee" value={v} checked={fee === v} onChange={() => setFee(v)} disabled={done} />
                  <span className="grow"><strong>{label}</strong></span><span className="num radio-price">{thb(v)}</span>
                </label>
              ))}
            </fieldset>
            <WaveSelect label="Move date" dates={dates} value={date} onChange={setDate} disabled={done} />
            <p className="caption">The subscription and the deposit continue at the new address.</p>
          </>}

          {x.path === 'return' && <>
            <WaveSelect label="Pickup date" dates={dates} value={date} onChange={setDate} disabled={done} />
            <section>
              <h3 className="sheet-section">Deposit settlement</h3>
              <div className="lines">
                <div className="line"><span>Deposit held</span><span className="amount">{thb(f.deposit)}</span></div>
                <div className="line"><span>Retrieval fee</span><span className="amount">−{thb(RETRIEVAL_FEE)}</span></div>
                <div className="line"><span>Early-exit fee</span><span className="amount">−{thb(f.early)}</span></div>
                <div className="line total"><span>{balance < 0 ? 'Balance due from tenant' : 'Refund to tenant'}</span><span className="amount">{thb(Math.abs(balance))}</span></div>
              </div>
              <p className="caption">
                Early-exit fee = the lower of one month ({thb(f.monthly)}) or half of the remaining {thb(f.monthly * f.remaining)} balance ({thb(Math.round((f.monthly * f.remaining) / 2))}).
                {balance < 0 ? ' The balance goes on the final room invoice.' : ' Refund within 3–5 business days after pickup and inspection.'}
              </p>
            </section>
          </>}

          {x.path === 'end' && <Banner tone="info" icon={Info}>Minimum term complete, so there is no fee. The landlord does the check-out inspection and the items stay in the room for the next tenant.</Banner>}

          {done && x.date && <Banner tone="info" icon={Truck}>Scheduled for <strong>{fmtDay(new Date(x.date))}</strong>.</Banner>}
        </div>
        <div className="sheet-foot">
          <button type="button" className="btn-d btn-outline" onClick={onClose}>{done ? 'Close' : 'Cancel'}</button>
          {!done && <button type="submit" className="btn-d btn-primary">{SUBMIT[x.path]}</button>}
        </div>
      </form>
    </Sheet>
  )
}

function WaveSelect({ label, dates, value, onChange, disabled }) {
  return (
    <label className="field-d">
      <span>{label}</span>
      <select className="input-d" value={value} onChange={(e) => onChange(Number(e.target.value))} disabled={disabled}>
        {dates.map((d) => <option key={d.getTime()} value={d.getTime()}>{fmtDay(d)} wave</option>)}
      </select>
      <small className="muted">Wave days on or after the last day of notice.</small>
    </label>
  )
}

// ---------- O6 Partner dorms ----------
export function Partners() {
  const { rooms } = useStore()
  const rows = PARTNER_DORMS.map((d) => ({ ...d, ...dormStats(rooms, d.id) }))
  const total = (k) => sum(rows.map((r) => r[k]))
  return (
    <>
      <PageHeader title="Partner dorms" desc={`Landlords bill the add-on on the room invoice and keep a ${REVENUE_SHARE * 100}% share`} />
      <div className="table-wrap">
        <table className="table-d table-fixed">
          <thead>
            <tr>
              <th>Dorm</th><th style={{ width: 136 }}>Cluster</th><th className="num-col" style={{ width: 120 }}>Rent</th><th className="num-col" style={{ width: 80 }}>Rooms</th>
              <th className="num-col" style={{ width: 112 }}>Upgraded</th><th className="num-col" style={{ width: 120 }}>Pre-upgraded</th>
              <th className="num-col" style={{ width: 144 }}>Add-on revenue</th><th className="num-col" style={{ width: 152 }}>Landlord {REVENUE_SHARE * 100}%</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.id}>
                <td><strong className="cell-main">{d.name}</strong><small className="cell-sub truncate">{d.area}</small></td>
                <td>{clusterOf(d.id)}</td>
                <td className="num-col num">{thbMo(d.rent)}</td>
                <td className="num-col num">{d.total}</td>
                <td className="num-col num">{d.upgraded}<small className="cell-sub">{Math.round((d.upgraded / d.total) * 100)}%</small></td>
                <td className="num-col num">{d.vacant}</td>
                <td className="num-col num">{thbMo(d.revenue)}</td>
                <td className="num-col num">{thbMo(d.share)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td><strong>All partner dorms</strong></td><td /><td />
              <td className="num-col num">{total('total')}</td>
              <td className="num-col num">{total('upgraded')}<small className="cell-sub">{Math.round((total('upgraded') / total('total')) * 100)}%</small></td>
              <td className="num-col num">{total('vacant')}</td>
              <td className="num-col num"><strong>{thbMo(total('revenue'))}</strong></td>
              <td className="num-col num"><strong>{thbMo(total('share'))}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="caption">Upgraded = Active + Notice-period rooms. Pre-upgraded rooms are vacant with the items still installed.</p>
    </>
  )
}

export function OperatorNotFound() {
  return (
    <div className="center-state">
      <div className="circle circle-muted"><SearchX size={24} aria-hidden="true" /></div>
      <h1 className="section-title">Page not found</h1>
      <p>This page doesn’t exist.</p>
      <a className="btn-d btn-primary" href="#/operator" style={{ marginTop: 16 }}>Back to dashboard</a>
    </div>
  )
}
