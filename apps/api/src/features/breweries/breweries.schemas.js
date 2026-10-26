import * as z from "zod";
import { Id } from "#shared/common.schemas.js";
import { ApiResponse } from "#http/apiResponse.js";

// Model -------------------------------------------------------------
export const BreweryFields = {
  Id: Id.meta({ example: 1 }),
  Name: z.string().trim().min(1).max(120).meta({ example: "Hopfield Brewing" }),
};

// - sortie ----------------------------------------------------
export const Brewery = z.strictObject({
  id: BreweryFields.Id,
  name: BreweryFields.Name,
});

// - réponses --------------------------------------------------
// Liste entière, pour le select du formulaire de bière : sans pagination,
// `ApiListResponse` n'aurait pas de `meta` honnête à donner.
export const BreweryListResponse = ApiResponse(z.array(Brewery));
