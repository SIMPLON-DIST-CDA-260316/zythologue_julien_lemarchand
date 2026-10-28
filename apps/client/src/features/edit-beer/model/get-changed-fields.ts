import type { Beer, BeerFormValues, NewBeer } from "@/entities/beer"

export function getChangedFields(beer: Beer, values: BeerFormValues) {
  // Typé BeerFormValues : un champ ajouté au schéma mais oublié ici
  // ne compile pas, au lieu de ne jamais partir en PATCH.
  const initial: BeerFormValues = {
    name: beer.name,
    brewery_id: beer.brewery.id,
    alcohol_content: beer.alcohol_content,
    description: beer.description,
  }
  const fields = Object.keys(values) as (keyof BeerFormValues)[]
  return Object.fromEntries(
    fields
      .filter((field) => values[field] !== initial[field])
      .map((field) => [field, values[field]]),
  ) as Partial<NewBeer>
}
