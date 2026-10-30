import { useEffect, useRef, useState } from 'react'
import { PanelLeft, Bell, Search, ChevronsUpDown, ArrowLeftRight, CircleCheck, TriangleAlert, ChevronRight } from 'lucide-react'
import { BRAND } from '../data.js'
import { Avatar } from '../ui.jsx'
import { useStore } from '../store.jsx'

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

// Dashboard shell shared by landlord and operator (DESIGN §5). The role passes its own config:
// nav: [{ label, items: [{ key, label, href, icon }] }]   crumbs: [{ label, href? }]
// switcher: { title, label, menu?(close) }   search: { label, onSubmit(q) }
// notifs: { title, items: [{ key, href, title, text, when, isNew }] }   user: { name, email, photo }
export function Shell({ page, nav, crumbs, switcher, search, notifs, user, children }) {
  const { toast } = useStore()
  const [collapsed, setCollapsed] = useState(false)
  const [q, setQ] = useState('')
  const [seen, setSeen] = useState(false)
  const input = useRef(null)
  const unread = seen ? 0 : notifs.items.filter((n) => n.isNew).length

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); input.current?.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const submitSearch = (e) => {
    e.preventDefault()
    search.onSubmit(q.trim())
    setQ('')
    input.current.blur()
  }

  return (
    <div className={`dash ${collapsed ? 'collapsed' : ''}`}>
      <aside className="side" aria-label="Sidebar">
        <Popover label={switcher.label} className="switcher" button={<>
          <span className="logo-mark" aria-hidden="true">{BRAND[0]}</span>
          <span className="switcher-text"><strong>{switcher.title}</strong><small>{switcher.role}</small></span>
          <ChevronsUpDown size={16} className="switcher-chev" aria-hidden="true" />
        </>}>
          {(close) => (
            <div className="menu" role="group" aria-label={switcher.menuLabel ?? 'Switch view'}>
              {switcher.menu && <>{switcher.menu(close)}<div className="menu-sep" /></>}
              <a className="menu-item" href="#/"><ArrowLeftRight size={16} aria-hidden="true" />Switch role</a>
            </div>
          )}
        </Popover>

        <nav className="side-nav" aria-label="Main">
          {nav.map((group) => (
            <div key={group.label} className="nav-group">
              <div className="nav-label">{group.label}</div>
              {group.items.map(({ key, label, href, icon: Icon }) => (
                <a key={label} className="nav-item" href={href} aria-current={page === key ? 'page' : undefined} title={collapsed ? label : undefined}>
                  <Icon size={16} aria-hidden="true" /><span className="nav-text">{label}</span>
                </a>
              ))}
            </div>
          ))}
        </nav>

        <div className="user-card" title={collapsed ? user.name : undefined}>
          <Avatar name={user.name} photo={user.photo} />
          <span className="user-text"><strong>{user.name}</strong><small>{user.email}</small></span>
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
            <input ref={input} className="input-d" type="search" value={q} onChange={(e) => setQ(e.target.value)}
              placeholder={`${search.label}…`} aria-label={search.label} />
            <kbd aria-hidden="true">{IS_MAC ? '⌘K' : 'Ctrl K'}</kbd>
          </form>
          <Popover label={`Notifications, ${unread} new`} className="btn-d btn-ghost btn-icon bell" align="end" panelClass="notif-panel"
            onOpen={() => setSeen(true)}
            button={<><Bell size={16} />{unread > 0 && <span className="bell-count" aria-hidden="true">{unread}</span>}</>}>
            {(close) => (
              <div className="menu">
                <div className="menu-label">{notifs.title}</div>
                {notifs.items.map((n) => (
                  <a key={n.key} className="menu-item notif" href={n.href} onClick={close}>
                    {n.isNew ? <span className="new-dot" role="img" aria-label="New" /> : <span className="new-dot" style={{ background: 'none' }} aria-hidden="true" />}
                    <span className="grow"><strong>{n.title}</strong> · {n.text}<small>{n.when}</small></span>
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
