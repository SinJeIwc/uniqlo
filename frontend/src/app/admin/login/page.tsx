import { LoginForm } from "@/components/admin/login/LoginForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <Card className="w-full max-w-sm border-0 shadow-none sm:border sm:shadow-sm">
        <CardHeader>
          <CardTitle>UNIQLO KG — Админ</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
