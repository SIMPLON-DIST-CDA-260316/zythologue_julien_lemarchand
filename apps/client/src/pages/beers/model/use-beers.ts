import { useEffect, useState } from "react"

import { getBeers, type Beer } from "@/entities/beer"
import type { ApiListResponse } from "@/shared/api"

type FetchResult =
  | { pageNumber: number; status: "success"; response: ApiListResponse<Beer> }
  | { pageNumber: number; status: "error" }

export function useBeers(pageNumber: number) {
  const [lastResult, setLastResult] = useState<FetchResult | null>(null)

  useEffect(() => {
    // Sans ça, la réponse d'une page quittée peut arriver après la suivante
    // et l'écraser.
    const controller = new AbortController()

    getBeers(pageNumber, controller.signal)
      .then((response) => setLastResult({ pageNumber, status: "success", response }))
      .catch(() => {
        if (!controller.signal.aborted) setLastResult({ pageNumber, status: "error" })
      })

    return () => controller.abort()
  }, [pageNumber])

  if (lastResult?.pageNumber !== pageNumber) return { status: "loading" } as const
  return lastResult
}
