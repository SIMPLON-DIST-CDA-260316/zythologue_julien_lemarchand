import { Outlet, useMatches } from "react-router"

import { SidebarInset, SidebarProvider } from "@/shared/ui/sidebar"

import { AppSidebar } from "./app-sidebar"
import { SiteHeader } from "./site-header"

export type RouteHandle = { title: string }

export function AppLayout() {
  // Le titre est déclaré avec la route : une page ne peut pas importer `app/`.
  const handle = useMatches().at(-1)?.handle as RouteHandle | undefined

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={handle?.title} />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
