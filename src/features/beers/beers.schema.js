import * as z from "zod";

import { BreweryFields } from "#features/breweries/breweries.schema.js";
import { ApiResponse, ApiListResponse } from "#http/apiResponse.js";

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
  AlcoholContent: z
    .number()
    .min(0)
    .max(99.99)
    .nullable()
    .describe("teneur en alcool en % vol."),
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

// - sortie, détail --------------------------------------------
// `BeerDetails` = la row plus ses relations
const Ingredient = z.strictObject({
  name: z.string().trim().min(1).max(80),
  is_allergen: z
    .boolean()
    .describe("indique si l'ingrédient est un allergène déclaré"),
});

const Category = z.strictObject({
  id: z.number().int().min(1),
  name: z.string().trim().min(1).max(60),
});

const Photo = z.strictObject({
  url: z.url().max(255),
  caption: z.string().trim().min(1).max(255).nullable(),
});

// Absente pour les outlets exclusivement en ligne, d'où la nullabilité portée
// par le champ `address` sur `Outlet`, pas ici.
const Address = z.strictObject({
  number: z.string().trim().min(1).max(10).nullable(),
  street: z.string().trim().min(1).max(255),
  zip_code: z.string().trim().min(1).max(10),
  city: z.string().trim().min(1).max(100),
  country: z.string().trim().min(1).max(60),
});

const Outlet = z.strictObject({
  id: z.number().int().min(1),
  name: z.string().trim().min(1).max(120),
  type: z.enum(["cellar", "bar", "restaurant", "supermarket"]).nullable(),
  online_sales: z
    .boolean()
    .describe("indique si le lieu propose une vente en ligne"),
  website: z.url().max(255).nullable(),
  address: Address.nullable().describe(
    "null pour les outlets exclusivement en ligne",
  ),
});

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
    brewery: z.strictObject({
      id: BreweryFields.Id,
      name: BreweryFields.Name,
    }),
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
export const BeerListResponse = ApiListResponse(Beer);
export const BeerDetailsResponse = ApiResponse(BeerDetails);
