import * as z from "zod";
import { Id } from "#shared/common.schemas.js";

// Model -------------------------------------------------------------
export const IngredientFields = {
  Id,
  Name: z.string().trim().min(1).max(80),
  IsAllergen: z
    .boolean()
    .describe("indique si l'ingrédient est un allergène déclaré"),
};

// - sortie ----------------------------------------------------
// Vue embarquée dans BeerDetails — pas d'endpoint /ingredients pour
// l'instant, donc pas d'id exposé ni de DTOs d'entrée.
export const Ingredient = z.strictObject({
  name: IngredientFields.Name,
  is_allergen: IngredientFields.IsAllergen,
});
