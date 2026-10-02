import { useState } from "react"
import { useNavigate } from "react-router"
import { z } from "zod"

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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ApiError } from "@/shared/api"

import { login } from "../api/login"
import { loginSchema, type LoginValues } from "../model/login-schema"

type FieldErrors = Partial<Record<keyof LoginValues, string[]>>

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string>()
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    // Sans ça, le navigateur recharge la page en soumettant le formulaire.
    event.preventDefault()
    setSubmitError(undefined)

    const form = new FormData(event.currentTarget)

    const {
      success,
      error,
      data: credentials,
    } = loginSchema.safeParse(Object.fromEntries(form))
    if (!success) {
      setFieldErrors(z.flattenError(error).fieldErrors)
      return
    }
    setFieldErrors({})

    try {
      await login(credentials)
      navigate("/")
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setSubmitError("Email ou mot de passe incorrect")
        setFieldErrors({ email: [], password: [] })
      } else {
        setSubmitError("Connexion impossible, réessayez plus tard")
      }
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Connexion</CardTitle>
          <CardDescription>Connectez-vous avec votre email</CardDescription>
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
                <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  aria-invalid={!!fieldErrors.password}
                />
                <FieldDescription>
                  Au moins 8 caractères, dont un chiffre et un caractère
                  spécial.
                </FieldDescription>
                <FieldError>{fieldErrors.password?.[0]}</FieldError>
              </Field>
              <Field>
                <FieldError>{submitError}</FieldError>
                <Button type="submit">Se connecter</Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
