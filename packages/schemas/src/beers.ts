import * as z from "zod"

import { BreweryFields, Brewery } from "./breweries.ts"
import { CreatedAt, Id, UpdatedAt } from "./common.ts"

// Forme et bornes d'un champ, sans comportement ni persistance. Clés en
// PascalCase : un spread depuis ce bloc produirait des clés de DTO invalides,
// donc les DTO les reprennent une par une, en snake_case.
//
// `nullable` se déclare ici, c'est une propriété de la colonne.
export const BeerFields = {
  Id: Id.meta({ example: 1 }),
  Name: z
    .string()
    .trim()
    .min(1, "Nom requis")
    .max(120, "120 caractères maximum")
    .describe("unique par brasserie, la comparaison ignore la casse")
    .meta({ example: "Blonde du Nord" }),
  Description: z
    .string()
    .trim()
    .min(1)
    .nullable()
    .meta({ example: "Blonde légère et désaltérante." }),
  AlcoholContent: z
    .number("Degré invalide")
    .min(0, "Le degré ne peut pas être négatif")
    .max(99.99, "99,99 % maximum")
    .nullable()
    .describe("teneur en alcool en % vol.")
    .meta({ example: 5.2 }),
  CreatedAt,
  UpdatedAt,
  BreweryId: BreweryFields.Id,
}

// La brasserie avec son nom, à la place de `brewery_id`, pour l'afficher sans
// requête de plus.
export const BeerListItem = z.strictObject({
  id: BeerFields.Id,
  name: BeerFields.Name,
  description: BeerFields.Description,
  alcohol_content: BeerFields.AlcoholContent,
  created_at: BeerFields.CreatedAt,
  updated_at: BeerFields.UpdatedAt,
  brewery: Brewery,
})
