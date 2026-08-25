import * as z from "zod";

import { Brewery } from "../breweries/breweries.schema.js";

// Model -------------------------------------------------------------
export const Beer = {
  Id: z.number().int().min(1),
  Name: z.string().trim().min(1).max(120),
  Description: z.string().trim().min(1),
  AlcoholContent: z.number().min(0).max(99.99),
};

// Params ------------------------------------------------------------
// Un segment d'URL est toujours une string, d'où la coercition.
export const IdParam = z.coerce.number().pipe(Beer.Id);

// DTOs -------------------------------------------------------------
// L'optionalité appartient au contrat de l'endpoint, pas au modèle.
export const NewBeer = z.strictObject({
  name: Beer.Name,
  description: Beer.Description.optional(),
  alcohol_content: Beer.AlcoholContent.optional(),
  brewery_id: Brewery.Id,
});
