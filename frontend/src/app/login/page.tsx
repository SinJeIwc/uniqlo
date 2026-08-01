"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, ShieldCheck } from "lucide-react"
import { TelegramLogin } from "@/components/auth/TelegramLogin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/components/auth/AuthProvider"

export default function UserLoginPage() {
  const router = useRouter()
  const { loginTelegram, user } = useAuth()

  if (user) {
    router.push("/")
    return null
  }

  const handleTelegramAuth = async (tgUser: unknown) => {
    const result = await loginTelegram(tgUser)
    if (!result.error) {
      router.push("/")
      router.refresh()
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,oklch(0.97_0_0),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,oklch(0.97_0_0),transparent_40%)]" />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.922_0_0)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.922_0_0)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Back to home button */}
      <Link href="/" className="absolute top-6 left-6 z-10">
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowLeft className="size-4" />
          На главную
        </Button>
      </Link>

      {/* Admin login link */}
      <Link href="/admin/login" className="absolute top-6 right-6 z-10">
        <Button variant="ghost" size="sm" className="gap-2">
          <ShieldCheck className="size-4" />
          Админ вход
        </Button>
      </Link>

      {/* Login card */}
      <Card className="relative z-10 w-full max-w-md border shadow-lg">
        <CardHeader className="text-center space-y-2">
          {/* Logo/Brand */}
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <User className="size-7" />
          </div>

          <div className="space-y-1 pt-2">
            <CardTitle className="text-2xl font-bold tracking-tight">Добро пожаловать</CardTitle>
            <CardDescription className="text-base">
              Войдите через Telegram для продолжения
            </CardDescription>
          </div>
        </CardHeader>

        <Separator className="mb-6" />

        <CardContent>
          <div className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>Быстрый и безопасный вход</p>
              <p>через ваш Telegram аккаунт</p>
            </div>

            <TelegramLogin
              botName={process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || ""}
              onAuth={handleTelegramAuth}
            />

            <div className="pt-4 text-center text-xs text-muted-foreground">
              Нажимая кнопку входа, вы соглашаетесь с{" "}
              <Link href="/terms" className="underline hover:text-foreground">
                условиями использования
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer text */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-sm text-muted-foreground">
          © 2026 UNIQLO Kyrgyzstan. Все права защищены.
        </p>
      </div>
    </div>
  )
}
