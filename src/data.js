// Mock data for the prototype. Prices and fees come from docs/OVERVIEW.md.
import { Refrigerator, Microwave, Armchair, LampDesk, Wind } from 'lucide-react'

// Capitalization is undecided, so the brand renders from this one place.
export const BRAND = 'dorm-dorm'
export const HERO_IMAGE = '/images/hero.webp'

export const ADDON_CAP = 1500
export const SETUP_FEE = 300
export const RETRIEVAL_FEE = 600
export const RELOCATION_FEE = [350, 500]
export const NOTICE_DAYS = 14
export const BUYOUT_AFTER_MONTHS = 24
export const BUYOUT_RATE = [0.25, 0.35]
export const BASE_RENT = 3500
export const CONDO_FLOOR = 7500

// retail = mock reference price used for buyout estimates
export const SKUS = {
  fridge: {
    image: '/images/fridge.webp',
    name: '2-Door Inverter Fridge', short: 'Fridge', price: 390, retail: 5990, icon: Refrigerator, category: 'kitchen',
    spec: '5.6–6.6 cu.ft. with separate freezer',
    models: 'Hitachi HRTN5198, Haier HRF-185MN, Hisense 5.6Q',
    warranty: 'Multi-year compressor warranty',
  },
  microwave: {
    image: '/images/microwave.webp',
    name: 'Microwave Oven 20L', short: 'Microwave', price: 190, retail: 1790, icon: Microwave, category: 'kitchen',
    spec: '20L, 700–800W',
    models: 'Sharp R-S20M6TA, Electrolux EMM20K22B',
    warranty: '1-year manufacturer warranty',
  },
  chair: {
    image: '/images/chair.webp',
    name: 'Ergonomic Mesh Chair', short: 'Ergo chair', price: 290, retail: 4990, icon: Armchair, category: 'study',
    spec: 'Adjustable lumbar, mesh back',
    models: 'Sihoo M18',
    warranty: '3–7 year manufacturer warranty',
  },
  desk: {
    image: '/images/desk.webp',
    name: 'Electric Standing Desk', short: 'Standing desk', price: 350, retail: 2900, icon: LampDesk, category: 'study',
    spec: '120 cm, motorized height',
    models: 'Amo Design, Nubwo, Ergomaker',
    warranty: '2–3 year manufacturer warranty',
  },
  purifier: {
    image: '/images/purifier.webp',
    name: 'Smart Air Purifier', short: 'Air purifier', price: 220, retail: 2990, icon: Wind, category: 'air',
    spec: 'HEPA, for 16–27 sq.m. rooms',
    models: 'Xiaomi Smart Air Purifier 4 Compact',
    warranty: '1-year manufacturer warranty',
  },
}

export const BUNDLES = {
  'living-basic': {
    image: '/images/living-basic.webp',
    name: 'Living Basic', price: 490, items: ['fridge', 'microwave'], badge: 'Popular', category: 'kitchen',
    tagline: 'Cook and keep food fresh',
  },
  'study-pro': {
    image: '/images/study-pro.webp',
    name: 'Study / Work Pro', price: 590, items: ['chair', 'desk'], badge: 'Popular', category: 'study',
    tagline: 'A real desk setup for long study nights',
  },
  'complete-living': {
    image: '/images/complete-living.webp',
    name: 'Complete Living', price: 990, items: ['fridge', 'microwave', 'chair', 'purifier'], badge: 'Best value', category: 'all',
    tagline: 'Condo-grade comfort in your dorm room',
  },
}

// A product is either a SKU or a bundle, addressed by id.
export function getProduct(id) {
  if (SKUS[id]) return { id, kind: 'sku', items: [id], ...SKUS[id] }
  if (BUNDLES[id]) return { id, kind: 'bundle', ...BUNDLES[id] }
  return null
}

export const bundleSaving = (b) => b.items.reduce((s, i) => s + SKUS[i].price, 0) - b.price

export const PARTNER_DORMS = [
  { id: 'garden', name: 'Rangsit Garden Dorm', area: 'Khlong Nueng, near TU Rangsit', rent: 3500 },
  { id: 'lotus', name: 'Lotus Place Residence', area: 'Lak Hok, near Rangsit University', rent: 3800 },
  { id: 'chiangrak', name: 'Chiang Rak Mansion', area: 'Chiang Rak, near TU Rangsit', rent: 3200 },
  { id: 'bu', name: 'Phahon Student House', area: 'Khlong Nueng, near Bangkok University', rent: 4200 },
]

export const DAMAGE_FEES = [
  { label: 'Broken microwave glass tray', fee: 400, sku: 'microwave' },
  { label: 'Torn chair mesh seat', fee: 900, sku: 'chair' },
  { label: 'Water-damaged standing desk keypad', fee: 850, sku: 'desk' },
  { label: 'Total loss', fee: null, note: 'Depreciated buyout price, capped at retail' },
]

export const NORMAL_WEAR = 'Micro-scratches on desktops, caster wheel wear, and foam compression are normal wear. No charge.'

// Refundable deposit ≈ 1 month of the subscription, kept within 500–1,000 THB.
export const depositFor = (monthly) => Math.min(1000, Math.max(500, monthly))

export const thb = (n) => `${n.toLocaleString('en-US')} THB`
export const thbMo = (n) => `${thb(n)}/mo`

// ---------- dates ----------
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
export const addMonths = (d, n) => { const x = new Date(d); x.setMonth(x.getMonth() + n); return x }
export const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
export const fmtDay = (d) => new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
export const monthsBetween = (a, b) => {
  const s = new Date(a), e = new Date(b)
  return (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) - (e.getDate() < s.getDate() ? 1 : 0)
}

// Free delivery only runs on wave days (Wed / Sat). Next 4 waves at least 2 days out.
// Dates are local midnight so repeated calls return identical values (they're used as radio values).
export function nextWaves(from = new Date(), count = 4) {
  const out = []
  let d = addDays(new Date(from.getFullYear(), from.getMonth(), from.getDate()), 2)
  while (out.length < count) {
    if (d.getDay() === 3 || d.getDay() === 6) out.push(new Date(d))
    d = addDays(d, 1)
  }
  return out
}

// ---------- demo scenarios (switchable from Help) ----------
export const TODAY = new Date()
const today = TODAY

export const SCENARIOS = {
  mid: {
    label: 'Month 5 of a 6-month lease',
    subscription: {
      productIds: ['living-basic'], dorm: 'garden', room: '304', term: 6,
      start: addMonths(today, -4), status: 'active',
    },
  },
  long: {
    label: 'Month 26 (buyout available)',
    subscription: {
      productIds: ['living-basic', 'study-pro'], dorm: 'lotus', room: '512', term: 12,
      start: addMonths(today, -25), status: 'active',
    },
  },
  none: { label: 'New tenant, no add-ons', subscription: null },
}

export const TAKEOVER_ROOM = {
  dorm: 'chiangrak', room: '207', productIds: ['living-basic'], image: '/images/takeover-room.webp',
  note: 'The previous tenant moved out. The items were inspected and left in the room.',
}

// Mock electricity/water so bills look real.
export function billsFor(sub, months = 3) {
  return Array.from({ length: months }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const addon = sub ? sub.productIds.reduce((s, id) => s + getProduct(id).price, 0) : 0
    const lines = [
      { label: 'Room rent', amount: BASE_RENT },
      { label: 'Water', amount: 150 },
      { label: 'Electricity', amount: [728, 812, 665][i % 3] },
    ]
    if (addon) lines.push({ label: `${BRAND} add-on`, amount: addon, addon: true })
    // Due on the 5th of the following month, so the current bill is upcoming, not overdue.
    return { id: date.toISOString().slice(0, 7), date, due: new Date(date.getFullYear(), date.getMonth() + 1, 5), lines, paid: i > 0 }
  })
}

// ---------- landlord ----------
export const REVENUE_SHARE = 0.15
export const DEPRECIATION_MONTHS = 36

export const dormName = (id) => PARTNER_DORMS.find((d) => d.id === id)?.name

export const LANDLORD = { name: 'Malee Wongsakul', email: 'malee@gardendorm.example', dorms: ['garden', 'chiangrak'], photo: '/images/people/landlord.webp' }

export const ROOM_STATUS = {
  none: ['neutral', 'No add-on'],
  active: ['success', 'Active'],
  preupgraded: ['info', 'Pre-upgraded vacant'],
  notice: ['warning', 'Notice period'],
}

// One char per room, one string per floor: A active · N notice · P pre-upgraded vacant · . no add-on
const LAYOUT = {
  garden: ['A.A.P.', '.N..A.', '.AAA.P', 'A..NA.'],
  chiangrak: ['A.A..A.N', '.A..AAP.'],
}
const PLANS = [['living-basic'], ['study-pro'], ['complete-living'], ['fridge'], ['living-basic', 'study-pro'], ['chair'], ['microwave', 'purifier']]
const NAMES = ['Napat S.', 'Ploy K.', 'Thanawat R.', 'Chanya P.', 'Krit W.', 'Pimchanok L.', 'Siwakorn T.', 'Natcha B.', 'Pongsakorn M.',
  'Wipada C.', 'Tanapat J.', 'Kanokwan D.', 'Jirayu N.', 'Sirinya H.', 'Phum A.', 'Arisa V.', 'Nonthawat Y.', 'Benjamas O.', 'Kittipat E.', 'Mintra F.']
const midnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
// Rooms the tenant mocks also use: same plan and dates on both sides.
const ROOM_OVERRIDES = {
  'garden-304': { productIds: ['living-basic'], start: midnight(addMonths(TODAY, -4)), term: 6, elec: [728, 812, 665] },
  'chiangrak-207': { productIds: ['living-basic'] },
  'chiangrak-108': { tenant: 'Suwat T.' },
}

export const ROOMS = Object.entries(LAYOUT).flatMap(([dorm, floors]) =>
  floors.flatMap((codes, f) => [...codes].map((code, r) => {
    const n = f * codes.length + r
    const room = `${f + 1}${String(r + 1).padStart(2, '0')}`
    const status = { A: 'active', N: 'notice', P: 'preupgraded', '.': 'none' }[code]
    const hasItems = status !== 'none'
    const vacant = status === 'preupgraded' || (status === 'none' && n % 5 === 4)
    return {
      id: `${dorm}-${room}`, dorm, room, floor: f + 1, status,
      tenant: vacant ? null : NAMES[(n + dorm.length) % NAMES.length],
      productIds: hasItems ? PLANS[n % PLANS.length] : [],
      start: hasItems ? midnight(addMonths(TODAY, -(2 + (n * 5) % 15))) : null,
      term: n % 3 === 0 ? 12 : 6,
      moveOut: status === 'notice' ? midnight(addDays(TODAY, 4 + (n % 9))) : null,
      elec: [728, 812, 665].map((v) => v + ((n * 53 + dorm.length * 17) % 160) - 80),
      ...ROOM_OVERRIDES[`${dorm}-${room}`],
    }
  })),
)

export const roomMonthly = (r) => r.productIds.reduce((s, id) => s + getProduct(id).price, 0)
export const isBilled = (r) => r.status === 'active' || r.status === 'notice'

// Totals for one property, used by the KPI cards and the trend chart.
export function dormStats(rooms, dorm) {
  const list = rooms.filter((r) => r.dorm === dorm)
  const billed = list.filter(isBilled)
  const revenue = billed.reduce((s, r) => s + roomMonthly(r), 0)
  return {
    total: list.length,
    upgraded: billed.length,
    vacant: list.filter((r) => r.status === 'preupgraded').length,
    revenue,
    share: Math.round(revenue * REVENUE_SHARE),
  }
}

// Earlier months as a fraction of this month's opening value (the semester ramp).
const RAMP = [0.58, 0.66, 0.79, 0.86, 0.93]
export function shareHistory(dorm, currentShare) {
  const base = dormStats(ROOMS, dorm).share
  return [
    ...RAMP.map((k, i) => ({ month: new Date(TODAY.getFullYear(), TODAY.getMonth() - 5 + i, 1), share: Math.round(base * k) })),
    { month: new Date(TODAY.getFullYear(), TODAY.getMonth(), 1), share: currentShare },
  ]
}
// Last month's KPI values, for the trend badges.
export function lastMonthStats(dorm) {
  const s = dormStats(ROOMS, dorm)
  return { upgraded: s.upgraded - 2, revenue: Math.round(s.revenue * RAMP[4]), share: Math.round(s.share * RAMP[4]), vacant: s.vacant + 1 }
}

// Total loss = buyout price depreciated straight-line, never below 25% of retail, capped at retail.
// ponytail: straight-line guess; swap for the operator's real depreciation table when there is one.
export const totalLossFee = (sku, months) =>
  Math.round((SKUS[sku].retail * Math.max(0.25, 1 - Math.max(0, months) / DEPRECIATION_MONTHS)) / 10) * 10

export const invoiceMonths = (count = 3) =>
  Array.from({ length: count }, (_, i) => new Date(TODAY.getFullYear(), TODAY.getMonth() - i, 1))

// Room invoices for one property, `i` months back. Same lines as the tenant's billsFor().
export function invoicesFor(rooms, dorm, i) {
  const date = new Date(TODAY.getFullYear(), TODAY.getMonth() - i, 1)
  const due = new Date(date.getFullYear(), date.getMonth() + 1, 5)
  const rent = PARTNER_DORMS.find((d) => d.id === dorm).rent
  // lastTenant: a room checked out this month still has that tenant's final invoice.
  return rooms.filter((r) => r.dorm === dorm && (r.tenant || r.lastTenant)).map((r, n) => {
    const lines = [
      { label: 'Room rent', amount: rent },
      { label: 'Water', amount: 150 },
      { label: 'Electricity', amount: r.elec[i % 3] },
    ]
    const addon = (isBilled(r) || r.lastTenant) && r.start <= date ? roomMonthly(r) : 0
    if (addon) lines.push({ label: `${BRAND} add-on`, amount: addon, addon: true })
    const paid = i > 0 && !(i === 1 && n % 7 === 3) // a couple of last month's bills are still unpaid
    const status = paid ? 'paid' : due < TODAY ? 'overdue' : 'due'
    return { id: `${r.id}-${date.toISOString().slice(0, 7)}`, room: r, tenant: r.tenant ?? r.lastTenant, date, due, lines, addon, total: lines.reduce((s, l) => s + l.amount, 0), status }
  })
}

export const INVOICE_STATUS = { paid: ['success', 'Paid'], due: ['warning', 'Due'], overdue: ['danger', 'Overdue'] }

const roomById = (id) => ROOMS.find((r) => r.id === id)
const face = (f) => `/images/people/${f}.webp` // credits: docs/IMAGE_CREDITS.md
export const ACTIVITY = [
  { dorm: 'garden', room: '304', who: roomById('garden-304').tenant, photo: face('ploy'), text: 'Paid the room invoice', amount: roomMonthly(roomById('garden-304')), days: 0 },
  { dorm: 'garden', room: '202', who: roomById('garden-202').tenant, photo: face('sirinya'), text: 'Gave 14-day notice via LINE OA', days: 1 },
  { dorm: 'garden', room: '303', who: roomById('garden-303').tenant, photo: face('napat'), text: 'Subscribed to add-ons', amount: roomMonthly(roomById('garden-303')), days: 3 },
  { dorm: 'garden', room: '306', who: null, text: 'Check-out done, items stay in room', days: 5 },
  { dorm: 'garden', room: '205', who: roomById('garden-205').tenant, photo: face('nonthawat'), text: 'Paid the room invoice', amount: roomMonthly(roomById('garden-205')), days: 6 },
  { dorm: 'chiangrak', room: '207', who: null, text: 'Check-out done, items stay in room', days: 2 },
  { dorm: 'chiangrak', room: '108', who: roomById('chiangrak-108').tenant, photo: face('suwat'), text: 'Gave 14-day notice via LINE OA', days: 2 },
  { dorm: 'chiangrak', room: '206', who: roomById('chiangrak-206').tenant, photo: face('thanawat'), text: 'Subscribed to add-ons', amount: roomMonthly(roomById('chiangrak-206')), days: 4 },
  { dorm: 'chiangrak', room: '101', who: roomById('chiangrak-101').tenant, photo: face('wipada'), text: 'Paid the room invoice', amount: roomMonthly(roomById('chiangrak-101')), days: 7 },
]
