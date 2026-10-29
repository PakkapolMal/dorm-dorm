import { useEffect, useRef } from 'react'
import { X, Check } from 'lucide-react'
import { SKUS } from './data.js'

// Placeholder "photo": the product's icons on a muted tile.
export function ProductTile({ product, size = 40, className = '', children }) {
  return (
    <div className={`tile ${className}`} role="img" aria-label={product.name}>
      <div className="icons">
        {product.items.map((id) => {
          const Icon = SKUS[id].icon
          return <Icon key={id} size={size} strokeWidth={1.5} aria-hidden="true" />
        })}
      </div>
      {children}
    </div>
  )
}

// Pass `sku` for one item, or `product` to show every item of a bundle.
export function ItemThumb({ sku, product }) {
  const ids = product ? product.items : [sku]
  const size = ids.length > 2 ? 14 : ids.length === 2 ? 18 : 24
  return (
    <div className="item-thumb" style={ids.length > 1 ? { display: 'flex', flexWrap: 'wrap', gap: 2, alignContent: 'center', justifyContent: 'center', padding: 4 } : undefined}>
      {ids.map((id) => { const Icon = SKUS[id].icon; return <Icon key={id} size={size} strokeWidth={1.5} aria-hidden="true" /> })}
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
