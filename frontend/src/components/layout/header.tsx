import { getAllNavCategories, type NavItem } from "@/lib/api/categories"
import { HeaderClient } from "./header-client"

export async function Header() {
  const all = await getAllNavCategories()

  const navItems = {
    women: [] as NavItem[],
    men: [] as NavItem[],
    kids: [] as NavItem[],
    baby: [] as NavItem[],
  }
  for (const item of all) {
    if (item.gender in navItems) navItems[item.gender as keyof typeof navItems].push(item)
  }

  return <HeaderClient navItems={navItems} />
}
