import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { setNavigator } from './utils/navigate.util'

function App() {
  const navigate = useNavigate()

  useEffect(() => {
    setNavigator(navigate)
  }, [navigate])

  return <Outlet />
}

export default App
