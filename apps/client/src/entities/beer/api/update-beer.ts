import { apiFetch } from "@/shared/api"

import type { NewBeer } from "../model/beer"

export async function updateBeer(id: number, changes: Partial<NewBeer>) {
  await apiFetch(`/beers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(changes),
  })
}
