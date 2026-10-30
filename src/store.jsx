import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { SCENARIOS, getProduct, ROOMS, LANDLORD, ORDERS, ASSETS, TICKETS, EXITS, TODAY, NOTICE_DAYS, addDays, exitFor } from './data.js'

// ---------- hash router: "#/tenant/item/fridge" -> ['tenant','item','fridge'] ----------
const readHash = () => window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean)

export function useRoute() {
  const [parts, setParts] = useState(readHash)
  useEffect(() => {
    // Landlord room sheets open over the rooms table, so keep the table's scroll position.
    const overlay = (p) => p[0] === 'landlord' && p[1] === 'rooms'
    let prev = readHash()
    const on = () => {
      const next = readHash()
      if (!(overlay(prev) && overlay(next))) window.scrollTo(0, 0)
      prev = next
      setParts(next)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return parts
}

export const go = (path) => { window.location.hash = path }

// ---------- app state: cart, subscription, toast ----------
const Store = createContext(null)
export const useStore = () => useContext(Store)

export function StoreProvider({ children }) {
  const [scenario, setScenarioKey] = useState('mid')
  const [subscription, setSubscription] = useState(SCENARIOS.mid.subscription)
  const [cart, setCart] = useState({ ids: [], term: 6 })
  const [toast, setToast] = useState(null)
  const [lastOrder, setLastOrder] = useState(null)
  // landlord
  const [rooms, setRooms] = useState(ROOMS)
  const [dorm, setDorm] = useState(LANDLORD.dorms[0])
  const [roomSearch, setRoomSearch] = useState('')
  const [invoiceSearch, setInvoiceSearch] = useState('')
  // operator
  const [orders, setOrders] = useState(ORDERS)
  const [assets, setAssets] = useState(ASSETS)
  const [tickets, setTickets] = useState(TICKETS)
  const [exits, setExits] = useState(EXITS)
  const [assetSearch, setAssetSearch] = useState('')

  const showToast = useCallback((text, tone = 'success') => {
    setToast({ text, tone, key: Date.now() })
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2800)
    return () => clearTimeout(t)
  }, [toast])

  const cartItems = cart.ids.map(getProduct)
  const cartTotal = cartItems.reduce((s, p) => s + p.price, 0)
  const cartSkus = cartItems.flatMap((p) => p.items)
  const ownedSkus = subscription ? subscription.productIds.flatMap((id) => getProduct(id).items) : []

  // Returns an error message, or null when added.
  const addToCart = (id) => {
    const p = getProduct(id)
    if (cart.ids.includes(id)) return 'Already in your cart'
    const overlap = p.items.find((i) => cartSkus.includes(i))
    if (overlap) return 'Your cart already has one of these items'
    if (p.items.some((i) => ownedSkus.includes(i))) return 'You already rent this item'
    setCart((c) => ({ ...c, ids: [...c.ids, id] }))
    return null
  }

  // Tenant reports land on the operator's boards. Returns the new ticket id.
  const addTicket = ({ dorm, room, sku, title, detail, type }) => {
    const id = `T-${2092 + tickets.length - TICKETS.length}`
    const r = rooms.find((x) => x.id === `${dorm}-${room}`)
    const priority = { fault: 'high', damage: 'medium', wear: 'low' }[type]
    setTickets((ts) => [{ id, roomId: `${dorm}-${room}`, dorm, room, tenant: r?.tenant ?? 'Demo tenant', photo: r?.photo, sku, title, detail, type, priority, created: TODAY, stage: 'new' }, ...ts])
    return id
  }
  // Leave early: the room enters its notice period (landlord sees it too) and the request joins the exit queue.
  const addExit = ({ dorm, room, productIds, start, term, path, detail }) => {
    const roomId = `${dorm}-${room}`
    const r = rooms.find((x) => x.id === roomId) ?? { id: roomId, dorm, room, tenant: 'Demo tenant' }
    const moveOut = addDays(TODAY, NOTICE_DAYS)
    setRooms((rs) => rs.map((x) => (x.id === roomId ? { ...x, status: 'notice', moveOut } : x)))
    setExits((xs) => [exitFor({ ...r, productIds, start, term, moveOut }, path, detail, 'pending', `X-${301 + xs.length}`), ...xs.filter((x) => x.roomId !== roomId)])
  }

  const value = {
    scenario,
    setScenario: (key) => { setScenarioKey(key); setSubscription(SCENARIOS[key].subscription) },
    subscription, setSubscription,
    cart, cartItems, cartTotal, addToCart,
    removeFromCart: (id) => setCart((c) => ({ ...c, ids: c.ids.filter((x) => x !== id) })),
    setTerm: (term) => setCart((c) => ({ ...c, term })),
    clearCart: () => setCart({ ids: [], term: 6 }),
    lastOrder, setLastOrder,
    toast, showToast,
    rooms, setRooms, dorm, setDorm, roomSearch, setRoomSearch, invoiceSearch, setInvoiceSearch,
    orders, setOrders, assets, setAssets, tickets, setTickets, exits, setExits, assetSearch, setAssetSearch, addTicket, addExit,
  }
  return <Store.Provider value={value}>{children}</Store.Provider>
}
