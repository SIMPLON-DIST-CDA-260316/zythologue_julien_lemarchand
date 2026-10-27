import { apiFetch, type ApiListResponse } from "@/shared/api"

import type { Beer } from "../model/beer"

export async function getBeers(
  pageNumber: number,
  signal?: AbortSignal,
): Promise<ApiListResponse<Beer>> {
  const res = await apiFetch(`/beers?page=${pageNumber}`, { signal })
  return res.json()
}
