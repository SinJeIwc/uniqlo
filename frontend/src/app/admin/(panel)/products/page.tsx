"use client"

import { SearchIcon, XIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { ProductRow } from "@/components/admin/products/product-row"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Product } from "@/db"

const PAGE_SIZE = 20

interface FilterState {
  q: string
  gender: string
  category: string
  active: string
  page: number
}

export default function AdminProductsPage() {
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState<FilterState>({
    q: searchParams.get("q") || "",
    gender: searchParams.get("gender") || "",
    category: searchParams.get("category") || "",
    active: searchParams.get("active") || "",
    page: Number(searchParams.get("page")) || 1,
  })

  const [data, setData] = useState<{ rows: Product[]; total: number }>({ rows: [], total: 0 })
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([])
  const [loading, setLoading] = useState(false)

  // Load categories for filter
  useEffect(() => {
    fetch("/api/admin/categories?flat=1")
      .then((r) => r.json())
      .then((d) => {
        setCategories(d.categories || [])
      })
      .catch(() => {})
  }, [])

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.q) params.set("q", filters.q)
    if (filters.gender) params.set("gender", filters.gender)
    if (filters.category) params.set("category", filters.category)
    if (filters.active) params.set("active", filters.active)
    params.set("page", String(filters.page))
    params.set("limit", String(PAGE_SIZE))

    const res = await fetch(`/api/admin/products?${params}`, { credentials: "include" })
    const json = await res.json()
    setData({ rows: json.rows || [], total: json.total || 0 })
    setLoading(false)
  }, [filters])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: key === "page" ? Number(value) : 1 }))
  }

  const clearFilters = () => {
    setFilters({ q: "", gender: "", category: "", active: "", page: 1 })
  }

  const hasFilters = filters.q || filters.gender || filters.category || filters.active
  const totalPages = Math.ceil(data.total / PAGE_SIZE)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Products{" "}
          {data.total > 0 && (
            <span className="text-muted-foreground text-lg font-normal">({data.total})</span>
          )}
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative w-64">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search name or ID..."
            value={filters.q}
            onChange={(e) => updateFilter("q", e.target.value)}
            className="h-9 pl-8 text-sm"
          />
        </div>

        <Select value={filters.gender} onValueChange={(v) => updateFilter("gender", v || "")}>
          <SelectTrigger className="w-28 h-9 text-sm">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="women">Women</SelectItem>
            <SelectItem value="men">Men</SelectItem>
            <SelectItem value="kids">Kids</SelectItem>
            <SelectItem value="baby">Baby</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.category} onValueChange={(v) => updateFilter("category", v || "")}>
          <SelectTrigger className="w-44 h-9 text-sm">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.active} onValueChange={(v) => updateFilter("active", v || "")}>
          <SelectTrigger className="w-28 h-9 text-sm">
            <SelectValue placeholder="Active" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="1">Active</SelectItem>
            <SelectItem value="0">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 gap-1">
            <XIcon className="size-3" /> Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Product ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Reviews</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableHead colSpan={9} className="text-center text-muted-foreground py-8">
                  Loading...
                </TableHead>
              </TableRow>
            ) : data.rows.length === 0 ? (
              <TableRow>
                <TableHead colSpan={9} className="text-center text-muted-foreground py-8">
                  No products found
                </TableHead>
              </TableRow>
            ) : (
              data.rows.map((row) => <ProductRow key={row.productId} product={row} />)
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page <= 1}
            onClick={() => updateFilter("page", String(filters.page - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {filters.page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page >= totalPages}
            onClick={() => updateFilter("page", String(filters.page + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
