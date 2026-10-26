import { Navigate, Outlet, useLocation } from "react-router"

import { useAuth } from "@/entities/user"

export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Sinon un F5 renverrait vers /login avant la réponse de `/users/me`.
  if (isLoading) return null

  if (!isAuthenticated) {
    // `replace` : « précédent » ne revient pas ici. `from` : lu par `RequireGuest`.
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
