import { LayoutDashboard, DoorOpen, ReceiptText, Check } from 'lucide-react'
import { BRAND, LANDLORD, ACTIVITY, dormName } from '../data.js'
import { useStore, go } from '../store.jsx'
import { Shell } from '../dash/Shell.jsx'

const NAV = [{
  label: 'Overview',
  items: [
    { key: undefined, label: 'Dashboard', href: '#/landlord', icon: LayoutDashboard },
    { key: 'rooms', label: 'Rooms', href: '#/landlord/rooms', icon: DoorOpen },
    { key: 'invoices', label: 'Invoices', href: '#/landlord/invoices', icon: ReceiptText },
  ],
}]

function crumbsFor(page, sub, rooms) {
  const out = [{ label: 'Dashboard', href: '#/landlord' }]
  if (page === 'rooms') out.push({ label: 'Rooms', href: '#/landlord/rooms' })
  if (page === 'invoices') out.push({ label: 'Invoices', href: '#/landlord/invoices' })
  if (page === 'rooms' && sub) {
    const r = rooms.find((x) => x.id === sub)
    out.push({ label: r ? `Room ${r.room}` : 'Not found' })
  }
  return out
}

export function LandlordShell({ page, sub, children }) {
  const { dorm, setDorm, rooms, setRoomSearch, setInvoiceSearch } = useStore()
  const news = ACTIVITY.filter((a) => a.dorm === dorm).slice(0, 4)
  return (
    <Shell
      page={page}
      nav={NAV}
      crumbs={crumbsFor(page, sub, rooms)}
      user={LANDLORD}
      switcher={{
        title: dormName(dorm), role: `${BRAND} · Landlord`, label: `Property: ${dormName(dorm)}. Switch property`, menuLabel: 'Properties',
        menu: (close) => <>
          <div className="menu-label">Properties</div>
          {LANDLORD.dorms.map((id) => (
            <button key={id} type="button" className="menu-item" aria-pressed={dorm === id}
              onClick={() => { setDorm(id); setRoomSearch(''); setInvoiceSearch(''); close() }}>
              <span className="grow">{dormName(id)}</span>
              {dorm === id && <Check size={16} aria-hidden="true" />}
            </button>
          ))}
        </>,
      }}
      search={{ label: 'Search rooms or tenants', onSubmit: (q) => { setRoomSearch(q); go('/landlord/rooms') } }}
      notifs={{
        title: `Recent activity · ${dormName(dorm)}`,
        items: news.map((a) => ({
          key: a.room + a.text, href: `#/landlord/rooms/${a.dorm}-${a.room}`, title: `Room ${a.room}`, text: a.text,
          when: a.days === 0 ? 'Today' : `${a.days} day${a.days > 1 ? 's' : ''} ago`, isNew: a.days <= 2,
        })),
      }}
    >
      {children}
    </Shell>
  )
}
