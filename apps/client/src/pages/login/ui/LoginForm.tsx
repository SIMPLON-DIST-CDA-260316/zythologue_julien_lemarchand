import { Loader2Icon } from "lucide-react"
import { useState } from "react"

import { firstFieldErrors } from "@/shared/lib/first-field-errors"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import { ApiError } from "@/shared/api"

import { loginSchema, type LoginValues } from "../model/login-schema"
import { useLogin } from "../model/use-login"

type FieldErrors = Partial<Record<keyof LoginValues, string>>

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const login = useLogin()
  const [submitError, setSubmitError] = useState<string>()
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [credentialsRejected, setCredentialsRejected] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    // Sans ça, le navigateur recharge la page en soumettant le formulaire.
    event.preventDefault()
    setSubmitError(undefined)
    setCredentialsRejected(false)

    const form = new FormData(event.currentTarget)

    const {
      success,
      error,
      data: credentials,
    } = loginSchema.safeParse(Object.fromEntries(form))
    if (!success) {
      setFieldErrors(firstFieldErrors(error))
      return
    }
    setFieldErrors({})

    setIsSubmitting(true)
    try {
      await login(credentials)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setSubmitError("Email ou mot de passe incorrect")
        setCredentialsRejected(true)
      } else {
        setSubmitError("Connexion impossible, réessayez plus tard")
      }
    } finally {
      setIsSubmitting(false)
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
              <Field data-invalid={!!fieldErrors.email || credentialsRejected}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  aria-invalid={!!fieldErrors.email || credentialsRejected}
                />
                <FieldError>{fieldErrors.email}</FieldError>
              </Field>
              <Field data-invalid={!!fieldErrors.password || credentialsRejected}>
                <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  aria-invalid={!!fieldErrors.password || credentialsRejected}
                />
                <FieldError>{fieldErrors.password}</FieldError>
              </Field>
              <Field>
                <FieldError>{submitError}</FieldError>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2Icon className="animate-spin" />}
                  {isSubmitting ? "Connexion…" : "Se connecter"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
