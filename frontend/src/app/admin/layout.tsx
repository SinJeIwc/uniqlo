"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const NAV = [
  { label: "Дашборд", href: "/admin" },
  { label: "Категории", href: "/admin/categories" },
  { label: "Товары", href: "/admin/products" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isLogin = pathname === "/admin/login"

  useEffect(() => {
    if (!loading && !user && !isLogin) {
      router.push("/admin/login")
    }
  }, [loading, user, isLogin, router])

  if (isLogin) return children
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Загрузка...
      </div>
    )
  if (!user) return null

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Доступ запрещён
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-semibold text-sm">
            UNIQLO KG
          </Link>
          <nav className="flex gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-1.5 text-sm rounded transition-colors",
                  pathname === item.href
                    ? "bg-black text-white"
                    : "text-zinc-600 hover:bg-zinc-100",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500">{user.name}</span>
          <Button variant="outline" size="sm" onClick={logout}>
            Выйти
          </Button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-6">{children}</main>
    </div>
  )
}
