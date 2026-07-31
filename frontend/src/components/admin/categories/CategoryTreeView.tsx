"use client"

import { SearchIcon } from "lucide-react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CategoryDetail } from "./CategoryDetail"
import { CategoryTreeNode } from "./CategoryTreeNode"
import type { CategoryNode } from "./types"

interface Props {
  nodes: CategoryNode[]
}

export function CategoryTreeView({ nodes }: Props) {
  const [selected, setSelected] = useState<CategoryNode | null>(null)
  const [search, setSearch] = useState("")

  function filterTree(list: CategoryNode[], q: string): CategoryNode[] {
    if (!q) return list
    const lower = q.toLowerCase()
    const result: CategoryNode[] = []
    for (const node of list) {
      const match =
        node.name.toLowerCase().includes(lower) || node.slug.toLowerCase().includes(lower)
      const filteredChildren = node.children ? filterTree(node.children, q) : []
      if (match || filteredChildren.length > 0) {
        result.push({
          ...node,
          children: filteredChildren.length ? filteredChildren : node.children,
        })
      }
    }
    return result
  }

  const filtered = filterTree(nodes, search)

  return (
    <div className="flex gap-5 items-start">
      {/* Tree panel */}
      <Card className="w-80 shrink-0 overflow-hidden flex flex-col max-h-[calc(100vh-16rem)]">
        <div className="p-3 border-b border-border">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Filter categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 py-1">
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground p-4 text-center">
              {search ? "No matches" : "No categories"}
            </p>
          ) : (
            filtered.map((node) => (
              <CategoryTreeNode
                key={node.id}
                node={node}
                depth={0}
                selectedId={selected?.id ?? null}
                onSelect={setSelected}
              />
            ))
          )}
        </div>
      </Card>

      {/* Detail panel */}
      <div className="flex-1 min-w-0">
        <CategoryDetail category={selected} />
      </div>
    </div>
  )
}
