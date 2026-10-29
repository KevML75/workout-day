import { useEffect, useState } from 'react'

export type Route = 'today' | 'history'

function current(): Route {
  return location.hash === '#history' ? 'history' : 'today'
}

/** Tiny hash router, so the browser/iOS back gesture works and no server config is needed. */
export function useHashRoute(): Route {
  const [route, setRoute] = useState(current)

  useEffect(() => {
    const onChange = () => {
      setRoute(current())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}
