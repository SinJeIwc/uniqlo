import { Badge } from "@/components/ui/badge"
import type { CategoryNode } from "./types"

interface Props {
  nodes: CategoryNode[]
}

export function CategoryStats({ nodes }: Props) {
  const stats: Record<
    string,
    { total: number; sections: number; features: number; categories: number }
  > = {}

  function walk(list: CategoryNode[]) {
    for (const n of list) {
      const g = n.gender
      if (!stats[g]) stats[g] = { total: 0, sections: 0, features: 0, categories: 0 }
      stats[g].total++
      if (n.kind === "section") stats[g].sections++
      else if (n.kind === "feature") stats[g].features++
      else stats[g].categories++
      if (n.children) walk(n.children)
    }
  }
  walk(nodes)

  return (
    <div className="flex flex-wrap gap-3">
      {Object.entries(stats).map(([gender, s]) => (
        <Badge key={gender} variant="secondary" className="text-xs h-auto py-1.5 px-3 gap-2">
          <span className="font-medium capitalize">{gender}</span>
          <span className="font-mono font-bold">{s.total}</span>
          <span className="text-muted-foreground text-[10px]">
            S:{s.sections} F:{s.features} C:{s.categories}
          </span>
        </Badge>
      ))}
    </div>
  )
}
