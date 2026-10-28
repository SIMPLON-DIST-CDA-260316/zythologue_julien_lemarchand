import { useState } from "react"
import { toast } from "sonner"

import {
  BeerFormFields,
  beerFormSchema,
  createBeer,
  type BeerFormErrors,
} from "@/entities/beer"
import { ApiError } from "@/shared/api"
import { firstFieldErrors } from "@/shared/lib/first-field-errors"
import { Button } from "@/shared/ui/button"
import { Field, FieldError, FieldGroup } from "@/shared/ui/field"

export function CreateBeerForm({ onCreated }: { onCreated: () => void }) {
  const [fieldErrors, setFieldErrors] = useState<BeerFormErrors>({})
  const [submitError, setSubmitError] = useState<string>()
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError(undefined)

    const form = new FormData(event.currentTarget)

    const {
      success,
      error,
      data: newBeer,
    } = beerFormSchema.safeParse(Object.fromEntries(form))
    if (!success) {
      setFieldErrors(firstFieldErrors(error))
      return
    }
    setFieldErrors({})

    setPending(true)
    try {
      await createBeer(newBeer)
      toast.success("Bière ajoutée")
      onCreated()
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setFieldErrors({ name: "Cette brasserie a déjà une bière de ce nom" })
      } else {
        setSubmitError("Création impossible, réessayez plus tard")
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FieldGroup>
        <BeerFormFields fieldErrors={fieldErrors} />

        <Field>
          <FieldError>{submitError}</FieldError>
          <Button type="submit" disabled={pending}>
            {pending ? "Ajout…" : "Ajouter"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
