"use client"

import { useState } from "react"
import { CategoryStats } from "@/components/admin/categories/CategoryStats"
import { CategoryTreeView } from "@/components/admin/categories/CategoryTreeView"
import type { CategoryNode } from "@/components/admin/categories/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const GENDERS = ["women", "men", "kids", "baby"] as const

interface Props {
  genderTrees: Record<string, CategoryNode[]>
}

export function ClientPage({ genderTrees }: Props) {
  const [tab, setTab] = useState<string>("women")

  const allNodes = Object.values(genderTrees).flat()
  const currentNodes = genderTrees[tab] || []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
      </div>

      <CategoryStats nodes={allNodes} />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {GENDERS.map((g) => (
            <TabsTrigger key={g} value={g} className="capitalize text-sm px-5">
              {g}
            </TabsTrigger>
          ))}
        </TabsList>

        {GENDERS.map((g) => (
          <TabsContent key={g} value={g} className="mt-5">
            <CategoryTreeView nodes={currentNodes} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
