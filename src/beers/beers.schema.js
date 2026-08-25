import * as z from "zod";

import { BreweryFields } from "../breweries/breweries.schema.js";

// Model -------------------------------------------------------------
// Forme et bornes d'un champ, sans comportement ni persistance. Clés en
// PascalCase : un spread depuis ce bloc produirait des clés de DTO invalides,
// donc les DTO les reprennent une par une, en snake_case.
//
// `nullable` se déclare ici, c'est une propriété de la colonne.
export const BeerFields = {
  Id: z.number().int().min(1),
  Name: z.string().trim().min(1).max(120),
  Description: z.string().trim().min(1).nullable(),
  AlcoholContent: z.number().min(0).max(99.99).nullable(),
  // TIMESTAMPTZ en base, sérialisé en ISO 8601 UTC par `res.json()`.
  CreatedAt: z.iso.datetime(),
  UpdatedAt: z.iso.datetime(),
  BreweryId: BreweryFields.Id,
};

// Params ------------------------------------------------------------
// Un segment d'URL est toujours une string, d'où la coercition.
export const IdParam = z.coerce.number().pipe(BeerFields.Id);

// ==========================================================================
// DTOs — L'optionalité appartient au contrat de l'endpoint, pas au modèle.
// ==========================================================================
// - entrée ----------------------------------------------------
export const NewBeer = z.strictObject({
  name: BeerFields.Name,
  description: BeerFields.Description.optional(),
  alcohol_content: BeerFields.AlcoholContent.optional(),
  brewery_id: BeerFields.BreweryId,
});

// PATCH : une clé absente laisse la colonne intacte, une clé à `null`
// l'efface. Le corps vide est refusé, il donnerait un UPDATE sans SET.
export const UpdateBeer = z
  .strictObject({
    name: BeerFields.Name.optional(),
    description: BeerFields.Description.optional(),
    alcohol_content: BeerFields.AlcoholContent.optional(),
    brewery_id: BeerFields.BreweryId.optional(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: "Au moins un champ doit être fourni",
  });

// - sortie ----------------------------------------------------
export const Beer = z.strictObject({
  id: BeerFields.Id,
  name: BeerFields.Name,
  description: BeerFields.Description,
  alcohol_content: BeerFields.AlcoholContent,
  created_at: BeerFields.CreatedAt,
  updated_at: BeerFields.UpdatedAt,
  brewery_id: BeerFields.BreweryId,
});

export const BeerList = z.array(Beer);

// ! `BeerDetails` — la row plus ses relations — reste décrit à la main dans le
// ! JSDoc du contrôleur. À modéliser ici, avec photos, categories, brewery,
// ! composition, outlets et ratingStats, dès que les ressources liées ont
// ! leurs schémas.
