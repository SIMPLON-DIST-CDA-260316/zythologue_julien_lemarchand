import { useState } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
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

import { register } from "../api/register"
import { registerSchema, type RegisterValues } from "../model/register-schema"

type FieldErrors = Partial<Record<keyof RegisterValues, string[]>>

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string>()
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError(undefined)

    const form = new FormData(event.currentTarget)

    const {
      success,
      error,
      data: newUser,
    } = registerSchema.safeParse(Object.fromEntries(form))
    if (!success) {
      setFieldErrors(z.flattenError(error).fieldErrors)
      return
    }
    setFieldErrors({})

    setPending(true)
    try {
      await register(newUser)
      toast.success("Compte créé, vous pouvez vous connecter")
      navigate("/login")
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setFieldErrors({ email: ["Cet email est déjà utilisé"] })
      } else {
        setSubmitError("Inscription impossible, réessayez plus tard")
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Créer un compte</CardTitle>
          <CardDescription>Inscrivez-vous avec votre email</CardDescription>
        </CardHeader>
        <CardContent>
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
                <Button type="submit" disabled={pending}>
                  {pending ? "Création…" : "Créer mon compte"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
