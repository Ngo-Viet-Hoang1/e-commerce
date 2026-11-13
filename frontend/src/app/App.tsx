import { Outlet, ScrollRestoration } from 'react-router-dom'
import { useScrollToTop } from '@/shared/hooks'
import { ServerWarmupGate } from '@/shared/ui/ServerWarmupGate'

function App() {
  useScrollToTop()

  return (
    <ServerWarmupGate>
      <ScrollRestoration />
      <Outlet />
    </ServerWarmupGate>
  )
}

export default App
