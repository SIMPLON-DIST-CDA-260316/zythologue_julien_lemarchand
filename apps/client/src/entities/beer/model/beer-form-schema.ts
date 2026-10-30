import { BeerFields } from "@zytho/schemas"
import { z } from "zod"

// Les champs du formulaire sont des strings : on les convertit, puis les
// règles du package s'appliquent.
export const beerFormSchema = z.object({
  name: BeerFields.Name,
  description: z
    .string()
    .trim()
    .transform((value) => value || null)
    .pipe(BeerFields.Description),
  alcohol_content: z
    .string()
    .transform((value) => (value === "" ? null : Number(value)))
    .pipe(BeerFields.AlcoholContent),
  brewery_id: z.coerce
    .number("Choisissez une brasserie")
    .int()
    .positive("Choisissez une brasserie"),
})

export type BeerFormValues = z.infer<typeof beerFormSchema>

export type BeerFormErrors = Partial<Record<keyof BeerFormValues, string>>
