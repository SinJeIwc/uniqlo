import Link from "next/link"

export default function AdminIndexPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin</h1>
      <div className="flex gap-4">
        <Link
          href="/admin/categories"
          className="border border-border rounded-lg p-6 hover:bg-muted transition-colors"
        >
          <h2 className="text-lg font-semibold">Categories</h2>
          <p className="text-sm text-muted-foreground">Manage categories from parser</p>
        </Link>
        <Link
          href="/admin/products"
          className="border border-border rounded-lg p-6 hover:bg-muted transition-colors"
        >
          <h2 className="text-lg font-semibold">Products</h2>
          <p className="text-sm text-muted-foreground">Manage products from parser</p>
        </Link>
      </div>
    </div>
  )
}
