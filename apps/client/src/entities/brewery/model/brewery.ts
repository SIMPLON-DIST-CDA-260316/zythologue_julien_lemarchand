import type { Brewery as BrewerySchema } from "@zytho/schemas"
import type { z } from "zod"

// Forme renvoyée par `GET /breweries`.
export type Brewery = z.infer<typeof BrewerySchema>
