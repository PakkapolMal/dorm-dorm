import { useState } from 'react'
import { Wrench, LogOut, Tag, FileText, ChevronRight, House, CircleCheck, Info, ArrowRightLeft, Truck, Undo2, MessageCircle, Users } from 'lucide-react'
import {
  SKUS, getProduct, thb, PARTNER_DORMS, depositFor, fmtDate, addMonths, addDays, monthsBetween, NOTICE_DAYS,
  RETRIEVAL_FEE, RELOCATION_FEE, BUYOUT_AFTER_MONTHS, BUYOUT_RATE, DAMAGE_FEES, NORMAL_WEAR, SCENARIOS, billsFor, BRAND, SETUP_FEE, TODAY,
} from '../data.js'
import { useStore, go } from '../store.jsx'
import { Page, ActionBar } from './Shell.jsx'
import { Badge, Banner, Option, Sheet, ItemThumb } from '../ui.jsx'

// Derived numbers every My Room page needs.
function useSub() {
  const { subscription } = useStore()
  if (!subscription) return null
  const products = subscription.productIds.map(getProduct)
  const skus = products.flatMap((p) => p.items)
  const monthly = products.reduce((s, p) => s + p.price, 0)
  const elapsed = Math.max(0, monthsBetween(subscription.start, TODAY))
  const remaining = Math.max(0, subscription.term - elapsed)
  return {
    ...subscription, products, skus, monthly, elapsed, remaining,
    end: addMonths(subscription.start, subscription.term),
    deposit: depositFor(monthly),
    dormName: PARTNER_DORMS.find((d) => d.id === subscription.dorm)?.name,
  }
}

const STATUS = {
  active: ['success', 'Active'],
  scheduled: ['info', 'Delivery scheduled'],
  notice: ['warning', 'Notice period'],
}

function NoPlan() {
  return (
    <Page tab="room">
      <div className="center-state">
        <div className="circle circle-muted"><House size={28} /></div>
        <h1 className="section-title">No add-ons yet</h1>
        <p>Rent a fridge, desk, chair and more. Everything is billed on your room invoice.</p>
        <a className="btn btn-primary btn-inline" href="#/tenant/catalog" style={{ marginTop: 20 }}>Browse catalog</a>
      </div>
    </Page>
  )
}

// ---------- T5 My Room ----------
export function Room() {
  const s = useSub()
  const [contract, setContract] = useState(false)
  if (!s) return <NoPlan />
  const [tone, label] = STATUS[s.status]
  const pct = Math.min(100, Math.round((s.elapsed / s.term) * 100))
  const canBuy = s.elapsed >= BUYOUT_AFTER_MONTHS
  const nextBill = new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, 1)

  return (
    <Page tab="room">
      <div className="row between">
        <h1 className="page-title">My Room</h1>
        <Badge tone={tone}>{label}</Badge>
      </div>

      <div className="status-card" style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 600 }}>{s.dormName}, Room {s.room}</div>
        <div className="caption">{s.products.map((p) => p.name).join(' + ')}</div>
        <div className="row between caption" style={{ marginTop: 14, marginBottom: 6 }}>
          <span>{s.status === 'scheduled' ? 'Starts on delivery' : s.remaining > 0 ? `Month ${s.elapsed + 1} of ${s.term}` : `Month ${s.elapsed + 1}`}</span>
          <span>{s.remaining > 0 ? `Ends ${fmtDate(s.end)}` : 'Minimum term complete'}</span>
        </div>
        <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Lease progress">
          <div style={{ width: `${pct}%` }} />
        </div>
        <div className="kv">
          <div><small>Monthly add-ons</small><strong className="num">{thb(s.monthly)}</strong></div>
          <div><small>Next bill</small><strong>{fmtDate(nextBill)}</strong></div>
          <div><small>Deposit held</small><strong className="num">{thb(s.deposit)}</strong></div>
          <div><small>Started</small><strong>{fmtDate(s.start)}</strong></div>
        </div>
      </div>

      {s.pending && s.status !== 'notice' && (
        <div style={{ marginTop: 16 }}>
          <Banner tone="info" icon={Truck}>New items arrive {fmtDate(s.pending.wave)}, 10:00–16:00. They're added to your bill from next month.</Banner>
        </div>
      )}

      {s.status === 'notice' && (
        <div style={{ marginTop: 16 }}>
          <Banner tone="warning" icon={Info}>Your exit request is being processed. We'll message you on LINE to confirm the pickup or transfer.</Banner>
        </div>
      )}

      <section className="section" style={{ marginTop: 24 }}>
        <h2 className="section-title" style={{ fontSize: 16 }}>Items in your room</h2>
        <div style={{ marginTop: 4 }}>
          {s.skus.map((i) => (
            <div className="item-row" key={i}>
              <ItemThumb sku={i} />
              <div className="grow"><strong>{SKUS[i].name}</strong><span className="caption">{SKUS[i].warranty}</span></div>
              {s.status === 'scheduled' || s.pending?.skus.includes(i) ? <Badge tone="info">Scheduled</Badge> : <Badge tone="success">Installed</Badge>}
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ marginTop: 24 }}>
        <h2 className="section-title" style={{ fontSize: 16, marginBottom: 4 }}>Manage</h2>
        <div className="acc-list">
          <a className="acc-row" href="#/tenant/room/issue">
            <Wrench size={20} aria-hidden="true" />
            <span className="grow"><span>Report an issue</span><small>Faults are repaired free</small></span>
            <ChevronRight size={18} className="chev" aria-hidden="true" />
          </a>
          {s.status === 'notice' ? (
            <span className="acc-row" aria-disabled="true">
              <LogOut size={20} aria-hidden="true" />
              <span className="grow"><span>Leave early</span><small>Request already sent</small></span>
            </span>
          ) : (
            <a className="acc-row" href="#/tenant/room/exit">
              <LogOut size={20} aria-hidden="true" />
              <span className="grow"><span>{s.remaining > 0 ? 'Leave early' : 'End subscription'}</span><small>{s.remaining > 0 ? 'Transfer, relocate or return' : 'Items stay in the room'}</small></span>
              <ChevronRight size={18} className="chev" aria-hidden="true" />
            </a>
          )}
          {canBuy ? (
            <a className="acc-row" href="#/tenant/room/buyout">
              <Tag size={20} aria-hidden="true" />
              <span className="grow"><span>Buy out items</span><small>Keep them for 25–35% of retail</small></span>
              <ChevronRight size={18} className="chev" aria-hidden="true" />
            </a>
          ) : (
            <span className="acc-row" aria-disabled="true">
              <Tag size={20} aria-hidden="true" />
              <span className="grow"><span>Buy out items</span><small>Available after {BUYOUT_AFTER_MONTHS} months</small></span>
            </span>
          )}
          <button className="acc-row" onClick={() => setContract(true)}>
            <FileText size={20} aria-hidden="true" />
            <span className="grow"><span>Contract</span><small>{s.term}-month rental agreement</small></span>
            <ChevronRight size={18} className="chev" aria-hidden="true" />
          </button>
        </div>
      </section>

      {contract && (
        <Sheet title="Your contract" onClose={() => setContract(false)}>
          <div className="lines">
            <div className="line"><span className="muted">Type</span><span>Rental + maintenance agreement</span></div>
            <div className="line"><span className="muted">Lease</span><span>{s.term} months, from {fmtDate(s.start)}</span></div>
            <div className="line"><span className="muted">Monthly</span><span className="amount">{thb(s.monthly)}</span></div>
            <div className="line"><span className="muted">Deposit</span><span className="amount">{thb(s.deposit)}</span></div>
            <div className="line"><span className="muted">Setup fee</span><span className="amount">{s.term === 12 ? 'Waived' : thb(SETUP_FEE)}</span></div>
          </div>
          <ul style={{ marginTop: 16 }}>
            <li>Not hire-purchase. Items stay owned by {BRAND}.</li>
            <li>{NORMAL_WEAR}</li>
            <li>Give {NOTICE_DAYS} days' notice to leave early.</li>
          </ul>
        </Sheet>
      )}
    </Page>
  )
}

// ---------- T6 Report an issue ----------
const ISSUE_TYPES = [
  { value: 'fault', label: 'Not working', sub: 'Stopped working, makes noise, won\'t turn on' },
  { value: 'damage', label: 'Damaged', sub: 'Broken part, spill, tear, missing accessory' },
  { value: 'wear', label: 'Wear or cosmetic', sub: 'Scratches, worn wheels, flattened foam' },
]

export function Issue() {
  const s = useSub()
  const { showToast } = useStore()
  const [sku, setSku] = useState(s?.skus[0])
  const [type, setType] = useState('fault')
  const [text, setText] = useState('')
  const [sent, setSent] = useState(null)
  if (!s) return <NoPlan />

  if (sent) {
    return (
      <Page tab="room" back="#/tenant/room">
        <div className="center-state">
          <div className="circle circle-success"><CircleCheck size={32} /></div>
          <h1 className="page-title">Issue reported</h1>
          <p>Ticket {sent}. Our team will reply on LINE within 1 business day.</p>
        </div>
        <a className="btn btn-primary" href="#/tenant/room">Back to My Room</a>
      </Page>
    )
  }

  const cost = type === 'damage' ? 'Per fee schedule' : '0 THB'
  const submit = () => {
    const id = `T-${Math.floor(1000 + Math.random() * 9000)}`
    setSent(id)
    showToast(`Ticket ${id} sent`)
  }

  return (
    <Page tab="room" back="#/tenant/room" action={
      <ActionBar label="Your cost" value={cost}>
        <button className="btn btn-primary" onClick={submit}>Send report</button>
      </ActionBar>
    }>
      <h1 className="page-title">Report an issue</h1>

      <h2 style={{ fontSize: 15, fontWeight: 600, margin: '20px 0 10px' }}>Which item?</h2>
      <div className="options" role="radiogroup" aria-label="Item">
        {s.skus.map((i) => (
          <Option key={i} name="sku" value={i} checked={sku === i} onChange={setSku} label={SKUS[i].name} />
        ))}
      </div>

      <h2 style={{ fontSize: 15, fontWeight: 600, margin: '24px 0 10px' }}>What happened?</h2>
      <div className="options" role="radiogroup" aria-label="Issue type">
        {ISSUE_TYPES.map((t) => (
          <Option key={t.value} name="type" value={t.value} checked={type === t.value} onChange={setType} label={t.label} sub={t.sub}>
            {t.value === 'fault' && <p style={{ fontSize: 14 }}>Covered by the manufacturer warranty. You pay nothing.</p>}
            {t.value === 'wear' && <p style={{ fontSize: 14 }}>{NORMAL_WEAR}</p>}
            {t.value === 'damage' && (
              <div>
                <p style={{ fontSize: 14, marginBottom: 10 }}>We'll inspect it. Fixed fees, charged on your next room invoice or from your deposit:</p>
                <div className="lines">
                  {DAMAGE_FEES.map((d) => <div className="line" key={d.label}><span>{d.label}</span><span className="amount">{d.fee ? thb(d.fee) : 'Buyout price'}</span></div>)}
                </div>
              </div>
            )}
          </Option>
        ))}
      </div>

      <label className="field" style={{ marginTop: 24 }}>
        <span>Describe the problem (optional)</span>
        <textarea className="textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. The freezer stopped getting cold yesterday" />
      </label>
    </Page>
  )
}

// ---------- T7 Leave early / end subscription ----------
export function Exit() {
  const s = useSub()
  const { setSubscription, subscription, showToast } = useStore()
  const [path, setPath] = useState('transfer')
  const [detail, setDetail] = useState('')
  const [done, setDone] = useState(false)
  if (!s) return <NoPlan />

  const notice = addDays(TODAY, NOTICE_DAYS)
  const balance = s.monthly * s.remaining
  // OVERVIEW: the lower of one month's fee or 50% of the remaining balance.
  const recalc = Math.min(s.monthly, Math.round(balance / 2))
  const ended = s.remaining === 0

  const fees = {
    transfer: { value: '0 THB', label: 'Fee' },
    relocate: { value: `${RELOCATION_FEE[0]}–${RELOCATION_FEE[1]} THB`, label: 'Flat relocation fee' },
    return: { value: thb(RETRIEVAL_FEE + recalc), label: 'Retrieval + early-exit fee' },
  }

  const submit = () => {
    setSubscription({ ...subscription, status: 'notice' })
    showToast('Request sent')
    setDone(true)
  }

  if (done) {
    return (
      <Page tab="room" back="#/tenant/room">
        <div className="center-state">
          <div className="circle circle-success"><CircleCheck size={32} /></div>
          <h1 className="page-title">Request sent</h1>
          <p>Your notice period ends {fmtDate(notice)}. We'll confirm the next steps on LINE.</p>
        </div>
        <a className="btn btn-primary" href="#/tenant/room">Back to My Room</a>
      </Page>
    )
  }

  if (ended) {
    return (
      <Page tab="room" back="#/tenant/room" action={
        <ActionBar label="Early-exit fee" value="0 THB">
          <button className="btn btn-primary" onClick={submit}>End subscription</button>
        </ActionBar>
      }>
        <h1 className="page-title">End subscription</h1>
        <div className="stack" style={{ marginTop: 16 }}>
          <Banner tone="success" icon={CircleCheck}>Your minimum term is complete, so there's no early-exit fee.</Banner>
          <ol className="steps-list">
            <li>Your dorm checks the items when you move out.</li>
            <li>The items stay in the room for the next tenant.</li>
            <li>Your {thb(s.deposit)} deposit is refunded within 3–5 business days, minus any damage fees.</li>
          </ol>
          <a className="link" href="#/tenant/room/buyout">Want to keep the items? Buy them out instead.</a>
        </div>
      </Page>
    )
  }

  return (
    <Page tab="room" back="#/tenant/room" action={
      <ActionBar label={fees[path].label} value={fees[path].value}>
        <button className="btn btn-primary" onClick={submit} disabled={path !== 'return' && !detail.trim()}>Send request</button>
      </ActionBar>
    }>
      <h1 className="page-title">Leave early</h1>
      <p className="caption" style={{ marginTop: 4 }}>
        {s.remaining} of {s.term} months left. With {NOTICE_DAYS} days' notice, your last day is {fmtDate(notice)}.
      </p>

      <div className="options" role="radiogroup" aria-label="Exit option" style={{ marginTop: 20 }}>
        <Option name="path" value="transfer" checked={path === 'transfer'} onChange={setPath}
          label="Transfer to someone else" sub="Next tenant of your room, or a friend in the building" price="Free">
          <label className="field">
            <span>Who's taking over?</span>
            <input className="input" value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Name and room number" />
          </label>
        </Option>
        <Option name="path" value="relocate" checked={path === 'relocate'} onChange={setPath}
          label="Move items to my new place" sub="Within Rangsit / Pathum Thani" price={`${RELOCATION_FEE[0]}–${RELOCATION_FEE[1]} THB`}>
          <label className="field">
            <span>New address</span>
            <input className="input" value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Dorm or condo name, room" />
          </label>
          <p className="caption" style={{ marginTop: 8 }}>Your subscription continues. The exact fee depends on distance.</p>
        </Option>
        <Option name="path" value="return" checked={path === 'return'} onChange={setPath}
          label="Return and cancel" sub="We pick up the items" price={thb(RETRIEVAL_FEE + recalc)}>
          <div className="lines">
            <div className="line"><span>Retrieval fee</span><span className="amount">{thb(RETRIEVAL_FEE)}</span></div>
            <div className="line"><span>Early-exit fee</span><span className="amount">{thb(recalc)}</span></div>
            <div className="line total"><span>Total</span><span className="amount">{thb(RETRIEVAL_FEE + recalc)}</span></div>
          </div>
          <p className="caption" style={{ marginTop: 8 }}>
            The early-exit fee is the lower of one month's fee ({thb(s.monthly)}) or half of the remaining balance ({thb(Math.round(balance / 2))}). It is taken from your {thb(s.deposit)} deposit.
          </p>
        </Option>
      </div>

      {path !== 'return' && !detail.trim() && (
        <p className="caption" style={{ marginTop: 12 }}>
          {path === 'transfer' ? 'Add who is taking over to send your request.' : 'Add your new address to send your request.'}
        </p>
      )}

      <div style={{ marginTop: 16 }}>
        <Banner tone="info" icon={path === 'transfer' ? Users : path === 'relocate' ? Truck : Undo2}>
          {path === 'transfer' && 'Transfers are free. The contract simply moves to the new tenant.'}
          {path === 'relocate' && 'We move your items on the next wave day after your notice period.'}
          {path === 'return' && 'We inspect the items at pickup. Your deposit balance is refunded within 3–5 business days.'}
        </Banner>
      </div>
    </Page>
  )
}

// ---------- T8 Buyout ----------
export function Buyout() {
  const s = useSub()
  const { showToast } = useStore()
  const [picked, setPicked] = useState(() => new Set(s?.skus ?? []))
  const [done, setDone] = useState(false)
  if (!s) return <NoPlan />

  if (s.elapsed < BUYOUT_AFTER_MONTHS) {
    return (
      <Page tab="room" back="#/tenant/room">
        <div className="center-state">
          <div className="circle circle-muted"><Tag size={28} /></div>
          <h1 className="section-title">Buyout opens at month {BUYOUT_AFTER_MONTHS}</h1>
          <p>You're in month {s.elapsed + 1}. After {BUYOUT_AFTER_MONTHS} months you can keep your items for 25–35% of retail.</p>
          <a className="btn btn-secondary btn-inline" href="#/tenant/room" style={{ marginTop: 20 }}>Back to My Room</a>
        </div>
      </Page>
    )
  }

  // Estimate at the middle of the 25–35% range; final price depends on condition.
  const rate = (BUYOUT_RATE[0] + BUYOUT_RATE[1]) / 2
  const price = (i) => Math.round((SKUS[i].retail * rate) / 10) * 10
  const total = [...picked].reduce((t, i) => t + price(i), 0)
  const toggle = (i) => setPicked((p) => { const n = new Set(p); if (n.has(i)) n.delete(i); else n.add(i); return n })

  if (done) {
    return (
      <Page tab="room" back="#/tenant/room">
        <div className="center-state">
          <div className="circle circle-success"><CircleCheck size={32} /></div>
          <h1 className="page-title">Buyout requested</h1>
          <p>We'll inspect the items and confirm the final price on LINE. The items stay where they are.</p>
        </div>
        <a className="btn btn-primary" href="#/tenant/room">Back to My Room</a>
      </Page>
    )
  }

  return (
    <Page tab="room" back="#/tenant/room" action={
      <ActionBar label={`${picked.size} items · estimate`} value={thb(total)}>
        <button className="btn btn-primary" disabled={!picked.size} onClick={() => { setDone(true); showToast('Buyout requested') }}>Request buyout</button>
      </ActionBar>
    }>
      <h1 className="page-title">Buy out items</h1>
      <p className="caption" style={{ marginTop: 4 }}>Keep your items after you move out. No pickup, no moving.</p>
      <div className="card" style={{ marginTop: 20, paddingTop: 4, paddingBottom: 4 }}>
        {s.skus.map((i) => (
          <label className="item-row check" key={i} style={{ alignItems: 'center' }}>
            <input type="checkbox" checked={picked.has(i)} onChange={() => toggle(i)} />
            <ItemThumb sku={i} />
            <span className="grow"><strong>{SKUS[i].name}</strong><span className="caption">Retail {thb(SKUS[i].retail)}</span></span>
            <span className="price num">{thb(price(i))}</span>
          </label>
        ))}
      </div>
      <p className="caption" style={{ marginTop: 12 }}>Estimates use 30% of retail. The final price is 25–35% depending on condition.</p>
    </Page>
  )
}

// ---------- T9 Bills ----------
export function Bills() {
  const { subscription } = useStore()
  const bills = billsFor(subscription)
  const [open, setOpen] = useState(bills[0].id)
  return (
    <Page tab="bills">
      <h1 className="page-title">Bills</h1>
      <p className="caption" style={{ marginTop: 4 }}>Your {BRAND} add-ons are billed on your monthly room invoice.</p>
      <div className="stack-sm" style={{ marginTop: 20 }}>
        {bills.map((b) => {
          const total = b.lines.reduce((s, l) => s + l.amount, 0)
          const isOpen = open === b.id
          return (
            <div className="card" key={b.id} style={{ padding: 0 }}>
              <button className="acc-row" style={{ padding: '12px 16px', borderBottom: isOpen ? '1px solid var(--border)' : 0 }}
                aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : b.id)}>
                <span className="grow">
                  <span>{b.date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
                  <small className="num">{thb(total)}</small>
                </span>
                <Badge tone={b.paid ? 'success' : 'warning'}>{b.paid ? 'Paid' : `Due ${fmtDate(b.due)}`}</Badge>
                <ChevronRight size={18} className="chev" aria-hidden="true" style={{ transform: isOpen ? 'rotate(90deg)' : 'none' }} />
              </button>
              {isOpen && (
                <div className="lines" style={{ padding: 16 }}>
                  {b.lines.map((l) => (
                    <div className={`line ${l.addon ? 'hl' : ''}`} key={l.label}><span>{l.label}</span><span className="amount">{thb(l.amount)}</span></div>
                  ))}
                  <div className="line total"><span>Total</span><span className="amount">{thb(total)}</span></div>
                  <p className="caption">Pay at your dorm office, as usual.</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Page>
  )
}

// ---------- Help (+ demo controls) ----------
export function Help() {
  const { scenario, setScenario, clearCart, showToast } = useStore()
  return (
    <Page tab="help">
      <h1 className="page-title">Help</h1>
      <div className="card row" style={{ marginTop: 20 }}>
        <MessageCircle size={24} color="var(--primary)" aria-hidden="true" />
        <div className="grow" style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>Chat with us on LINE</div>
          <div className="caption">@{BRAND} · replies within 1 business day</div>
        </div>
      </div>

      <section className="section" style={{ marginTop: 24 }}>
        <h2 className="section-title" style={{ fontSize: 16 }}>Damage fees</h2>
        <p className="caption" style={{ margin: '4px 0 12px' }}>{NORMAL_WEAR}</p>
        <div className="card lines">
          {DAMAGE_FEES.map((d) => <div className="line" key={d.label}><span>{d.label}</span><span className="amount">{d.fee ? thb(d.fee) : 'Buyout price'}</span></div>)}
        </div>
      </section>

      <section className="section" style={{ marginTop: 24 }}>
        <h2 className="section-title" style={{ fontSize: 16 }}>Demo scenario</h2>
        <p className="caption" style={{ margin: '4px 0 12px' }}>Prototype only. Switch the tenant's situation.</p>
        <div className="options" role="radiogroup" aria-label="Demo scenario">
          {Object.entries(SCENARIOS).map(([k, v]) => (
            <Option key={k} name="scenario" value={k} checked={scenario === k}
              onChange={(key) => { setScenario(key); clearCart(); showToast(`Scenario: ${SCENARIOS[key].label}`) }}
              label={v.label} />
          ))}
        </div>
        <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => go('/')}>
          <ArrowRightLeft size={18} /> Switch role
        </button>
      </section>
    </Page>
  )
}
