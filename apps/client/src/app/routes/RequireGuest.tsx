import { Navigate, Outlet, useLocation } from "react-router"

import { useAuth } from "@/entities/user"

export function RequireGuest() {
  const { isAuthenticated, isLoading } = useAuth()
  const from = useLocation().state?.from?.pathname ?? "/"

  if (isLoading) return null

  if (isAuthenticated) return <Navigate to={from} replace />

  return <Outlet />
}
