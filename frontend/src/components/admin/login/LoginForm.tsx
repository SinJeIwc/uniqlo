"use client"

import { LogInIcon } from "lucide-react"
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
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field data-invalid={!!error || undefined}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Пароль</FieldLabel>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        {error && <FieldError>{error}</FieldError>}
        <Button type="submit" disabled={loading}>
          {loading ? <Spinner data-icon="inline-start" /> : <LogInIcon data-icon="inline-start" />}
          Войти
        </Button>
      </FieldGroup>
    </form>
  )
}
