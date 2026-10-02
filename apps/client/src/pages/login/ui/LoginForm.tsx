import { useState } from "react"
import { useNavigate } from "react-router"
import { z } from "zod"

import { apiFetch } from "@/shared/api"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { loginSchema, type LoginValues } from "../model/login-schema"

type FieldErrors = Partial<Record<keyof LoginValues, string[]>>

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const [error, setError] = useState<string>()
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    // Sans ça, le navigateur recharge la page en soumettant le formulaire.
    event.preventDefault()
    setError(undefined)

    const form = new FormData(event.currentTarget)

    const result = loginSchema.safeParse(Object.fromEntries(form))
    if (!result.success) {
      setFieldErrors(z.flattenError(result.error).fieldErrors)
      return
    }
    setFieldErrors({})

    try {
      await apiFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      })
      navigate("/")
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login with your email</CardDescription>
        </CardHeader>
        <CardContent>
          {/* noValidate : sinon la validation native bloque l'envoi avant Zod. */}
          <form onSubmit={handleSubmit} noValidate>
            <FieldGroup>
              <Field data-invalid={!!fieldErrors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  aria-invalid={!!fieldErrors.email}
                />
                <FieldError>{fieldErrors.email?.[0]}</FieldError>
              </Field>
              <Field data-invalid={!!fieldErrors.password}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  aria-invalid={!!fieldErrors.password}
                />
                <FieldError>{fieldErrors.password?.[0]}</FieldError>
              </Field>
              <Field>
                <FieldError>{error}</FieldError>
                <Button type="submit">Login</Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
