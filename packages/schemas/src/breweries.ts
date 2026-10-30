import * as z from "zod"

import { Id } from "./common.ts"

export const BreweryFields = {
  Id: Id.meta({ example: 1 }),
  Name: z.string().trim().min(1).max(120).meta({ example: "Hopfield Brewing" }),
}

export const Brewery = z.strictObject({
  id: BreweryFields.Id,
  name: BreweryFields.Name,
})
