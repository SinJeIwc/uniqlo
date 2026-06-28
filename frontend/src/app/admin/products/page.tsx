import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function AdminProducts() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Товары</h1>
        <p className="text-sm text-muted-foreground mt-1">Скоро</p>
      </div>
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle>Скоро</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Управление товарами будет здесь.</p>
        </CardContent>
      </Card>
    </div>
  )
}
