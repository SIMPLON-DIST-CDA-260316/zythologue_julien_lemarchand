import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

import { beerFormSchema, createBeer, type BeerFormValues } from "@/entities/beer"
import { BreweryField } from "@/entities/brewery"
import { ApiError } from "@/shared/api"
import { Button } from "@/shared/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"

type FieldErrors = Partial<Record<keyof BeerFormValues, string[]>>

export function CreateBeerForm({ onCreated }: { onCreated: () => void }) {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
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
      setFieldErrors(z.flattenError(error).fieldErrors)
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
        setFieldErrors({ name: ["Cette brasserie a déjà une bière de ce nom"] })
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
        <Field data-invalid={!!fieldErrors.name}>
          <FieldLabel htmlFor="name">Nom</FieldLabel>
          <Input
            id="name"
            name="name"
            maxLength={120}
            required
            aria-invalid={!!fieldErrors.name}
          />
          <FieldError>{fieldErrors.name?.[0]}</FieldError>
        </Field>

        <BreweryField error={fieldErrors.brewery_id?.[0]} />

        <Field data-invalid={!!fieldErrors.alcohol_content}>
          <FieldLabel htmlFor="alcohol_content">Degré (facultatif)</FieldLabel>
          <Input
            id="alcohol_content"
            name="alcohol_content"
            type="number"
            step="0.01"
            min="0"
            max="99.99"
            aria-invalid={!!fieldErrors.alcohol_content}
          />
          <FieldError>{fieldErrors.alcohol_content?.[0]}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Description (facultatif)</FieldLabel>
          <Textarea id="description" name="description" />
        </Field>

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
