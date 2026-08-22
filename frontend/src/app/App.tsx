import { Outlet, ScrollRestoration } from 'react-router-dom'
import { useScrollToTop } from '@/shared/hooks'

function App() {
  useScrollToTop()

  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  )
}

export default App
