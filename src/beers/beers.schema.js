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

// - sortie ----------------------------------------------------
// ! il doit encore être aligné avec la sortie complexe que renvoie la route GET /beers/:id
export const BeerDetails = z.object(BeerFields);

// BeerSummary - DTO minimal qui renvoie les informations sur une bière
export const BeerSummary = z.strictObject({
  id: BeerFields.Id,
  name: BeerFields.Name,
  description: BeerFields.Description.optional(),
  alcohol_content: BeerFields.AlcoholContent.optional(),
  brewery_id: BeerFields.BreweryId,
});

export const BeerList = z.array(BeerSummary);
