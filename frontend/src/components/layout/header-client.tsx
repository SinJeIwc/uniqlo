"use client"

import { usePathname } from "next/navigation"
import type { CategoryNavItem } from "@/components/home/types"
import { SidebarProvider } from "@/components/ui/sidebar"
import type { NavItem } from "@/lib/api/categories"
import { useSidebarStore } from "@/store/sidebar"
import { CartButton } from "./header/cart"
import { HeaderLogo } from "./header/logo"
import { Menu } from "./header/menu"
import { NavbarDesktop, NavbarMobile, type TabId } from "./header/navbar"
import { ProfileButtons } from "./header/profile"
import { SearchButton } from "./header/search"
import { SidebarPanel } from "./header/sidebar-panel"

function getActiveTab(pathname: string): TabId | null {
  if (pathname === "/" || pathname.startsWith("/categories/women")) return "women"
  if (pathname.startsWith("/men") || pathname.startsWith("/categories/men")) return "men"
  if (pathname.startsWith("/kids") || pathname.startsWith("/categories/kids")) return "kids"
  if (pathname.startsWith("/baby") || pathname.startsWith("/categories/baby")) return "baby"
  return null
}

function toCategoryNavItems(items: NavItem[]): CategoryNavItem[] {
  return items.map((item) => ({
    text: item.nameRu || item.name,
    href: `/categories/${item.slug}`,
    slug: item.slug,
    image: item.image ?? "",
  }))
}

export function HeaderClient({ navItems }: { navItems: Record<string, NavItem[]> }) {
  const pathname = usePathname()
  const activeTab = getActiveTab(pathname)
  const items = toCategoryNavItems(navItems[activeTab ?? "women"] ?? [])
  const { open, openSidebar, closeSidebar } = useSidebarStore()

  return (
    <SidebarProvider
      open={open}
      onOpenChange={(v) => (v ? openSidebar() : closeSidebar())}
      className="contents"
    >
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
