import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { AuthProvider } from '@/entities/user'
import { DashboardPage } from '@/pages/dashboard'
import { LoginPage } from '@/pages/login'
import { NotFoundPage } from '@/pages/not-found'
import { RegisterPage } from '@/pages/register'
import { Toaster } from '@/shared/ui/sonner'
import { TooltipProvider } from '@/shared/ui/tooltip'
import { RequireAuth } from './routes/RequireAuth'
import { RequireGuest } from './routes/RequireGuest'

// Créé une seule fois, hors du rendu React.
const router = createBrowserRouter([
  {
    Component: RequireAuth,
    children: [{ path: '/', Component: DashboardPage }],
  },
  {
    Component: RequireGuest,
    children: [
      { path: '/login', Component: LoginPage },
      { path: '/register', Component: RegisterPage },
    ],
  },
  { path: '*', Component: NotFoundPage },
])

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <RouterProvider router={router} />
        <Toaster />
      </TooltipProvider>
    </AuthProvider>
  )
}

export default App
