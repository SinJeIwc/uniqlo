import Link from "next/link"
import type { ReactNode } from "react"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border h-14 flex items-center gap-6 px-6">
        <Link href="/admin" className="font-bold text-lg">
          Admin
        </Link>
        <Link
          href="/admin/categories"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Categories
        </Link>
        <Link
          href="/admin/products"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Products
        </Link>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}
