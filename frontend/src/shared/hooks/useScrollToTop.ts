import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Hook to automatically scroll the window to the top (0, 0)
 * whenever the route pathname or search parameters change.
 */
export function useScrollToTop() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    })
  }, [pathname, search])
}

export default useScrollToTop
