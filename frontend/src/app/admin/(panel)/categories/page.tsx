import { asc } from "drizzle-orm"
import type { CategoryNode } from "@/components/admin/categories/types"
import { db } from "@/db"
import { categories } from "@/db/schema"

function buildTree(flat: (typeof categories.$inferSelect)[]): CategoryNode[] {
  const map = new Map<number, CategoryNode>()
  const roots: CategoryNode[] = []

  for (const row of flat) {
    map.set(row.id, { ...row, children: [] })
  }

  for (const node of map.values()) {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)?.children?.push(node)
    } else {
      roots.push(node)
    }
  }

  const kindOrder: Record<string, number> = { section: 0, feature: 1, category: 2 }
  const sortNodes = (list: CategoryNode[]) => {
    list.sort((a, b) => {
      const ka = kindOrder[a.kind] ?? 9
      const kb = kindOrder[b.kind] ?? 9
      if (ka !== kb) return ka - kb
      if ((a.navOrder ?? 0) !== (b.navOrder ?? 0)) return (a.navOrder ?? 0) - (b.navOrder ?? 0)
      return a.name.localeCompare(b.name)
    })
    for (const n of list) {
      if (n.children) sortNodes(n.children)
    }
  }
  sortNodes(roots)

  return roots
}

const _GENDERS = ["women", "men", "kids", "baby"] as const

export default async function AdminCategoriesPage() {
  const rows = db
    .select()
    .from(categories)
    .orderBy(asc(categories.gender), asc(categories.navOrder))
    .all()

  const tree = buildTree(rows)

  // Group by gender for tabs
  const genderTrees: Record<string, CategoryNode[]> = { women: [], men: [], kids: [], baby: [] }
  for (const node of tree) {
    const g = node.gender.toLowerCase()
    if (genderTrees[g]) genderTrees[g].push(node)
  }

  return <ClientPage genderTrees={genderTrees} />
}

// Client boundary for tabs interactivity
import { ClientPage } from "./client"
