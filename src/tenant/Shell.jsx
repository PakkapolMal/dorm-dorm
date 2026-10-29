import { ChevronLeft, ShoppingCart, ShoppingBag, House, Receipt, CircleHelp, CircleCheck, TriangleAlert } from 'lucide-react'
import { BRAND } from '../data.js'
import { useStore } from '../store.jsx'

const TABS = [
  { key: 'shop', label: 'Shop', href: '#/tenant', icon: ShoppingBag },
  { key: 'room', label: 'My Room', href: '#/tenant/room', icon: House },
  { key: 'bills', label: 'Bills', href: '#/tenant/bills', icon: Receipt },
  { key: 'help', label: 'Help', href: '#/tenant/help', icon: CircleHelp },
]

// Every tenant page renders inside this: top bar, content, optional sticky action bar, tab bar.
export function Page({ tab, back, action, flush, children }) {
  const { cartItems, toast } = useStore()
  return (
    <div className="phone">
      <header className="topbar">
        {back
          ? <a className="icon-btn" href={back} aria-label="Back"><ChevronLeft size={22} /></a>
          : <span />}
        <a className="logo" href="#/tenant">{BRAND}</a>
        <a className="icon-btn" href="#/tenant/cart" aria-label={`Cart, ${cartItems.length} items`}>
          <ShoppingCart size={22} />
          {cartItems.length > 0 && <span className="cart-count" aria-hidden="true">{cartItems.length}</span>}
        </a>
      </header>

      <main className={`content ${flush ? 'flush' : ''}`}>{children}</main>

      <div className="bottom">
        {action}
        <nav className="tabbar" aria-label="Main">
          {TABS.map(({ key, label, href, icon: Icon }) => (
            <a key={key} className="tab" href={href} aria-current={tab === key ? 'page' : undefined}>
              <span className="pill"><Icon size={20} aria-hidden="true" /></span>
              {label}
            </a>
          ))}
        </nav>
      </div>

      {toast && (
        <div className="toast" role="status" key={toast.key}>
          {toast.tone === 'error' ? <TriangleAlert size={18} /> : <CircleCheck size={18} />}
          {toast.text}
        </div>
      )}
    </div>
  )
}

export function ActionBar({ label, value, children }) {
  return (
    <div className="action-bar">
      <div className="total">
        <small>{label}</small>
        <strong className="num">{value}</strong>
      </div>
      {children}
    </div>
  )
}
