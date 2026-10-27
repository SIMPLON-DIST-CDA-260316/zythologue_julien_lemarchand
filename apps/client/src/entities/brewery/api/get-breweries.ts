import { apiFetch, type ApiResponse } from "@/shared/api"

import type { Brewery } from "../model/brewery"

export async function getBreweries(signal?: AbortSignal): Promise<Brewery[]> {
  const res = await apiFetch("/breweries", { signal })
  const json: ApiResponse<Brewery[]> = await res.json()
  return json.data
}
