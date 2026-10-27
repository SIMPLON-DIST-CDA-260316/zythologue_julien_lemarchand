import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

import { createBeer } from "@/entities/beer"
import { ApiError } from "@/shared/api"
import { Button } from "@/shared/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { Textarea } from "@/shared/ui/textarea"

import {
  createBeerSchema,
  type CreateBeerValues,
} from "../model/create-beer-schema"
import { useBreweries, type BreweriesQuery } from "../model/use-breweries"

type FieldErrors = Partial<Record<keyof CreateBeerValues, string[]>>

export function CreateBeerForm({ onCreated }: { onCreated: () => void }) {
  const breweriesQuery = useBreweries()
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
    } = createBeerSchema.safeParse(Object.fromEntries(form))
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

        <BreweryField
          breweriesQuery={breweriesQuery}
          error={fieldErrors.brewery_id?.[0]}
        />

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
          <Button
            type="submit"
            disabled={pending || breweriesQuery.status !== "success"}
          >
            {pending ? "Ajout…" : "Ajouter"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

function BreweryField({
  breweriesQuery,
  error,
}: {
  breweriesQuery: BreweriesQuery
  error?: string
}) {
  const items =
    breweriesQuery.status === "success"
      ? breweriesQuery.breweries.map((brewery) => ({
          value: brewery.id,
          label: brewery.name,
        }))
      : []

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor="brewery_id">Brasserie</FieldLabel>
      <Select
        name="brewery_id"
        items={items}
        disabled={breweriesQuery.status !== "success"}
      >
        <SelectTrigger id="brewery_id" aria-invalid={!!error}>
          <SelectValue
            placeholder={
              breweriesQuery.status === "loading"
                ? "Chargement…"
                : "Choisissez une brasserie"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError>
        {breweriesQuery.status === "error"
          ? "Impossible de charger les brasseries."
          : error}
      </FieldError>
    </Field>
  )
}
