import { useEffect } from 'react'
import { GraduationCap, Building2, Truck, ChevronRight } from 'lucide-react'
import { BRAND, getProduct } from './data.js'
import { StoreProvider, useRoute } from './store.jsx'
import { Home, Catalog, Item, Cart, Checkout, Confirmed, Takeover, NotFound } from './tenant/shop.jsx'
import { Room, Issue, Exit, Buyout, Bills, Help } from './tenant/room.jsx'
import { LandlordShell } from './landlord/Shell.jsx'
import { OperatorShell } from './operator/Shell.jsx'
import { OpDashboard, Orders, Assets, Tickets, Exits, Partners, OperatorNotFound } from './operator/pages.jsx'
import { Dashboard, Rooms, Invoices, LandlordNotFound } from './landlord/pages.jsx'

function RolePicker() {
  return (
    <div className="picker">
      <div className="picker-card">
        <h1>{BRAND}</h1>
        <p className="muted">Prototype. Choose a view to explore.</p>
        <div className="role-list">
          <a className="role" href="#/tenant">
            <GraduationCap size={24} color="var(--primary)" aria-hidden="true" />
            <div><strong>Tenant</strong><span>Shop add-ons, manage your room (mobile)</span></div>
            <ChevronRight size={18} className="chev" aria-hidden="true" />
          </a>
          <a className="role" href="#/landlord">
            <Building2 size={24} color="var(--primary)" aria-hidden="true" />
            <div><strong>Landlord</strong><span>Rooms, invoices and your revenue share (desktop)</span></div>
            <ChevronRight size={18} className="chev" aria-hidden="true" />
          </a>
          <a className="role" href="#/operator">
            <Truck size={24} color="var(--primary)" aria-hidden="true" />
            <div><strong>Operator</strong><span>Delivery waves, assets, tickets and exits (desktop)</span></div>
            <ChevronRight size={18} className="chev" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  )
}

const TITLES = {
  '': 'Home', catalog: 'Catalog', cart: 'Cart', checkout: 'Checkout', confirmed: 'Order placed', takeover: 'Room takeover',
  room: 'My Room', 'room/issue': 'Report an issue', 'room/exit': 'Leave early', 'room/buyout': 'Buy out items', bills: 'Bills', help: 'Help',
}

function tenantTitle(page = '', sub) {
  if (page === 'item') return getProduct(sub)?.name ?? 'Not found'
  return TITLES[sub ? `${page}/${sub}` : page] ?? TITLES[page] ?? 'Not found'
}

const LANDLORD_TITLES = { undefined: 'Dashboard', rooms: 'Rooms', invoices: 'Invoices' }
const OPERATOR_TITLES = { undefined: 'Dashboard', orders: 'Orders', assets: 'Assets', tickets: 'Tickets', exits: 'Exit requests', partners: 'Partner dorms' }

function Landlord({ page, sub, extra }) {
  let body
  if (page === undefined) body = <Dashboard />
  else if (page === 'rooms') body = <Rooms openId={sub} inspect={extra === 'checkout'} />
  else if (page === 'invoices') body = <Invoices />
  else body = <LandlordNotFound />
  return <LandlordShell page={page} sub={sub}>{body}</LandlordShell>
}

const OPERATOR_PAGES = { undefined: OpDashboard, orders: Orders, assets: Assets, tickets: Tickets, exits: Exits, partners: Partners }

function Operator({ page }) {
  const Page = OPERATOR_PAGES[page] ?? OperatorNotFound
  return <OperatorShell page={page}><Page /></OperatorShell>
}

function Routes() {
  const [role, page, sub, extra] = useRoute()

  useEffect(() => {
    document.title = role === 'tenant' ? `${tenantTitle(page, sub)} · ${BRAND}`
      : role === 'landlord' ? `${LANDLORD_TITLES[page] ?? 'Not found'} · ${BRAND}`
      : role === 'operator' ? `${OPERATOR_TITLES[page] ?? 'Not found'} · ${BRAND}` : BRAND
  }, [role, page, sub])

  if (role === 'landlord') return <Landlord page={page} sub={sub} extra={extra} />
  if (role === 'operator') return <Operator page={page} />
  if (role !== 'tenant') return <RolePicker />
  switch (page) {
    case undefined: return <Home />
    case 'catalog': return <Catalog />
    case 'item': return <Item key={sub} id={sub} />
    case 'cart': return <Cart />
    case 'checkout': return <Checkout />
    case 'confirmed': return <Confirmed />
    case 'takeover': return <Takeover />
    case 'room':
      if (sub === 'issue') return <Issue />
      if (sub === 'exit') return <Exit />
      if (sub === 'buyout') return <Buyout />
      return <Room />
    case 'bills': return <Bills />
    case 'help': return <Help />
    default: return <NotFound />
  }
}

export default function App() {
  return <StoreProvider><Routes /></StoreProvider>
}
