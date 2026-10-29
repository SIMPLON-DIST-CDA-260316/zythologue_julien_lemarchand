import * as z from "zod";

import { BeerFields, BeerListItem, Brewery } from "@zytho/schemas";
import { Ingredient } from "#features/ingredients/ingredients.schemas.js";
import { Category } from "#features/categories/categories.schemas.js";
import { Photo } from "#features/photos/photos.schemas.js";
import { Outlet } from "#features/outlets/outlets.schemas.js";
import { ApiResponse, ApiListResponse } from "#http/apiResponse.js";

// Params ------------------------------------------------------------
// Un segment d'URL est toujours une string, d'où la coercition.
export const BeerIdParam = z.coerce.number().pipe(BeerFields.Id);

const PaginationFilter = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).default(12),
});

// à étendre avec un filtre (brewery_id...) et un tri plus tard.
export const BeerQuery = PaginationFilter;

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

// - sortie, détail --------------------------------------------

// `null` tant qu'aucun avis n'a été posté, cf. le `CASE WHEN rs.count = 0`
// dans `findOne`.
const RatingStats = z
  .strictObject({
    average: z
      .number()
      .min(1)
      .max(5)
      .describe("note moyenne sur une échelle de 1 à 5"),
    count: z.number().int().min(0),
  })
  .nullable()
  .describe("null si aucun avis n'a encore été posté");

export const BeerDetails = z
  .strictObject({
    id: BeerFields.Id,
    name: BeerFields.Name,
    description: BeerFields.Description,
    alcohol_content: BeerFields.AlcoholContent,
    brewery: Brewery,
    ingredients: z.array(Ingredient),
    categories: z.array(Category),
    photos: z.array(Photo),
    outlets: z.array(Outlet),
    rating_stats: RatingStats,
  })
  .describe(
    "Détail complet d'une bière — données propres, brasserie, composition, points de vente et statistiques d'avis.",
  );

// - réponses --------------------------------------------------
// Ce que le handler sérialise, enveloppe comprise. Les DTO ci-dessus restent
// la ressource nue, réutilisable telle quelle dans une autre enveloppe.
export const BeerResponse = ApiResponse(Beer);
export const BeerListResponse = ApiListResponse(BeerListItem);
export const BeerDetailsResponse = ApiResponse(BeerDetails);
