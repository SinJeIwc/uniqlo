"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import type { CategoryNode } from "./types";

interface CategoryTreeProps {
  nodes: CategoryNode[];
  selectedId: number | null;
  onSelect: (node: CategoryNode) => void;
}

function TreeNode({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: CategoryNode;
  depth: number;
  selectedId: number | null;
  onSelect: (node: CategoryNode) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <button
        onClick={() => {
          onSelect(node);
          if (hasChildren) setExpanded(!expanded);
        }}
        className={cn(
          "w-full flex items-center gap-1.5 py-1.5 px-2 text-sm text-left transition-colors hover:bg-muted/50",
          selectedId === node.id && "bg-muted font-medium",
          !node.visible && "opacity-40"
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          <ChevronRight
            className={cn("size-3.5 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-90")}
          />
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <span className="truncate">{node.name}</span>
        {!node.visible && <span className="text-xs text-muted-foreground ml-auto">скрыто</span>}
      </button>
      {expanded && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryTree({ nodes, selectedId, onSelect }: CategoryTreeProps) {
  if (!nodes.length) {
    return <p className="text-sm text-muted-foreground p-4">Нет категорий</p>;
  }

  return (
    <div className="py-1">
      {nodes.map((node) => (
        <TreeNode key={node.id} node={node} depth={0} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </div>
  );
}
