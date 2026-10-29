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
  { id: 'garden', name: 'Rangsit Garden Dorm', area: 'Khlong Nueng, near TU Rangsit' },
  { id: 'lotus', name: 'Lotus Place Residence', area: 'Lak Hok, near Rangsit University' },
  { id: 'chiangrak', name: 'Chiang Rak Mansion', area: 'Chiang Rak, near TU Rangsit' },
  { id: 'bu', name: 'Phahon Student House', area: 'Khlong Nueng, near Bangkok University' },
]

export const DAMAGE_FEES = [
  { label: 'Broken microwave glass tray', fee: 400 },
  { label: 'Torn chair mesh seat', fee: 900 },
  { label: 'Water-damaged standing desk keypad', fee: 850 },
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
