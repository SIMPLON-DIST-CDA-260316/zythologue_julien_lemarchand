import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { AuthProvider } from '@/entities/user'
import { BeersPage } from '@/pages/beers'
import { DashboardPage } from '@/pages/dashboard'
import { LoginPage } from '@/pages/login'
import { NotFoundPage } from '@/pages/not-found'
import { RegisterPage } from '@/pages/register'
import { Toaster } from '@/shared/ui/sonner'
import { TooltipProvider } from '@/shared/ui/tooltip'
import { AppLayout, type RouteHandle } from './layouts/AppLayout'
import { RequireAuth } from './routes/RequireAuth'
import { RequireGuest } from './routes/RequireGuest'

// Créé une seule fois, hors du rendu React.
const router = createBrowserRouter([
  {
    Component: RequireAuth,
    children: [
      {
        Component: AppLayout,
        children: [
          {
            path: '/',
            Component: DashboardPage,
            handle: { title: 'Tableau de bord' } satisfies RouteHandle,
          },
          {
            path: '/beers',
            Component: BeersPage,
            handle: { title: 'Bières' } satisfies RouteHandle,
          },
        ],
      },
    ],
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
