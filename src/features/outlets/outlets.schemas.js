import * as z from "zod";

import { Address } from "#features/addresses/addresses.schemas.js";

// Model -------------------------------------------------------------
export const OutletFields = {
  Id: z.number().int().min(1),
  Name: z.string().trim().min(1).max(120),
  Type: z.enum(["cellar", "bar", "restaurant", "supermarket"]).nullable(),
  OnlineSales: z
    .boolean()
    .describe("indique si le lieu propose une vente en ligne"),
  Website: z.url().max(255).nullable(),
};

// - sortie ----------------------------------------------------
// Vue embarquée (beer.outlets) — pas d'endpoint /outlets pour l'instant.
export const Outlet = z.strictObject({
  id: OutletFields.Id,
  name: OutletFields.Name,
  type: OutletFields.Type,
  online_sales: OutletFields.OnlineSales,
  website: OutletFields.Website,
  address: Address.nullable().describe(
    "null pour les outlets exclusivement en ligne",
  ),
});
