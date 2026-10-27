import { apiFetch } from "@/shared/api"

import type { Beer } from "../model/beer"

export type BeerPage = {
  data: Beer[]
  meta: { total: number; page: number; size: number }
}

export async function getBeers(page: number, signal?: AbortSignal): Promise<BeerPage> {
  const res = await apiFetch(`/beers?page=${page}`, { signal })
  return res.json()
}
