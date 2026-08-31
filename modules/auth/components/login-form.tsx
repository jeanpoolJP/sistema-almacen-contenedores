// modules/auth/components/login-form.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, LockKeyhole } from "lucide-react"

import { loginAction } from "../actions/login"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError("")

    if (!password) {
      setError("Ingresa tu contraseña.")
      return
    }

    setLoading(true)

    try {
      const result = await loginAction(password)

      if (result.error) {
        setError(result.error)
        return
      }

      router.replace("/admin")
      router.refresh()
    } catch {
      setError("No se pudo iniciar sesión. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-4 text-center">
        {/* LOGO / IDENTIDAD */}
        <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <LockKeyhole className="size-7" />
        </div>

        <div className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            KRENCO
          </CardTitle>

          <CardDescription className="text-sm">
            Sistema de Gestión de Almacén
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* CONTRASEÑA */}
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>

            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setError("")
              }}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
              minLength={8}
              maxLength={128}
              required
              disabled={loading}
              aria-invalid={!!error}
              aria-describedby={error ? "login-error" : undefined}
            />
          </div>

          {/* ERROR */}
          {error && (
            <p
              id="login-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {error}
            </p>
          )}

          {/* BOTÓN */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Verificando...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </Button>
        </form>

        {/* INFORMACIÓN */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Acceso exclusivo para personal autorizado de KRENCO.
        </p>
      </CardContent>
    </Card>
  )
}
