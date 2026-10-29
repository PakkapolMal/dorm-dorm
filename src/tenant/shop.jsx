import { useState } from 'react'
import { Plus, Check, ChevronRight, KeyRound, TriangleAlert, Info, Truck, ShieldCheck, Wrench, CircleCheck, Trash2, ShoppingCart, Calendar } from 'lucide-react'
import {
  SKUS, BUNDLES, getProduct, bundleSaving, thb, ADDON_CAP, SETUP_FEE, BASE_RENT, CONDO_FLOOR,
  PARTNER_DORMS, depositFor, nextWaves, fmtDay, fmtDate, DAMAGE_FEES, NORMAL_WEAR, TAKEOVER_ROOM, BRAND, TODAY, thbMo,
} from '../data.js'
import { useStore, go } from '../store.jsx'
import { Page, ActionBar } from './Shell.jsx'
import { ProductTile, Badge, Banner, Benefits, Option, Sheet, Stepper, ItemThumb } from '../ui.jsx'

const BENEFITS = ['Free delivery and setup on wave days', 'Maintenance and repairs included', 'Manufacturer warranty covered']

function useQuickAdd() {
  const { addToCart, showToast } = useStore()
  return (id) => {
    const err = addToCart(id)
    showToast(err ?? `${getProduct(id).name} added to cart`, err ? 'error' : 'success')
  }
}

function QuickAdd({ id }) {
  const { cart } = useStore()
  const add = useQuickAdd()
  const inCart = cart.ids.includes(id)
  const name = getProduct(id).name
  return (
    <button
      className="quick-add" aria-pressed={inCart}
      aria-label={inCart ? `${name} is in your cart` : `Add ${name} to cart`}
      onClick={(e) => { e.preventDefault(); if (!inCart) add(id) }}
    >
      {inCart ? <Check size={18} /> : <Plus size={18} />}
    </button>
  )
}

function BundleCard({ id }) {
  const b = getProduct(id)
  return (
    <a className="card-link bundle-card" href={`#/tenant/item/${id}`}>
      <ProductTile product={b} size={26} />
      <div className="info">
        <Badge tone="accent">{b.badge}</Badge>
        <div className="product-name" style={{ minHeight: 0, marginTop: 6, fontWeight: 600 }}>{b.name}</div>
        <div className="caption">{b.items.map((i) => SKUS[i].short).join(' + ')}</div>
        <div className="product-price price">{thbMo(b.price)}</div>
        <div className="product-sub save">Save {bundleSaving(b)} THB/mo</div>
      </div>
      <QuickAdd id={id} />
    </a>
  )
}

function SkuCard({ id }) {
  const p = getProduct(id)
  const bundle = Object.values(BUNDLES).find((b) => b.items.includes(id) && b.items.length === 2)
  return (
    <a className="card-link" href={`#/tenant/item/${id}`}>
      <ProductTile product={p} size={48}><QuickAdd id={id} /></ProductTile>
      <div className="product-name">{p.name}</div>
      <div className="product-price price">{thbMo(p.price)}</div>
      {bundle && <div className="product-sub">or bundle &amp; save {bundleSaving(bundle)}</div>}
    </a>
  )
}

// ---------- Home (Landing pitch) ----------
export function Home() {
  const complete = BUNDLES['complete-living'].price
  return (
    <Page tab="shop" flush>
      <section className="hero">
        <div className="hero-art" aria-hidden="true">
          <div className="icons">
            {Object.values(SKUS).map(({ icon: Icon, name }) => <Icon key={name} size={44} strokeWidth={1.5} />)}
            <Plus size={44} strokeWidth={1.5} />
          </div>
        </div>
        <div className="hero-copy">
          <h1>Condo comfort, dorm price.</h1>
          <p>Rent a fridge, desk, chair and more for your dorm room. Free setup, repairs included.</p>
          <a className="btn btn-primary" href="#/tenant/catalog">Start shopping</a>
        </div>
      </section>

      <div style={{ padding: '0 16px' }}>
        <section className="section">
          <h2 className="section-title">Shop bundles</h2>
          <div className="scroller">
            {Object.keys(BUNDLES).map((id) => {
              const b = getProduct(id)
              return (
                <a key={id} className="card-link" href={`#/tenant/item/${id}`}>
                  <ProductTile product={b} size={30}>
                    <span className="tile-badge"><Badge tone="accent">{b.badge}</Badge></span>
                  </ProductTile>
                  <div className="product-name" style={{ minHeight: 0 }}>{b.name}</div>
                  <div className="product-price price">{thbMo(b.price)}</div>
                </a>
              )
            })}
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Dorm + add-ons vs. a condo</h2>
          <div className="compare" style={{ marginTop: 12 }}>
            <div className="compare-row"><span>Dorm room</span><span className="num">{thb(BASE_RENT)}</span></div>
            <div className="compare-row"><span>+ Complete Living bundle</span><span className="num">{thb(complete)}</span></div>
            <div className="compare-row"><strong>Your total</strong><strong className="num">{thbMo(BASE_RENT + complete)}</strong></div>
            <div className="compare-row"><span className="muted">Cheapest nearby condo</span><span className="num muted">{CONDO_FLOOR.toLocaleString('en-US')}+ THB/mo</span></div>
            <p className="save" style={{ marginTop: 8, fontSize: 14 }}>
              You save {thbMo(CONDO_FLOOR - BASE_RENT - complete)}, and skip the 22,500+ THB condo deposit.
            </p>
          </div>
        </section>

        <section className="section" style={{ marginBottom: 8 }}>
          <a className="takeover-link" href="#/tenant/takeover">
            <KeyRound size={20} aria-hidden="true" />
            <span><strong>Moved into a pre-upgraded room?</strong>Take over the add-ons already there. No setup fee.</span>
            <ChevronRight size={18} aria-hidden="true" />
          </a>
        </section>
      </div>
    </Page>
  )
}

// ---------- T1 Catalog ----------
const FILTERS = [['all', 'All'], ['bundles', 'Bundles'], ['kitchen', 'Kitchen'], ['study', 'Study'], ['air', 'Air']]

export function Catalog() {
  const [filter, setFilter] = useState('all')
  const { cartItems, cartTotal, subscription } = useStore()
  const combined = cartTotal + (subscription ? subscription.productIds.reduce((s, id) => s + getProduct(id).price, 0) : 0)
  const showBundle = (b) => filter === 'all' || filter === 'bundles' || b.category === filter
  const skus = Object.keys(SKUS).filter((id) => filter === 'all' || SKUS[id].category === filter)
  const bundles = Object.keys(BUNDLES).filter((id) => showBundle(BUNDLES[id]))
  return (
    <Page tab="shop" back="#/tenant" action={cartItems.length > 0 && (
      <ActionBar label={`${cartItems.length} in cart · monthly`} value={thbMo(cartTotal)}>
        <a className="btn btn-primary" href="#/tenant/cart">View cart</a>
      </ActionBar>
    )}>
      <div className="crumbs"><a href="#/tenant">Home</a> / Catalog</div>
      <h1 className="page-title">Add-ons for your room</h1>
      <div className="chips" role="group" aria-label="Filter">
        {FILTERS.map(([k, l]) => (
          <button key={k} className="chip" aria-pressed={filter === k} onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>

      {combined > ADDON_CAP && (
        <div style={{ marginTop: 16 }}>
          <Banner tone="danger" icon={TriangleAlert}>
            Your add-ons total {thbMo(combined)}, which is over {thb(ADDON_CAP)}. At that price a serviced apartment may be cheaper.
          </Banner>
        </div>
      )}

      {bundles.length > 0 && (
        <section className="section" style={{ marginTop: 20 }}>
          <h2 className="section-title">Bundles</h2>
          <div className="stack-sm" style={{ marginTop: 12 }}>
            {bundles.map((id) => <BundleCard key={id} id={id} />)}
          </div>
        </section>
      )}

      {skus.length > 0 && filter !== 'bundles' && (
        <section className="section" style={{ marginTop: 24 }}>
          <h2 className="section-title">Single items</h2>
          <div className="grid-2" style={{ marginTop: 12 }}>
            {skus.map((id) => <SkuCard key={id} id={id} />)}
          </div>
        </section>
      )}
    </Page>
  )
}

// ---------- T2 Item / Bundle detail ----------
export function Item({ id }) {
  const p = getProduct(id)
  const { cart, setTerm, addToCart, showToast } = useStore()
  const [tab, setTab] = useState('details')
  const containing = p?.kind === 'sku' ? Object.keys(BUNDLES).filter((b) => BUNDLES[b].items.includes(id)) : []
  const [choice, setChoice] = useState(id)
  if (!p) return <NotFound />

  const separate = p.kind === 'bundle' ? p.items.reduce((s, i) => s + SKUS[i].price, 0) : 0
  const chosenPrice = choice === 'separate' ? separate : getProduct(choice).price

  const add = () => {
    const ids = choice === 'separate' ? p.items : [choice]
    let err = null
    for (const x of ids) err = addToCart(x) ?? err
    showToast(err ?? 'Added to cart', err ? 'error' : 'success')
  }

  const termSelect = (
    <label className="field" style={{ marginTop: 14 }}>
      <span>Rental length</span>
      <select className="select" value={cart.term} onChange={(e) => setTerm(Number(e.target.value))}>
        <option value={6}>6 months (setup fee {SETUP_FEE} THB)</option>
        <option value={12}>12 months (setup fee waived)</option>
      </select>
    </label>
  )

  return (
    <Page tab="shop" back="#/tenant/catalog" action={
      <ActionBar label="Monthly" value={thbMo(chosenPrice)}>
        <button className="btn btn-primary" onClick={add}>Add to cart</button>
      </ActionBar>
    }>
      <div className="crumbs"><a href="#/tenant">Home</a> / <a href="#/tenant/catalog">Catalog</a> / {p.name}</div>
      <ProductTile product={p} className="detail-tile" size={72}>
        {p.badge && <span className="tile-badge" style={{ left: 16, bottom: 16 }}><Badge tone="accent">{p.badge}</Badge></span>}
      </ProductTile>
      {p.kind === 'bundle' && (
        <div className="thumbs" aria-hidden="true">
          {p.items.map((i, n) => <div key={i} className={`thumb ${n === 0 ? 'on' : ''}`}><ItemThumb sku={i} /></div>)}
        </div>
      )}

      <h1 className="page-title" style={{ marginTop: 16 }}>{p.name}</h1>
      <p className="caption" style={{ marginTop: 4 }}>{p.kind === 'bundle' ? p.tagline : p.spec}</p>

      <h2 style={{ fontSize: 15, fontWeight: 600, margin: '20px 0 10px' }}>Choose your plan</h2>
      <div className="options" role="radiogroup" aria-label="Plan">
        <Option name="plan" value={id} checked={choice === id} onChange={setChoice}
          label={p.kind === 'bundle' ? `Rent the ${p.name} bundle` : 'Rent this item'}
          sub={p.kind === 'bundle' ? `Save ${bundleSaving(p)} THB/mo vs. separate` : undefined}
          price={thbMo(p.price)}>
          <Benefits items={BENEFITS} />
          {termSelect}
        </Option>
        {containing.map((b) => (
          <Option key={b} name="plan" value={b} checked={choice === b} onChange={setChoice}
            label={`Get it in ${BUNDLES[b].name}`}
            sub={`${BUNDLES[b].items.map((i) => SKUS[i].short).join(' + ')} · save ${bundleSaving(BUNDLES[b])} THB/mo`}
            price={thbMo(BUNDLES[b].price)}>
            <Benefits items={BENEFITS} />
            {termSelect}
          </Option>
        ))}
        {p.kind === 'bundle' && (
          <Option name="plan" value="separate" checked={choice === 'separate'} onChange={setChoice}
            label="Rent items separately" sub="No bundle discount" price={thbMo(separate)}>
            {termSelect}
          </Option>
        )}
      </div>

      <div className="tabs" role="tablist" style={{ marginTop: 28 }}>
        <button role="tab" aria-selected={tab === 'details'} onClick={() => setTab('details')}>Details</button>
        <button role="tab" aria-selected={tab === 'included'} onClick={() => setTab('included')}>What's included</button>
      </div>
      <div className="tab-panel" role="tabpanel">
        {tab === 'details' ? (
          p.kind === 'bundle' ? (
            <div>{p.items.map((i) => (
              <div className="item-row" key={i}>
                <ItemThumb sku={i} />
                <div className="grow"><strong>{SKUS[i].name}</strong><span className="caption">{SKUS[i].spec}</span></div>
                <span className="num muted">{thbMo(SKUS[i].price)}</span>
              </div>
            ))}</div>
          ) : (
            <dl className="spec-list">
              <dt>Spec</dt><dd>{p.spec}</dd>
              <dt>Example models</dt><dd>{p.models}</dd>
              <dt>Warranty</dt><dd>{p.warranty}</dd>
            </dl>
          )
        ) : (
          <ul className="benefits">
            <li><Truck size={16} />Free delivery and setup on Wed / Sat wave days</li>
            <li><Wrench size={16} />Repairs for faults are free. Normal wear is never charged.</li>
            <li><ShieldCheck size={16} />Refundable deposit of about 1 month, returned 3–5 business days after pickup</li>
            <li><Info size={16} />Minimum 6 months. Leaving early? Transfer to the next tenant for free.</li>
          </ul>
        )}
      </div>
    </Page>
  )
}

// ---------- Cart ----------
export function Cart() {
  const { cartItems, cartTotal, removeFromCart, subscription } = useStore()
  const existing = subscription ? subscription.productIds.reduce((s, id) => s + getProduct(id).price, 0) : 0
  const combined = existing + cartTotal
  const over = combined > ADDON_CAP

  if (!cartItems.length) {
    return (
      <Page tab="shop" back="#/tenant/catalog">
        <div className="center-state">
          <div className="circle circle-muted"><ShoppingCart size={28} /></div>
          <h1 className="section-title">Your cart is empty</h1>
          <p>Pick a bundle or single item to upgrade your room.</p>
          <a className="btn btn-primary btn-inline" href="#/tenant/catalog" style={{ marginTop: 20 }}>Browse catalog</a>
        </div>
      </Page>
    )
  }

  return (
    <Page tab="shop" back="#/tenant/catalog" action={
      <ActionBar label="Monthly add-ons" value={thbMo(cartTotal)}>
        <button className="btn btn-primary" disabled={over} onClick={() => go('/tenant/checkout')}>Checkout</button>
      </ActionBar>
    }>
      <h1 className="page-title">Cart</h1>
      <div style={{ marginTop: 12 }}>
        {cartItems.map((p) => (
          <div className="item-row" key={p.id}>
            <ItemThumb product={p} />
            <div className="grow">
              <strong>{p.name}</strong>
              <span className="caption">{p.kind === 'bundle' ? p.items.map((i) => SKUS[i].short).join(' + ') : p.spec}</span>
            </div>
            <span className="price num" style={{ fontSize: 14, textAlign: 'right' }}>{thbMo(p.price)}</span>
            <button className="icon-btn" onClick={() => removeFromCart(p.id)} aria-label={`Remove ${p.name}`}><Trash2 size={18} /></button>
          </div>
        ))}
      </div>

      <div className="card card-muted" style={{ marginTop: 16 }}>
        <div className="lines">
          {existing > 0 && <div className="line"><span>Current plan</span><span className="amount">{thbMo(existing)}</span></div>}
          <div className="line"><span>This order</span><span className="amount">{thbMo(cartTotal)}</span></div>
          <div className="line total"><span>Total add-ons</span><span className="amount">{thbMo(combined)}</span></div>
        </div>
        <p className="caption" style={{ marginTop: 8 }}>Limit {thbMo(ADDON_CAP)} per room</p>
      </div>

      <div style={{ marginTop: 16 }}>
        {over ? (
          <Banner tone="danger" icon={TriangleAlert}>
            Over the {thbMo(ADDON_CAP)} limit. At this price a serviced apartment may be cheaper. Remove an item to continue.
          </Banner>
        ) : combined > ADDON_CAP - 300 ? (
          <Banner tone="warning" icon={Info}>You're close to the {thbMo(ADDON_CAP)} limit.</Banner>
        ) : null}
      </div>
    </Page>
  )
}

// ---------- T3 Checkout ----------
const STEPS = ['Room', 'Delivery', 'Review']

export function Checkout() {
  const store = useStore()
  const { cartItems, cartTotal, cart, setTerm, subscription } = store
  const adding = !!subscription
  const [step, setStep] = useState(0)
  const [dorm, setDorm] = useState(subscription?.dorm ?? '')
  const [room, setRoom] = useState(subscription?.room ?? '')
  const waves = nextWaves()
  const [wave, setWave] = useState(waves[0].toISOString())
  const [agree, setAgree] = useState(false)
  const [policy, setPolicy] = useState(false)
  const [touched, setTouched] = useState(false)

  if (!cartItems.length) return <Cart />

  const term = adding ? subscription.term : cart.term
  // Setup fee is one-time: waived on 12-month leases and when adding to an existing plan.
  const setup = term === 12 || adding ? 0 : SETUP_FEE
  // Adding to a plan only tops the deposit up to the new total's deposit.
  const existing = adding ? subscription.productIds.reduce((s, id) => s + getProduct(id).price, 0) : 0
  const deposit = adding ? depositFor(existing + cartTotal) - depositFor(existing) : depositFor(cartTotal)
  const dueNow = deposit + setup
  const roomOk = dorm && room.trim()

  const next = () => {
    if (step === 0 && !roomOk) {
      setTouched(true)
      document.querySelector(dorm ? '.content .input' : '.content .select')?.focus()
      return
    }
    if (step < 2) { setStep(step + 1); window.scrollTo(0, 0); return }
    const order = { productIds: cart.ids, dorm, room: room.trim(), term, wave, setup, deposit, monthly: cartTotal }
    const newSkus = cartItems.flatMap((p) => p.items)
    store.setSubscription(adding
      ? { ...subscription, productIds: [...subscription.productIds, ...cart.ids], pending: { skus: [...(subscription.pending?.skus ?? []), ...newSkus], wave } }
      : { productIds: cart.ids, dorm, room: room.trim(), term, start: new Date(wave), status: 'scheduled' })
    store.setLastOrder(order)
    store.clearCart()
    go('/tenant/confirmed')
  }

  const cta = step === 2 ? 'Place order' : 'Continue'
  return (
    <Page tab="shop" back={step === 0 ? '#/tenant/cart' : undefined} action={
      <ActionBar label={step === 2 ? 'Due now' : 'Monthly add-ons'} value={step === 2 ? thb(dueNow) : thbMo(cartTotal)}>
        {step > 0 && <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>Back</button>}
        <button className="btn btn-primary" onClick={next} disabled={step === 2 && !agree}>{cta}</button>
      </ActionBar>
    }>
      <h1 className="page-title">Checkout</h1>
      <div style={{ marginTop: 16 }}><Stepper steps={STEPS} current={step} /></div>

      {step === 0 && (
        <div className="stack">
          {adding && (
            <Banner tone="info" icon={Info}>
              These items will be added to your current plan in Room {subscription.room}. They follow your current {subscription.term}-month lease.
            </Banner>
          )}
          <label className="field">
            <span>Partner dorm</span>
            <select className="select" value={dorm} onChange={(e) => setDorm(e.target.value)} disabled={adding}
              aria-invalid={touched && !dorm}>
              <option value="">Select your dorm</option>
              {PARTNER_DORMS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Room number</span>
            <input className="input" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="e.g. 304" disabled={adding}
              inputMode="numeric" aria-invalid={touched && !room.trim()} />
          </label>
          {touched && !roomOk && <Banner tone="danger" icon={TriangleAlert}>Choose your dorm and enter your room number.</Banner>}
          {!adding && (
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Lease length</h2>
              <div className="options" role="radiogroup" aria-label="Lease length">
                <Option name="term" value={6} checked={term === 6} onChange={setTerm} label="6 months" sub={`Setup fee ${SETUP_FEE} THB`} />
                <Option name="term" value={12} checked={term === 12} onChange={setTerm} label="12 months" sub="Setup fee waived" />
              </div>
            </div>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="stack">
          <p className="muted" style={{ fontSize: 14 }}>Free delivery runs on Wednesdays and Saturdays. We install everything in your room.</p>
          <div className="options" role="radiogroup" aria-label="Delivery date">
            {waves.map((w) => (
              <Option key={w.toISOString()} name="wave" value={w.toISOString()} checked={wave === w.toISOString()} onChange={setWave}
                label={fmtDay(w)} sub="Delivery window 10:00–16:00" />
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="stack">
          <div className="card">
            <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Your order</h2>
            <div className="lines">
              {cartItems.map((p) => <div className="line" key={p.id}><span>{p.name}</span><span className="amount">{thbMo(p.price)}</span></div>)}
              <div className="line total"><span>Monthly add-ons</span><span className="amount">{thbMo(cartTotal)}</span></div>
            </div>
            <p className="caption" style={{ marginTop: 8 }}>Billed on your monthly room invoice from {PARTNER_DORMS.find((d) => d.id === dorm)?.name}.</p>
          </div>
          <div className="card">
            <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Due now</h2>
            <div className="lines">
              <div className="line"><span>Refundable deposit{adding && ' top-up'}</span><span className="amount">{thb(deposit)}</span></div>
              <div className="line">
                <span>Setup fee {setup === 0 && <Badge tone="success">Waived</Badge>}</span>
                <span className="amount">{setup === 0 ? <><span className="strike">{thb(SETUP_FEE)}</span>0 THB</> : thb(setup)}</span>
              </div>
              <div className="line total"><span>Total due now</span><span className="amount">{thb(dueNow)}</span></div>
            </div>
          </div>
          <div className="card card-muted lines" style={{ fontSize: 14 }}>
            <div className="line"><span className="muted">Room</span><span>{PARTNER_DORMS.find((d) => d.id === dorm)?.name}, Room {room}</span></div>
            <div className="line"><span className="muted">Delivery</span><span>{fmtDay(wave)}</span></div>
            <div className="line"><span className="muted">Lease</span><span>{term} months</span></div>
          </div>
          <label className="check">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span>I agree to the rental agreement and <button type="button" className="link" onClick={() => setPolicy(true)}>damage policy</button>.</span>
          </label>
        </div>
      )}

      {policy && (
        <Sheet title="Rental agreement and damage policy" onClose={() => setPolicy(false)}>
          <p style={{ fontSize: 14 }}>This is a rental and maintenance agreement, not hire-purchase. Items stay owned by {BRAND}.</p>
          <ul>
            <li>Minimum lease 6 months. Refundable deposit returned 3–5 business days after pickup.</li>
            <li>{NORMAL_WEAR}</li>
            <li>Faults not caused by misuse are repaired free under warranty.</li>
            <li>Moving items out of the room without telling us voids the warranty.</li>
          </ul>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: '16px 0 8px' }}>Damage fees</h3>
          <div className="lines">
            {DAMAGE_FEES.map((d) => <div className="line" key={d.label}><span>{d.label}</span><span className="amount">{d.fee ? thb(d.fee) : <span className="muted" style={{ textAlign: 'right' }}>{d.note}</span>}</span></div>)}
          </div>
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => { setAgree(true); setPolicy(false) }}>I agree</button>
        </Sheet>
      )}
    </Page>
  )
}

// ---------- T4 Confirmation ----------
export function Confirmed() {
  const { lastOrder } = useStore()
  if (!lastOrder) { go('/tenant'); return null }
  const dorm = PARTNER_DORMS.find((d) => d.id === lastOrder.dorm)
  return (
    <Page tab="shop">
      <div className="center-state" style={{ paddingTop: 32 }}>
        <div className="circle circle-success"><CircleCheck size={32} /></div>
        <h1 className="page-title">Order placed</h1>
        <p>We'll deliver and set up everything in {dorm?.name}, Room {lastOrder.room}.</p>
      </div>
      <div className="status-card row" style={{ gap: 14 }}>
        <Calendar size={24} color="var(--primary)" aria-hidden="true" />
        <div>
          <div className="caption">Delivery day</div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{fmtDay(lastOrder.wave)}</div>
          <div className="caption">10:00–16:00</div>
        </div>
      </div>
      <section className="section" style={{ marginTop: 24 }}>
        <h2 className="section-title" style={{ fontSize: 16 }}>What happens next</h2>
        <ol className="steps-list" style={{ marginTop: 10 }}>
          <li>Pay the {thb(lastOrder.deposit + lastOrder.setup)} due now to your dorm office.</li>
          <li>We'll message you on LINE the day before delivery.</li>
          <li>From next month, {thbMo(lastOrder.monthly)} appears on your room invoice.</li>
        </ol>
      </section>
      <a className="btn btn-primary" href="#/tenant/room" style={{ marginTop: 28 }}>Go to My Room</a>
    </Page>
  )
}

// ---------- T10 Room takeover ----------
export function Takeover() {
  const { setSubscription, setLastOrder, showToast } = useStore()
  const t = TAKEOVER_ROOM
  const dorm = PARTNER_DORMS.find((d) => d.id === t.dorm)
  const items = t.productIds.map(getProduct)
  const monthly = items.reduce((s, p) => s + p.price, 0)
  const { subscription } = useStore()
  const [term, setTermLocal] = useState(6)
  const deposit = depositFor(monthly)

  const accept = () => {
    const start = TODAY
    setSubscription({ productIds: t.productIds, dorm: t.dorm, room: t.room, term, start, status: 'active' })
    setLastOrder(null)
    showToast('Subscription taken over')
    go('/tenant/room')
  }

  return (
    <Page tab="shop" back="#/tenant" action={
      <ActionBar label="Due now (deposit only)" value={thb(deposit)}>
        <button className="btn btn-primary" onClick={accept}>Take over</button>
      </ActionBar>
    }>
      <Badge tone="info">Pre-upgraded room</Badge>
      <h1 className="page-title" style={{ marginTop: 10 }}>{dorm.name}, Room {t.room}</h1>
      <p className="caption" style={{ marginTop: 4 }}>{t.note}</p>
      {subscription && (
        <div style={{ marginTop: 16 }}>
          <Banner tone="warning" icon={TriangleAlert}>
            You already have a plan in Room {subscription.room}. Taking over this room replaces it. End your current plan first if you're moving out.
          </Banner>
        </div>
      )}

      <div className="card" style={{ marginTop: 20 }}>
        {items.flatMap((p) => p.items).map((i) => (
          <div className="item-row" key={i}>
            <ItemThumb sku={i} />
            <div className="grow"><strong>{SKUS[i].name}</strong><span className="caption">Installed · inspected</span></div>
            <Badge tone="success">In room</Badge>
          </div>
        ))}
      </div>

      <div className="card card-muted" style={{ marginTop: 16 }}>
        <div className="lines">
          <div className="line"><span>{items.map((p) => p.name).join(', ')}</span><span className="amount">{thbMo(monthly)}</span></div>
          <div className="line"><span>Refundable deposit</span><span className="amount">{thb(deposit)}</span></div>
          <div className="line">
            <span>Setup fee <Badge tone="success">Waived</Badge></span>
            <span className="amount"><span className="strike">{thb(SETUP_FEE)}</span>0 THB</span>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: 15, fontWeight: 600, margin: '20px 0 10px' }}>Lease length</h2>
      <div className="options" role="radiogroup" aria-label="Lease length">
        <Option name="tterm" value={6} checked={term === 6} onChange={setTermLocal} label="6 months" />
        <Option name="tterm" value={12} checked={term === 12} onChange={setTermLocal} label="12 months" />
      </div>
      <p className="caption" style={{ marginTop: 12 }}>Items stay in the room. No delivery needed. Starts {fmtDate(TODAY)}.</p>
    </Page>
  )
}

export function NotFound() {
  return (
    <Page tab="shop" back="#/tenant">
      <div className="center-state">
        <h1 className="section-title">Page not found</h1>
        <a className="btn btn-primary btn-inline" href="#/tenant" style={{ marginTop: 20 }}>Back to shop</a>
      </div>
    </Page>
  )
}
