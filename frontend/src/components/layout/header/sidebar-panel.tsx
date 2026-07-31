"use client"

import { useEffect, useState } from "react"
import type { CategoryNavItem } from "@/components/home/types"
import { CategoryGrid } from "@/components/shared/category/CategoryGrid"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { HeaderLogo } from "./logo"
import { NavbarDesktop, NavbarMobile, type TabId } from "./navbar"
import { SearchButton } from "./search"

const SM = 640

function useMobile() {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${SM - 1}px)`)
    const onChange = () => setMobile(mql.matches)
    mql.addEventListener("change", onChange)
    setMobile(mql.matches)
    return () => mql.removeEventListener("change", onChange)
  }, [])
  return mobile
}

interface SidebarPanelProps {
  activeTab: TabId | null
  items: CategoryNavItem[]
}

export function SidebarPanel({ activeTab, items }: SidebarPanelProps) {
  const { setOpen } = useSidebar()
  const isMobile = useMobile()
  const close = () => setOpen(false)

  return (
    <Sidebar side={isMobile ? "right" : "top"}>
      <SidebarHeader>
        <div className="container mx-auto px-1 lg:px-4.5 xl:px-9 h-14 lg:h-16 flex items-center">
          <HeaderLogo />
          <NavbarDesktop activeTab={activeTab} variant="sidebar" />
          <SidebarTrigger className="text-foreground" />
        </div>
        <NavbarMobile activeTab={activeTab} variant="sidebar" />
      </SidebarHeader>

      <SidebarContent className="container mx-auto px-1 lg:px-4.5 xl:px-9">
        <SearchButton />

        <CategoryGrid items={items} onClose={close} />
      </SidebarContent>
    </Sidebar>
  )
}
