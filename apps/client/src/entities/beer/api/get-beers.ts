import { apiFetch, type ApiListResponse } from "@/shared/api"

import type { Beer } from "../model/beer"

export async function getBeers(
  page: number,
  signal?: AbortSignal,
): Promise<ApiListResponse<Beer>> {
  const res = await apiFetch(`/beers?page=${page}`, { signal })
  return res.json()
}
