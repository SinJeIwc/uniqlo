"use client"

import { Lock, LogInIcon, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()
  const router = useRouter()

  if (user) {
    router.push("/admin")
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const result = await login(email, password)
    setLoading(false)
    if (result.error) setError(result.error)
    else router.push("/admin")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FieldGroup>
        <Field data-invalid={!!error || undefined}>
          <FieldLabel htmlFor="email" className="text-sm font-medium">
            Email адрес
          </FieldLabel>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              id="email"
              type="email"
              placeholder="admin@uniqlo.kg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>
        </Field>

        <Field data-invalid={!!error || undefined}>
          <FieldLabel htmlFor="password" className="text-sm font-medium">
            Пароль
          </FieldLabel>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>
        </Field>

        {error && (
          <FieldError className="text-center py-2 px-3 rounded-lg bg-destructive/10">
            {error}
          </FieldError>
        )}

        <Button type="submit" disabled={loading} className="w-full h-11 text-base font-medium">
          {loading ? (
            <>
              <Spinner data-icon="inline-start" />
              Вход...
            </>
          ) : (
            <>
              <LogInIcon data-icon="inline-start" />
              Войти в систему
            </>
          )}
        </Button>
      </FieldGroup>
    </form>
  )
}
