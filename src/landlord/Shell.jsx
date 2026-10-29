import { useEffect, useRef, useState } from 'react'
import {
  PanelLeft, Bell, Search, LayoutDashboard, DoorOpen, ReceiptText, ChevronsUpDown, Check, ArrowLeftRight, CircleCheck, TriangleAlert, ChevronRight,
} from 'lucide-react'
import { BRAND, LANDLORD, ACTIVITY, dormName, initials } from '../data.js'
import { useStore, go } from '../store.jsx'

const NAV = [
  { key: undefined, label: 'Dashboard', href: '#/landlord', icon: LayoutDashboard },
  { key: 'rooms', label: 'Rooms', href: '#/landlord/rooms', icon: DoorOpen },
  { key: 'invoices', label: 'Invoices', href: '#/landlord/invoices', icon: ReceiptText },
]
const IS_MAC = /Mac|iPhone|iPad/.test(navigator.userAgent)

// Button + floating panel. Closes on outside click and Esc. children gets a close() callback.
export function Popover({ button, label, className = 'btn-d btn-ghost', align = 'start', panelClass = '', onOpen, children }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e) => { if (!ref.current.contains(e.target)) setOpen(false) }
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      setOpen(false)
      ref.current.querySelector('button')?.focus()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])
  return (
    <div className="pop" ref={ref}>
      <button type="button" className={className} aria-expanded={open} aria-label={label} onClick={() => { if (!open) onOpen?.(); setOpen(!open) }}>{button}</button>
      {open && <div className={`pop-panel ${align} ${panelClass}`}>{children(() => setOpen(false))}</div>}
    </div>
  )
}

export function PageHeader({ title, desc, action }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {desc && <p className="muted">{desc}</p>}
      </div>
      {action}
    </div>
  )
}

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

export function Shell({ page, sub, children }) {
  const { dorm, setDorm, rooms, setRoomSearch, setInvoiceSearch, toast } = useStore()
  const [collapsed, setCollapsed] = useState(false)
  const [q, setQ] = useState('')
  const [seen, setSeen] = useState(false)
  const search = useRef(null)
  const crumbs = crumbsFor(page, sub, rooms)
  const news = ACTIVITY.filter((a) => a.dorm === dorm)
  const unread = seen ? 0 : news.filter((a) => a.days <= 2).length

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); search.current?.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const submitSearch = (e) => {
    e.preventDefault()
    setRoomSearch(q.trim())
    setQ('')
    search.current.blur()
    go('/landlord/rooms')
  }

  return (
    <div className={`dash ${collapsed ? 'collapsed' : ''}`}>
      <aside className="side" aria-label="Sidebar">
        <Popover label={`Property: ${dormName(dorm)}. Switch property`} className="switcher" button={<>
          <span className="logo-mark" aria-hidden="true">{BRAND[0]}</span>
          <span className="switcher-text"><strong>{dormName(dorm)}</strong><small>{BRAND} · Landlord</small></span>
          <ChevronsUpDown size={16} className="switcher-chev" aria-hidden="true" />
        </>}>
          {(close) => (
            <div className="menu" role="group" aria-label="Properties">
              <div className="menu-label">Properties</div>
              {LANDLORD.dorms.map((id) => (
                <button key={id} type="button" className="menu-item" aria-pressed={dorm === id}
                  onClick={() => { setDorm(id); setRoomSearch(''); setInvoiceSearch(''); close() }}>
                  <span className="grow">{dormName(id)}</span>
                  {dorm === id && <Check size={16} aria-hidden="true" />}
                </button>
              ))}
              <div className="menu-sep" />
              <a className="menu-item" href="#/"><ArrowLeftRight size={16} aria-hidden="true" />Switch role</a>
            </div>
          )}
        </Popover>

        <nav className="side-nav" aria-label="Main">
          <div className="nav-label">Overview</div>
          {NAV.map(({ key, label, href, icon: Icon }) => (
            <a key={label} className="nav-item" href={href} aria-current={page === key ? 'page' : undefined} title={collapsed ? label : undefined}>
              <Icon size={16} aria-hidden="true" /><span className="nav-text">{label}</span>
            </a>
          ))}
        </nav>

        <div className="user-card" title={collapsed ? LANDLORD.name : undefined}>
          <span className="avatar" aria-hidden="true">{initials(LANDLORD.name)}</span>
          <span className="user-text"><strong>{LANDLORD.name}</strong><small>{LANDLORD.email}</small></span>
        </div>
      </aside>

      <div className="main">
        <header className="dash-header">
          <button type="button" className="btn-d btn-ghost btn-icon" onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed}>
            <PanelLeft size={16} />
          </button>
          <span className="vsep" aria-hidden="true" />
          <nav aria-label="Breadcrumb">
            <ol className="dash-crumbs">
              {crumbs.map((c, i) => (
                <li key={c.label}>
                  {i > 0 && <ChevronRight size={14} aria-hidden="true" />}
                  {i < crumbs.length - 1 ? <a href={c.href}>{c.label}</a> : <span aria-current="page">{c.label}</span>}
                </li>
              ))}
            </ol>
          </nav>
          <form className="header-search" role="search" onSubmit={submitSearch}>
            <Search size={16} aria-hidden="true" />
            <input ref={search} className="input-d" type="search" value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search rooms or tenants…" aria-label="Search rooms or tenants" />
            <kbd aria-hidden="true">{IS_MAC ? '⌘K' : 'Ctrl K'}</kbd>
          </form>
          <Popover label={`Notifications, ${unread} new`} className="btn-d btn-ghost btn-icon bell" align="end" panelClass="notif-panel"
            onOpen={() => setSeen(true)}
            button={<><Bell size={16} />{unread > 0 && <span className="bell-count" aria-hidden="true">{unread}</span>}</>}>
            {(close) => (
                <div className="menu">
                  <div className="menu-label">Recent activity · {dormName(dorm)}</div>
                  {news.slice(0, 4).map((a) => (
                    <a key={a.room + a.text} className="menu-item notif" href={`#/landlord/rooms/${a.dorm}-${a.room}`} onClick={close}>
                      {a.days <= 2 ? <span className="new-dot" role="img" aria-label="New" /> : <span className="new-dot" style={{ background: 'none' }} aria-hidden="true" />}
                      <span className="grow"><strong>Room {a.room}</strong> · {a.text}<small>{a.days === 0 ? 'Today' : `${a.days} day${a.days > 1 ? 's' : ''} ago`}</small></span>
                    </a>
                  ))}
                </div>
            )}
          </Popover>
        </header>

        <main className="dash-content">{children}</main>
      </div>

      {toast && (
        <div className={`toast dash-toast ${toast.tone === 'error' ? 'error' : ''}`} role="status" key={toast.key}>
          {toast.tone === 'error' ? <TriangleAlert size={16} /> : <CircleCheck size={16} />}
          {toast.text}
        </div>
      )}
    </div>
  )
}
