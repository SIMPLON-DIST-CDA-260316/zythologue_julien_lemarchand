import { z } from "zod"

export const beerFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nom requis")
    .max(120, "120 caractères maximum"),
  description: z
    .string()
    .trim()
    .transform((value) => value || null),
  alcohol_content: z
    .string()
    .transform((value) => (value === "" ? null : Number(value)))
    .pipe(
      z
        .number("Degré invalide")
        .min(0, "Le degré ne peut pas être négatif")
        .max(99.99, "99,99 % maximum")
        .nullable(),
    ),
  brewery_id: z.coerce
    .number("Choisissez une brasserie")
    .int()
    .positive("Choisissez une brasserie"),
})

export type BeerFormValues = z.infer<typeof beerFormSchema>

export type BeerFormErrors = Partial<Record<keyof BeerFormValues, string>>
