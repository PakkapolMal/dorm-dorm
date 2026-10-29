import { useEffect, useRef, useState } from 'react'
import { X, Check } from 'lucide-react'
import { SKUS } from './data.js'

// <img> that swaps to `fallback` if the file fails to load.
export function Photo({ src, alt, fallback, eager }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) return fallback
  return <img className="photo" src={src} alt={alt} loading={eager ? undefined : 'lazy'} fetchPriority={eager ? 'high' : undefined} decoding="async" onError={() => setFailed(true)} />
}

export function Icons({ ids, size, label }) {
  return (
    <div className="icons" {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}>
      {ids.map((id) => { const Icon = SKUS[id].icon; return <Icon key={id} size={size} strokeWidth={1.5} aria-hidden="true" /> })}
    </div>
  )
}

// Product photo on a muted tile (icons if the photo is missing).
export function ProductTile({ product, size = 40, className = '', eager, children }) {
  return (
    <div className={`tile ${className}`}>
      <Photo src={product.image} alt={product.name} eager={eager} fallback={<Icons ids={product.items} size={size} label={product.name} />} />
      {children}
    </div>
  )
}

// Swipeable photo panel for item detail. Bundles: scene photo first, then each item.
// Native scroll-snap does the swiping; thumbnails jump to a slide and mirror the current one.
export function Gallery({ product, badge }) {
  const track = useRef(null)
  const [active, setActive] = useState(0)
  const slides = product.kind === 'bundle'
    ? [{ id: 'scene', name: product.name, image: product.image, items: product.items },
       ...product.items.map((i) => ({ id: i, name: SKUS[i].name, image: SKUS[i].image, items: [i], contain: true }))]
    : [{ id: product.id, name: product.name, image: product.image, items: product.items }]

  const onScroll = () => {
    const el = track.current
    setActive(Math.round(el.scrollLeft / el.clientWidth))
  }
  const show = (n) => track.current.scrollTo({
    left: n * track.current.clientWidth,
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  })

  return (
    <>
      <div className={`gallery ${product.kind}`}>
        <div className="gallery-track" ref={track} onScroll={onScroll} tabIndex={slides.length > 1 ? 0 : undefined}
          aria-roledescription={slides.length > 1 ? 'carousel' : undefined} aria-label={`Photos of ${product.name}`}>
          {slides.map((s, n) => (
            <div key={s.id} className={`tile gallery-slide ${s.contain ? 'contain' : ''}`} role="group"
              aria-roledescription={slides.length > 1 ? 'slide' : undefined}
              aria-label={slides.length > 1 ? `${n + 1} of ${slides.length}: ${s.name}` : undefined}>
              <Photo src={s.image} alt={s.name} eager={n === 0} fallback={<Icons ids={s.items} size={72} label={s.name} />} />
            </div>
          ))}
        </div>
        {badge && <span className="tile-badge gallery-badge">{badge}</span>}
        {slides.length > 1 && <span className="gallery-count num" aria-hidden="true">{active + 1} / {slides.length}</span>}
      </div>
      {slides.length > 1 && (
        <div className="thumbs" role="group" aria-label="Choose photo">
          {slides.map((s, n) => (
            <button key={s.id} type="button" className="thumb" aria-label={`Show ${s.name}`} aria-current={active === n}
              onClick={() => show(n)}>
              <Photo src={s.image} alt="" fallback={<Icons ids={s.items} size={s.items.length > 2 ? 14 : 20} />} />
            </button>
          ))}
        </div>
      )}
    </>
  )
}

// Pass `sku` for one item, or `product` for a bundle.
export function ItemThumb({ sku, product }) {
  const p = product ?? { image: SKUS[sku].image, name: SKUS[sku].name, items: [sku] }
  const size = p.items.length > 2 ? 14 : p.items.length === 2 ? 18 : 24
  return (
    <div className="item-thumb">
      <Photo src={p.image} alt="" fallback={<Icons ids={p.items} size={size} />} />
    </div>
  )
}

// Round person photo; initials if the photo is missing. Decorative: the name is always shown beside it.
export function Avatar({ name, photo, children }) {
  return (
    <span className="avatar" aria-hidden="true">
      <Photo src={photo} alt="" fallback={children ?? name.split(' ').map((w) => w[0]).join('').slice(0, 2)} />
    </span>
  )
}

export function Badge({ tone = 'neutral', children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

export function Banner({ tone = 'info', icon: Icon, children }) {
  return (
    <div className={`banner banner-${tone}`} role={tone === 'danger' || tone === 'warning' ? 'alert' : undefined}>
      {Icon && <Icon size={18} aria-hidden="true" />}
      <div>{children}</div>
    </div>
  )
}

export function Benefits({ items }) {
  return (
    <ul className="benefits">
      {items.map((t) => <li key={t}><Check size={16} aria-hidden="true" />{t}</li>)}
    </ul>
  )
}

// Radio option card. `children` shows only when selected (expanding panel).
export function Option({ name, value, checked, onChange, label, sub, price, children }) {
  return (
    <label className="option">
      <div className="option-head">
        <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} />
        <span className="option-label"><strong>{label}</strong>{sub && <small>{sub}</small>}</span>
        {price != null && <span className="option-price">{price}</span>}
      </div>
      {checked && children && <div className="option-body">{children}</div>}
    </label>
  )
}

// side: right drawer for the desktop dashboard; default is the mobile bottom sheet.
export function Sheet({ title, onClose, side, children }) {
  const ref = useRef(null)
  const close = useRef(onClose)
  useEffect(() => { close.current = onClose })
  // Runs once per open, so re-renders with a new onClose don't steal focus back to the sheet.
  useEffect(() => {
    const prev = document.activeElement
    ref.current?.focus()
    const onKey = (e) => e.key === 'Escape' && close.current()
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); prev?.focus?.() }
  }, [])
  return (
    <div className={`sheet-backdrop ${side ? 'sheet-right' : ''}`} onClick={onClose}>
      <div className={side ? 'sheet sheet-side' : 'sheet'} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref} onClick={(e) => e.stopPropagation()}>
        {!side && <div className="sheet-grip" />}
        <div className="sheet-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Stepper({ steps, current, label = 'Checkout progress' }) {
  return (
    <ol className="stepper" aria-label={label} style={{ listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
      {steps.map((s, i) => (
        <li key={s} className={`step ${i < current ? 'done' : ''} ${i === current ? 'on' : ''}`} aria-current={i === current ? 'step' : undefined}>
          {i + 1}. {s}
        </li>
      ))}
    </ol>
  )
}
