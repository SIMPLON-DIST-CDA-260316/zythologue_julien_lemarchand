import type { BeerListItem } from "@zytho/schemas"
import type { z } from "zod"

// Forme renvoyée par `GET /beers`.
export type Beer = z.infer<typeof BeerListItem>

export type NewBeer = {
  name: string
  description?: string | null
  alcohol_content?: number | null
  brewery_id: number
}

const percentFormat = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 })

export function formatAlcoholContent(alcoholContent: number) {
  return `${percentFormat.format(alcoholContent)} %`
}
