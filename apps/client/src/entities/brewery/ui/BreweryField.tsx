import { Field, FieldError, FieldLabel } from "@/shared/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

import { useBreweries } from "../model/use-breweries"

export function BreweryField({ error }: { error?: string }) {
  const breweriesQuery = useBreweries()
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
