import * as React from "react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, BeerIcon, FactoryIcon, StoreIcon, MessageSquareIcon, CameraIcon, FileTextIcon, Settings2Icon, CircleHelpIcon, SearchIcon, TagIcon, WheatIcon, HeartIcon } from "lucide-react"

const data = {
  user: {
    name: "Julien Lemarchand",
    email: "julien@zythologue.fr",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Tableau de bord",
      url: "#",
      icon: (
        <LayoutDashboardIcon
        />
      ),
    },
    {
      title: "Bières",
      url: "#",
      icon: (
        <BeerIcon
        />
      ),
    },
    {
      title: "Brasseries",
      url: "#",
      icon: (
        <FactoryIcon
        />
      ),
    },
    {
      title: "Points de vente",
      url: "#",
      icon: (
        <StoreIcon
        />
      ),
    },
    {
      title: "Avis",
      url: "#",
      icon: (
        <MessageSquareIcon
        />
      ),
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: (
        <CameraIcon
        />
      ),
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: (
        <FileTextIcon
        />
      ),
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: (
        <FileTextIcon
        />
      ),
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Paramètres",
      url: "#",
      icon: (
        <Settings2Icon
        />
      ),
    },
    {
      title: "Aide",
      url: "#",
      icon: (
        <CircleHelpIcon
        />
      ),
    },
    {
      title: "Recherche",
      url: "#",
      icon: (
        <SearchIcon
        />
      ),
    },
  ],
  documents: [
    {
      name: "Catégories",
      url: "#",
      icon: (
        <TagIcon
        />
      ),
    },
    {
      name: "Ingrédients",
      url: "#",
      icon: (
        <WheatIcon
        />
      ),
    },
    {
      name: "Mes favoris",
      url: "#",
      icon: (
        <HeartIcon
        />
      ),
    },
  ],
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="#" />}
            >
              <BeerIcon className="size-5!" />
              <span className="text-base font-semibold">Zythologue</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
