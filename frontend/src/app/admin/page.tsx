import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { db } from "@/db"
import { categories, users } from "@/db/schema"

export const dynamic = "force-dynamic"

export default function AdminDashboard() {
  const catCount = db.select().from(categories).all().length
  const userCount = db.select().from(users).all().length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Дашборд</h1>
        <p className="text-sm text-muted-foreground mt-1">Обзор магазина</p>
      </div>
      <Separator />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Категорий</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{catCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Пользователей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{userCount}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
