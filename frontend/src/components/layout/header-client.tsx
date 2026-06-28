"use client"

import { usePathname } from "next/navigation"
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar"
import type { NavItem } from "@/lib/api/categories"
import { CartButton } from "./header/cart"
import { HeaderLogo } from "./header/logo"
import { Menu } from "./header/menu"
import { NavbarDesktop, NavbarMobile, type TabId } from "./header/navbar"
import { ProfileButtons } from "./header/profile"
import { SearchButton } from "./header/search"
import { SidebarDesktop } from "./header/sidebar/sidebar-desktop"
import { SidebarMobile } from "./header/sidebar/sidebar-mobile"

function getActiveTab(pathname: string): TabId | null {
  if (pathname === "/" || pathname.startsWith("/categories/women")) return "women"
  if (pathname.startsWith("/men") || pathname.startsWith("/categories/men")) return "men"
  if (pathname.startsWith("/kids") || pathname.startsWith("/categories/kids")) return "kids"
  if (pathname.startsWith("/baby") || pathname.startsWith("/categories/baby")) return "baby"
  return null
}

function SidebarPanel({ activeTab, items }: { activeTab: TabId | null; items: NavItem[] }) {
  const { isMobile } = useSidebar()
  return isMobile ? (
    <SidebarMobile activeTab={activeTab} items={items} />
  ) : (
    <SidebarDesktop activeTab={activeTab} items={items} />
  )
}

export function HeaderClient({ navItems }: { navItems: Record<string, NavItem[]> }) {
  const pathname = usePathname()
  const activeTab = getActiveTab(pathname)
  const items = navItems[activeTab ?? "women"] ?? []

  return (
    <SidebarProvider defaultOpen={false} className="contents">
      <header className="fixed top-0 left-0 right-0 z-40 w-full text-white bg-linear-to-b from-black/40 to-transparent drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
        <div className="container mx-auto px-1 lg:px-4.5 xl:px-9 h-14 lg:h-16 flex items-center text-shadow-current">
          <HeaderLogo />
          <NavbarDesktop activeTab={activeTab} />
          <SearchButton />
          <ProfileButtons />
          <CartButton />
          <Menu />
        </div>
        <NavbarMobile activeTab={activeTab} />
      </header>
      <SidebarPanel activeTab={activeTab} items={items} />
    </SidebarProvider>
  )
}
