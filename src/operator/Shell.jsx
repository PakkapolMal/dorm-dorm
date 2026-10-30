import { LayoutDashboard, Truck, Boxes, Wrench, LogOut, Building2 } from 'lucide-react'
import { BRAND, OPERATOR, TODAY } from '../data.js'
import { useStore, go } from '../store.jsx'
import { Shell } from '../dash/Shell.jsx'

const NAV = [
  { label: 'Overview', items: [{ key: undefined, label: 'Dashboard', href: '#/operator', icon: LayoutDashboard }] },
  {
    label: 'Operations',
    items: [
      { key: 'orders', label: 'Orders & waves', href: '#/operator/orders', icon: Truck },
      { key: 'assets', label: 'Assets', href: '#/operator/assets', icon: Boxes },
      { key: 'tickets', label: 'Issue tickets', href: '#/operator/tickets', icon: Wrench },
      { key: 'exits', label: 'Exit requests', href: '#/operator/exits', icon: LogOut },
    ],
  },
  { label: 'Partners', items: [{ key: 'partners', label: 'Partner dorms', href: '#/operator/partners', icon: Building2 }] },
]
const ALL = NAV.flatMap((g) => g.items)

const daysAgo = (d) => Math.floor((TODAY - d) / 86400000)
const ago = (d) => { const n = daysAgo(d); return n <= 0 ? 'Today' : `${n} day${n > 1 ? 's' : ''} ago` }

export function OperatorShell({ page, children }) {
  const { tickets, exits, orders, setAssetSearch } = useStore()
  const here = ALL.find((n) => n.key === page)
  const crumbs = [{ label: 'Dashboard', href: '#/operator' }]
  if (page !== undefined) crumbs.push({ label: here?.label ?? 'Not found' })

  // Newest work first: new tickets, pending exits, orders without a wave.
  const items = [
    ...tickets.filter((t) => t.stage === 'new').map((t) => ({ key: t.id, at: t.created, href: '#/operator/tickets', title: `Ticket ${t.id}`, text: `${t.title}, room ${t.room}` })),
    ...exits.filter((x) => x.status === 'pending').map((x) => ({ key: x.id, at: x.requested, href: '#/operator/exits', title: x.tenant, text: `Gave notice, room ${x.room}` })),
    ...orders.filter((o) => o.status === 'new').map((o) => ({ key: o.id, at: o.ordered, href: '#/operator/orders', title: `Order ${o.id}`, text: `Needs a wave, room ${o.room}` })),
  ].sort((a, b) => b.at - a.at).slice(0, 5).map((n) => ({ ...n, when: ago(n.at), isNew: daysAgo(n.at) <= 2 }))

  return (
    <Shell
      page={page}
      nav={NAV}
      crumbs={crumbs}
      user={OPERATOR}
      switcher={{ title: 'Rangsit zone', role: `${BRAND} · Operator`, label: 'Rangsit zone, operator. Switch role' }}
      search={{ label: 'Find serial or room', onSubmit: (q) => { setAssetSearch(q); go('/operator/assets') } }}
      notifs={{ title: 'Needs attention', items }}
    >
      {children}
    </Shell>
  )
}
