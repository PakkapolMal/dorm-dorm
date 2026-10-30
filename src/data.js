// Mock data for the prototype. Prices and fees come from docs/OVERVIEW.md.
import { Refrigerator, Microwave, Armchair, LampDesk, Wind } from 'lucide-react'

// Capitalization is undecided, so the brand renders from this one place.
export const BRAND = 'dorm-dorm'
// Prefix with Vite's base so images resolve under the GitHub Pages subpath.
const IMG = import.meta.env.BASE_URL + 'images/'

export const HERO_IMAGE = IMG + 'room/hero.webp'

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
    image: IMG + 'room/fridge.webp',
    name: '2-Door Inverter Fridge', short: 'Fridge', price: 390, retail: 5990, icon: Refrigerator, category: 'kitchen',
    spec: '5.6–6.6 cu.ft. with separate freezer',
    models: 'Hitachi HRTN5198, Haier HRF-185MN, Hisense 5.6Q',
    warranty: 'Multi-year compressor warranty', warrantyMonths: 36,
  },
  microwave: {
    image: IMG + 'room/microwave.webp',
    name: 'Microwave Oven 20L', short: 'Microwave', price: 190, retail: 1790, icon: Microwave, category: 'kitchen',
    spec: '20L, 700–800W',
    models: 'Sharp R-S20M6TA, Electrolux EMM20K22B',
    warranty: '1-year manufacturer warranty', warrantyMonths: 12,
  },
  chair: {
    image: IMG + 'room/chair.webp',
    name: 'Ergonomic Mesh Chair', short: 'Ergo chair', price: 290, retail: 4990, icon: Armchair, category: 'study',
    spec: 'Adjustable lumbar, mesh back',
    models: 'Sihoo M18',
    warranty: '3–7 year manufacturer warranty', warrantyMonths: 36,
  },
  desk: {
    image: IMG + 'room/desk.webp',
    name: 'Electric Standing Desk', short: 'Standing desk', price: 350, retail: 2900, icon: LampDesk, category: 'study',
    spec: '120 cm, motorized height',
    models: 'Amo Design, Nubwo, Ergomaker',
    warranty: '2–3 year manufacturer warranty', warrantyMonths: 24,
  },
  purifier: {
    image: IMG + 'room/purifier.webp',
    name: 'Smart Air Purifier', short: 'Air purifier', price: 220, retail: 2990, icon: Wind, category: 'air',
    spec: 'HEPA, for 16–27 sq.m. rooms',
    models: 'Xiaomi Smart Air Purifier 4 Compact',
    warranty: '1-year manufacturer warranty', warrantyMonths: 12,
  },
}

export const BUNDLES = {
  'living-basic': {
    image: IMG + 'room/living-basic.webp',
    name: 'Living Basic', price: 490, items: ['fridge', 'microwave'], badge: 'Popular', category: 'kitchen',
    tagline: 'Cook and keep food fresh',
  },
  'study-pro': {
    image: IMG + 'room/study-pro.webp',
    name: 'Study / Work Pro', price: 590, items: ['chair', 'desk'], badge: 'Popular', category: 'study',
    tagline: 'A real desk setup for long study nights',
  },
  'complete-living': {
    image: IMG + 'room/complete-living.webp',
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
export const monthLabel = (d) => d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
export const monthShort = (d) => d.toLocaleDateString('en-GB', { month: 'short' })
export const sum = (xs) => xs.reduce((s, x) => s + x, 0)
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
  dorm: 'chiangrak', room: '207', productIds: ['living-basic'],
  // Before/after slider on the takeover page. furnished = AI edit of empty (docs/IMAGE_CREDITS.md).
  image: IMG + 'room/furnished.webp', emptyImage: IMG + 'room/empty.webp',
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

export const LANDLORD = { name: 'Malee Wongsakul', email: 'malee@gardendorm.example', dorms: ['garden', 'chiangrak'], photo: IMG + 'people/landlord.webp' }

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
  // Not landlord properties in this demo; the operator sees all four partner dorms.
  lotus: ['A.AN.A', '.AA.P.'],
  bu: ['AA..A.', '.A.AP.'],
}
const PLANS = [['living-basic'], ['study-pro'], ['complete-living'], ['fridge'], ['living-basic', 'study-pro'], ['chair'], ['microwave', 'purifier']]
// Every occupied room gets its own tenant. These 7 are fixed (tenant mocks and the activity feed use them),
// the rest are handed out from TENANT_POOL in room order. 7 + 27 = 34 occupied rooms in the landlord's two dorms, then 20 more in Lotus and Phahon.
const FIXED_TENANTS = {
  'garden-304': 'Ploy K.', 'garden-202': 'Sirinya H.', 'garden-303': 'Napat S.', 'garden-205': 'Nonthawat Y.',
  'chiangrak-108': 'Suwat T.', 'chiangrak-206': 'Thanawat R.', 'chiangrak-101': 'Wipada C.',
}
const TENANT_POOL = ['Siwakorn T.', 'Natcha B.', 'Pongsakorn M.', 'Kanokwan D.', 'Jirayu N.', 'Benjamas O.', 'Phum A.', 'Mintra F.',
  'Kittipat E.', 'Arisa V.', 'Krit W.', 'Pimchanok L.', 'Tanapat J.', 'Chanya P.', 'Thanakorn B.', 'Kanya S.', 'Weerapat S.',
  'Pornthip R.', 'Anan K.', 'Nattaya K.', 'Chaiwat P.', 'Duangjai M.', 'Pakorn L.', 'Rattana W.', 'Teerawat D.', 'Supitcha N.', 'Thida C.',
  // Lotus Place + Phahon Student House (no photos: initials)
  'Akkarin P.', 'Bussaba T.', 'Chalita R.', 'Danai S.', 'Ekkachai W.', 'Fasai N.', 'Itsara K.', 'Jutamas L.', 'Kamon C.', 'Lalita M.',
  'Manop D.', 'Nalin O.', 'Orathai B.', 'Panupong V.', 'Ratchanon H.', 'Sakda J.', 'Tharinee G.', 'Uthai F.', 'Varit Y.', 'Yupin E.']
// Tenant name -> photo in public/images/people/ (credits: docs/IMAGE_CREDITS.md). No entry = initials.
const PHOTOS = {
  'Ploy K.': 'ploy', 'Sirinya H.': 'sirinya', 'Napat S.': 'napat', 'Nonthawat Y.': 'nonthawat',
  'Suwat T.': 'suwat', 'Thanawat R.': 'thanawat', 'Wipada C.': 'wipada',
  'Natcha B.': 'natcha', 'Kanokwan D.': 'kanokwan', 'Benjamas O.': 'benjamas', 'Mintra F.': 'mintra',
  'Arisa V.': 'arisa', 'Pimchanok L.': 'pimchanok', 'Chanya P.': 'chanya', 'Kanya S.': 'kanya',
  'Pornthip R.': 'pornthip', 'Nattaya K.': 'nattaya', 'Duangjai M.': 'duangjai', 'Rattana W.': 'rattana',
  'Supitcha N.': 'supitcha', 'Thida C.': 'thida', 'Siwakorn T.': 'siwakorn', 'Pongsakorn M.': 'pongsakorn',
  'Jirayu N.': 'jirayu', 'Phum A.': 'phum', 'Kittipat E.': 'kittipat', 'Krit W.': 'krit', 'Tanapat J.': 'tanapat',
  'Thanakorn B.': 'thanakorn', 'Weerapat S.': 'weerapat', 'Anan K.': 'anan', 'Chaiwat P.': 'chaiwat',
  'Pakorn L.': 'pakorn', 'Teerawat D.': 'teerawat',
}
let nextTenant = 0
const midnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
// Rooms the tenant mocks also use: same plan and dates on both sides.
const ROOM_OVERRIDES = {
  'garden-304': { productIds: ['living-basic'], start: midnight(addMonths(TODAY, -4)), term: 6, elec: [728, 812, 665] },
  'chiangrak-207': { productIds: ['living-basic'] },
}

export const ROOMS = Object.entries(LAYOUT).flatMap(([dorm, floors]) =>
  floors.flatMap((codes, f) => [...codes].map((code, r) => {
    const n = f * codes.length + r
    const room = `${f + 1}${String(r + 1).padStart(2, '0')}`
    const status = { A: 'active', N: 'notice', P: 'preupgraded', '.': 'none' }[code]
    const hasItems = status !== 'none'
    const vacant = status === 'preupgraded' || (status === 'none' && n % 5 === 4)
    const tenant = vacant ? null : FIXED_TENANTS[`${dorm}-${room}`] ?? TENANT_POOL[nextTenant++]
    return {
      id: `${dorm}-${room}`, dorm, room, floor: f + 1, status, tenant,
      photo: PHOTOS[tenant] && `${IMG}people/${PHOTOS[tenant]}.webp`,
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
export const ACTIVITY = [
  { dorm: 'garden', room: '304', who: roomById('garden-304').tenant, photo: roomById('garden-304').photo, text: 'Paid the room invoice', amount: roomMonthly(roomById('garden-304')), days: 0 },
  { dorm: 'garden', room: '202', who: roomById('garden-202').tenant, photo: roomById('garden-202').photo, text: 'Gave 14-day notice via LINE OA', days: 1 },
  { dorm: 'garden', room: '303', who: roomById('garden-303').tenant, photo: roomById('garden-303').photo, text: 'Subscribed to add-ons', amount: roomMonthly(roomById('garden-303')), days: 3 },
  { dorm: 'garden', room: '306', who: null, text: 'Check-out done, items stay in room', days: 5 },
  { dorm: 'garden', room: '205', who: roomById('garden-205').tenant, photo: roomById('garden-205').photo, text: 'Paid the room invoice', amount: roomMonthly(roomById('garden-205')), days: 6 },
  { dorm: 'chiangrak', room: '207', who: null, text: 'Check-out done, items stay in room', days: 2 },
  { dorm: 'chiangrak', room: '108', who: roomById('chiangrak-108').tenant, photo: roomById('chiangrak-108').photo, text: 'Gave 14-day notice via LINE OA', days: 2 },
  { dorm: 'chiangrak', room: '206', who: roomById('chiangrak-206').tenant, photo: roomById('chiangrak-206').photo, text: 'Subscribed to add-ons', amount: roomMonthly(roomById('chiangrak-206')), days: 4 },
  { dorm: 'chiangrak', room: '101', who: roomById('chiangrak-101').tenant, photo: roomById('chiangrak-101').photo, text: 'Paid the room invoice', amount: roomMonthly(roomById('chiangrak-101')), days: 7 },
]

// ---------- operator ----------
export const OPERATOR = { name: 'Kanda Srisuk', email: `kanda@${BRAND.toLowerCase()}.example` }

// Delivery clusters = the area before the comma ("Khlong Nueng, near TU Rangsit" -> "Khlong Nueng").
export const clusterOf = (dorm) => PARTNER_DORMS.find((d) => d.id === dorm).area.split(',')[0]

// Most recent wave day (Wed / Sat) on or before `from`: its orders are out for delivery.
export function lastWave(from = TODAY) {
  let d = midnight(from)
  while (d.getDay() !== 3 && d.getDay() !== 6) d = addDays(d, -1)
  return d
}
// Pickup / move dates for an exit: wave days on or after the last day of notice.
export const exitDates = (notice) => nextWaves(addDays(notice, -2), 3)

export const ORDER_STATUS = { new: ['warning', 'New'], scheduled: ['info', 'Scheduled'], delivered: ['success', 'Delivered'] }
export const ASSET_STATUS = { warehouse: ['neutral', 'Warehouse'], installed: ['success', 'Installed'], repair: ['info', 'In repair'], retired: ['muted', 'Retired'] }
export const EXIT_STATUS = { pending: ['warning', 'Pending'], scheduled: ['info', 'Scheduled'] }
export const EXIT_PATHS = { transfer: 'Transfer', relocate: 'Relocation', return: 'Return + cancel', end: 'End of term' }
export const STAGES = [['new', 'New'], ['triage', 'Triage'], ['warranty', 'Warranty claim'], ['damage', 'Damage fee'], ['resolved', 'Resolved']]
export const PRIORITY = { high: ['danger', 'High'], medium: ['warning', 'Medium'], low: ['neutral', 'Low'] }

const people = (r) => ({ roomId: r.id, dorm: r.dorm, room: r.room, tenant: r.tenant, photo: r.photo })

// New subscriptions waiting for delivery, in rooms that have a tenant and no add-on yet.
const ORDER_PLANS = [['living-basic'], ['study-pro'], ['fridge'], ['complete-living'], ['microwave'], ['living-basic'], ['chair'], ['study-pro'], ['purifier'], ['living-basic']]
const LAST_WAVE = lastWave().getTime()
const NEXT_WAVE = nextWaves()[0].getTime()
export const ORDERS = [['garden', 3], ['chiangrak', 2], ['lotus', 3], ['bu', 2]]
  .flatMap(([d, k]) => ROOMS.filter((r) => r.dorm === d && r.status === 'none' && r.tenant).slice(0, k))
  .map((r, i) => {
    const wave = [0, 4, 7].includes(i) ? LAST_WAVE : [1, 5, 8].includes(i) ? NEXT_WAVE : null
    return {
      id: `O-${1041 + i}`, ...people(r), productIds: ORDER_PLANS[i], term: i % 3 === 0 ? 12 : 6,
      ordered: midnight(addDays(TODAY, -(12 - i))), wave, status: wave ? 'scheduled' : 'new',
    }
  })

// Every unit has a serial. Installed units come from the rooms; the rest sit in the warehouse or are retired.
const SKU_CODE = { fridge: 'FR', microwave: 'MW', chair: 'CH', desk: 'DK', purifier: 'AP' }
let serialSeq = 30
const asset = (sku, purchased, status, roomId = null) => ({
  id: `${SKU_CODE[sku]}-${String(purchased.getFullYear()).slice(2)}${String(purchased.getMonth() + 1).padStart(2, '0')}-${String(serialSeq++).padStart(4, '0')}`,
  sku, purchased, status, roomId, warrantyEnd: addMonths(purchased, SKUS[sku].warrantyMonths),
})
const IN_REPAIR = ['chiangrak-103:fridge'] // the open warranty claim below
const WAREHOUSE = { fridge: 7, microwave: 6, chair: 5, desk: 3, purifier: 3 }
export const ASSETS = [
  ...ROOMS.filter((r) => r.productIds.length).flatMap((r) => r.productIds.flatMap((id) => getProduct(id).items)
    .map((sku) => asset(sku, r.start, IN_REPAIR.includes(`${r.id}:${sku}`) ? 'repair' : 'installed', r.id))),
  ...Object.entries(WAREHOUSE).flatMap(([sku, n]) => Array.from({ length: n }, (_, i) => asset(sku, midnight(addMonths(TODAY, -((i * 5) % 14))), 'warehouse'))),
  asset('fridge', midnight(addMonths(TODAY, -40)), 'retired'),
  asset('chair', midnight(addMonths(TODAY, -38)), 'retired'),
  asset('microwave', midnight(addMonths(TODAY, -30)), 'retired'),
]

const ticket = (id, roomId, sku, title, type, priority, days, stage, extra) => ({
  id, ...people(roomById(roomId)), sku, title, detail: '', type, priority, created: midnight(addDays(TODAY, -days)), stage, ...extra,
})
export const TICKETS = [
  ticket('T-2091', 'chiangrak-205', 'chair', 'Gas lift sinks slowly', 'fault', 'medium', 0, 'new'),
  ticket('T-2090', 'lotus-203', 'desk', 'Keypad stopped after a spill', 'damage', 'high', 1, 'new'),
  ticket('T-2089', 'bu-102', 'chair', 'Caster wheel worn', 'wear', 'low', 1, 'new'),
  ticket('T-2087', 'garden-304', 'microwave', 'Glass tray cracked', 'damage', 'medium', 2, 'triage', { detail: 'Dropped it while washing.' }),
  ticket('T-2085', 'garden-302', 'purifier', 'Fan rattles on high', 'fault', 'medium', 3, 'triage'),
  ticket('T-2082', 'chiangrak-103', 'fridge', 'Fridge not cooling', 'fault', 'high', 6, 'warranty', { outcome: 'warranty' }),
  ticket('T-2079', 'garden-405', 'chair', 'Mesh seat torn', 'damage', 'medium', 8, 'damage', { outcome: 'damage', fee: 900, feeLabel: 'Torn chair mesh seat' }),
  ticket('T-2074', 'garden-101', 'fridge', 'Door seal loose', 'fault', 'low', 14, 'resolved', { outcome: 'warranty' }),
  ticket('T-2071', 'lotus-101', 'microwave', 'Scratches on the door', 'wear', 'low', 17, 'resolved', { outcome: 'wear' }),
]

// Exit requests = the rooms in their notice period. Notice was given 14 days before the last day.
const EXIT_PLANS = {
  'garden-202': ['transfer', 'Next tenant of room 202: Kwan P.'],
  'chiangrak-108': ['relocate', 'Rangsit Park Condo, room 1512, Khlong Nueng'],
  'garden-404': ['return'],
  'lotus-104': ['return', '', 'scheduled'],
}
export const exitFor = (r, path, detail = '', status = 'pending', id = 'X-301') => ({
  id, ...people(r), productIds: r.productIds, start: r.start, term: r.term, path, detail,
  notice: r.moveOut, requested: addDays(r.moveOut, -NOTICE_DAYS), status, date: status === 'scheduled' ? exitDates(r.moveOut)[0].getTime() : null,
})
export const EXITS = ROOMS.filter((r) => r.status === 'notice').map((r, n) => {
  const [path, detail, status] = EXIT_PLANS[r.id] ?? ['return']
  return exitFor(r, path, detail, status, `X-${301 + n}`)
})

// Fees per pathway (OVERVIEW: early exit). Return = 600 + the lower of 1 month or 50% of the remaining balance.
export function exitFees(x) {
  const monthly = x.productIds.reduce((s, id) => s + getProduct(id).price, 0)
  const remaining = Math.max(0, x.term - Math.max(0, monthsBetween(x.start, TODAY)))
  const early = Math.min(monthly, Math.round((monthly * remaining) / 2))
  return { monthly, remaining, early, deposit: depositFor(monthly), returnTotal: RETRIEVAL_FEE + early }
}

// Active subscriptions by month (same semester ramp as the landlord chart).
export const subsHistory = (current) => [
  ...RAMP.map((k, i) => ({ month: new Date(TODAY.getFullYear(), TODAY.getMonth() - 5 + i, 1), value: Math.round(current * k) })),
  { month: new Date(TODAY.getFullYear(), TODAY.getMonth(), 1), value: current },
]
