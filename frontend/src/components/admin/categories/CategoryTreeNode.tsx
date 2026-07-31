"use client"

import { ChevronRight, EyeOffIcon, ImageIcon, VideoIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CategoryNode } from "./types"

interface Props {
  node: CategoryNode
  depth: number
  selectedId: number | null
  onSelect: (node: CategoryNode) => void
}

const KIND_LABEL: Record<string, string> = {
  section: "S",
  feature: "F",
  category: "C",
}

const DEPTH_PL = ["pl-3", "pl-8", "pl-[52px]", "pl-[72px]"]

export function CategoryTreeNode({ node, depth, selectedId, onSelect }: Props) {
  const [expanded, setExpanded] = useState(depth === 0)
  const hasChildren = node.children && node.children.length > 0
  const selected = selectedId === node.id
  const hasImage = !!(node.imagePc || node.imageSp || node.image)
  const hasVideo = !!node.videoUrl

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        type="button"
        onClick={() => {
          onSelect(node)
          if (hasChildren) setExpanded(!expanded)
        }}
        className={cn(
          "w-full justify-start gap-2 h-auto py-2 text-sm border-l-2 rounded-none text-foreground",
          selected ? "border-l-primary bg-primary/5 font-medium" : "border-l-transparent",
          !node.visible && "opacity-50",
          DEPTH_PL[depth] || "pl-3",
        )}
      >
        {hasChildren ? (
          <ChevronRight
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground transition-transform",
              expanded && "rotate-90",
            )}
          />
        ) : (
          <span className="w-3.5 shrink-0" />
        )}

        <span
          className={cn(
            "shrink-0 size-5 rounded text-[10px] font-mono font-bold flex items-center justify-center",
            node.kind === "section" && "bg-primary/10 text-primary",
            node.kind === "feature" && "bg-amber-500/10 text-amber-500",
            node.kind === "category" && "bg-muted text-muted-foreground",
          )}
        >
          {KIND_LABEL[node.kind] || "?"}
        </span>

        <div className="min-w-0 flex-1 text-left">
          <div className="truncate">{node.nameRu || node.name}</div>
          {(node.subtitleRu || node.subtitle) && (
            <div className="text-[11px] text-muted-foreground truncate">
              {node.subtitleRu || node.subtitle}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {node.productCount != null && (
            <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
              {node.productCount}
            </span>
          )}
          {hasVideo && <VideoIcon className="size-3 text-blue-400" />}
          {hasImage && <ImageIcon className="size-3 text-muted-foreground" />}
          {!node.visible && <EyeOffIcon className="size-3 text-muted-foreground/40" />}
        </div>
      </Button>

      {expanded && hasChildren && (
        <div>
          {node.children?.map((child) => (
            <CategoryTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}
