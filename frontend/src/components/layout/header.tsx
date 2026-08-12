import { getAllNavCategories, type NavItem } from "@/lib/api/categories"
import { HeaderClient } from "./header-client"

export async function Header({ variant = "transparent" }: { variant?: "transparent" | "solid" }) {
  const all = await getAllNavCategories()

  const navItems: Record<string, NavItem[]> = { women: [], men: [], kids: [], baby: [] }
  for (const item of all) {
    const g = item.gender.toLowerCase()
    if (g in navItems) navItems[g].push(item)
  }

  return <HeaderClient navItems={navItems} variant={variant} />
}
