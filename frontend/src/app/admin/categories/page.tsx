"use client"

import { useCallback, useEffect, useState } from "react"
import { CategoryEditForm } from "@/components/admin/categories/CategoryEditForm"
import { CategoryTree } from "@/components/admin/categories/CategoryTree"
import type { CategoryNode } from "@/components/admin/categories/types"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const GENDERS = ["women", "men", "kids", "baby"] as const

export default function AdminCategoriesPage() {
  const [gender, setGender] = useState<string>("women")
  const [tree, setTree] = useState<CategoryNode[]>([])
  const [selected, setSelected] = useState<CategoryNode | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchTree = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/categories?gender=${gender}`)
      const data = await res.json()
      setTree(data)
      // Keep selection if still in new tree
      if (selected) {
        const found = findById(data, selected.id)
        setSelected(found || null)
      }
    } finally {
      setLoading(false)
    }
  }, [gender, selected?.id])

  useEffect(() => {
    fetchTree()
  }, [fetchTree])

  function findById(nodes: CategoryNode[], id: number): CategoryNode | null {
    for (const n of nodes) {
      if (n.id === id) return n
      if (n.children) {
        const found = findById(n.children, id)
        if (found) return found
      }
    }
    return null
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Категории</h1>
        <p className="text-sm text-muted-foreground mt-1">Управление деревом категорий</p>
      </div>
      <Separator />
      <Tabs value={gender} onValueChange={setGender}>
        <TabsList>
          {GENDERS.map((g) => (
            <TabsTrigger key={g} value={g}>
              {g}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <div className="border border-border rounded-lg bg-card max-h-[70vh] overflow-auto">
          {loading ? (
            <p className="text-sm text-muted-foreground p-4">Загрузка...</p>
          ) : (
            <CategoryTree nodes={tree} selectedId={selected?.id ?? null} onSelect={setSelected} />
          )}
        </div>
        <div>
          <CategoryEditForm category={selected} onSave={fetchTree} />
        </div>
      </div>
    </div>
  )
}
