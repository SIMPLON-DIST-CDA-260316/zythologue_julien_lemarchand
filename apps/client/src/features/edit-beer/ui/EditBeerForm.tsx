import { useState } from "react"
import { toast } from "sonner"

import {
  BeerFormFields,
  beerFormSchema,
  updateBeer,
  type Beer,
  type BeerFormErrors,
} from "@/entities/beer"
import { ApiError } from "@/shared/api"
import { firstFieldErrors } from "@/shared/lib/first-field-errors"
import { Button } from "@/shared/ui/button"
import { Field, FieldError, FieldGroup } from "@/shared/ui/field"

import { getChangedFields } from "../model/get-changed-fields"

export function EditBeerForm({
  beer,
  onUpdated,
  onUnchanged,
}: {
  beer: Beer
  onUpdated: () => void
  onUnchanged: () => void
}) {
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
      data: values,
    } = beerFormSchema.safeParse(Object.fromEntries(form))
    if (!success) {
      setFieldErrors(firstFieldErrors(error))
      return
    }
    setFieldErrors({})

    const changes = getChangedFields(beer, values)
    if (Object.keys(changes).length === 0) {
      onUnchanged()
      return
    }

    setPending(true)
    try {
      await updateBeer(beer.id, changes)
      toast.success("Bière modifiée")
      onUpdated()
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setFieldErrors({ name: "Cette brasserie a déjà une bière de ce nom" })
      } else {
        setSubmitError("Modification impossible, réessayez plus tard")
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FieldGroup>
        <BeerFormFields beer={beer} fieldErrors={fieldErrors} />

        <Field>
          <FieldError>{submitError}</FieldError>
          <Button type="submit" disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
