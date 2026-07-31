"use client"

import { ChevronRight, EyeOffIcon, ImageIcon, VideoIcon } from "lucide-react"
import { useState } from "react"
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

export function CategoryTreeNode({ node, depth, selectedId, onSelect }: Props) {
  const [expanded, setExpanded] = useState(depth === 0)
  const hasChildren = node.children && node.children.length > 0
  const selected = selectedId === node.id

  const hasImage = !!(node.imagePc || node.imageSp || node.image)
  const hasVideo = !!node.videoUrl

  return (
    <div>
      <button
        onClick={() => {
          onSelect(node)
          if (hasChildren) setExpanded(!expanded)
        }}
        className={cn(
          "group w-full flex items-center gap-2 py-2 px-3 text-sm text-left transition-colors hover:bg-muted/40 border-l-2",
          selected ? "border-l-primary bg-primary/5 font-medium" : "border-l-transparent",
          !node.visible && "opacity-50",
        )}
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
      >
        {/* Expand arrow */}
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

        {/* Kind badge */}
        <span
          className={cn(
            "shrink-0 w-5 h-5 rounded text-[10px] font-mono font-bold flex items-center justify-center",
            node.kind === "section"
              ? "bg-primary/10 text-primary"
              : node.kind === "feature"
                ? "bg-amber-500/10 text-amber-500"
                : "bg-muted text-muted-foreground",
          )}
        >
          {KIND_LABEL[node.kind] || "?"}
        </span>

        {/* Name + subtitle */}
        <div className="min-w-0 flex-1">
          <div className="truncate">{node.name}</div>
          {node.subtitle && (
            <div className="text-[11px] text-muted-foreground truncate">{node.subtitle}</div>
          )}
        </div>

        {/* Right-side indicators */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {node.productCount != null && (
            <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
              {node.productCount}
            </span>
          )}
          {hasVideo && <VideoIcon className="size-3 text-blue-400" />}
          {hasImage && <ImageIcon className="size-3 text-muted-foreground" />}
          {!node.visible && <EyeOffIcon className="size-3 text-muted-foreground/40" />}
        </div>
      </button>

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
