import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import LoginPage from '@/pages/login/LoginPage'

// Créé une seule fois, hors du rendu React.
const router = createBrowserRouter([
  { path: '/', Component: DashboardPage },
  { path: '/login', Component: LoginPage },
])

function App() {
  return (
    <TooltipProvider>
      <RouterProvider router={router} />
      <Toaster />
    </TooltipProvider>
  )
}

export default App
