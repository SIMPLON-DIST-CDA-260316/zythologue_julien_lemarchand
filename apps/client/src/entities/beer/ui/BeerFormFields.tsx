import { BreweryField } from "@/entities/brewery/@x/beer"
import { Field, FieldError, FieldLabel } from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"

import type { BeerFormErrors } from "../model/beer-form-schema"

export function BeerFormFields({ fieldErrors }: { fieldErrors: BeerFormErrors }) {
  return (
    <>
      <Field data-invalid={!!fieldErrors.name}>
        <FieldLabel htmlFor="name">Nom</FieldLabel>
        <Input
          id="name"
          name="name"
          maxLength={120}
          required
          aria-invalid={!!fieldErrors.name}
        />
        <FieldError>{fieldErrors.name}</FieldError>
      </Field>

      <BreweryField errorMessage={fieldErrors.brewery_id} />

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
        <FieldError>{fieldErrors.alcohol_content}</FieldError>
      </Field>

      <Field>
        <FieldLabel htmlFor="description">Description (facultatif)</FieldLabel>
        <Textarea id="description" name="description" />
      </Field>
    </>
  )
}
