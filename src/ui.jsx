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

export function Sheet({ title, onClose, children }) {
  const ref = useRef(null)
  useEffect(() => {
    const prev = document.activeElement
    ref.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); prev?.focus?.() }
  }, [onClose])
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip" />
        <div className="sheet-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Stepper({ steps, current }) {
  return (
    <ol className="stepper" aria-label="Checkout progress" style={{ listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
      {steps.map((s, i) => (
        <li key={s} className={`step ${i < current ? 'done' : ''} ${i === current ? 'on' : ''}`} aria-current={i === current ? 'step' : undefined}>
          {i + 1}. {s}
        </li>
      ))}
    </ol>
  )
}
