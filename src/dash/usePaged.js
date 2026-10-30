import { useState } from 'react'

// Client-side paging for dashboard tables. reset() goes back to page 1 after a filter change.
export function usePaged(items) {
  const [page, setPage] = useState(0)
  const [per, setPer] = useState(10)
  const pages = Math.max(1, Math.ceil(items.length / per))
  const p = Math.min(page, pages - 1)
  return { shown: items.slice(p * per, (p + 1) * per), reset: () => setPage(0), pager: { count: items.length, page: p, pages, setPage, per, setPer } }
}
