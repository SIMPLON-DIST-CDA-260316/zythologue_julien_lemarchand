import * as z from "zod";
import { Brewery } from "@zytho/schemas";
import { ApiResponse } from "#http/apiResponse.js";

// - réponses --------------------------------------------------
// Liste entière, pour le select du formulaire de bière : sans pagination,
// `ApiListResponse` n'aurait pas de `meta` honnête à donner.
export const BreweryListResponse = ApiResponse(z.array(Brewery));
