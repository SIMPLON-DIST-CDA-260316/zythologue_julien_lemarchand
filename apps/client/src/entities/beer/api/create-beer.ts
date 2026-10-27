import { apiFetch } from "@/shared/api"

import type { NewBeer } from "../model/beer"

export async function createBeer(newBeer: NewBeer) {
  await apiFetch("/beers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newBeer),
  })
}
