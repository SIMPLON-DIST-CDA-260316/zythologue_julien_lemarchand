import { apiFetch, type ApiListResponse } from "@/shared/api"

import type { Beer } from "../model/beer"

export async function getBeers(
  { pageNumber, pageSize }: { pageNumber: number; pageSize: number },
  signal?: AbortSignal,
): Promise<ApiListResponse<Beer>> {
  const res = await apiFetch(`/beers?page=${pageNumber}&size=${pageSize}`, { signal })
  return res.json()
}
