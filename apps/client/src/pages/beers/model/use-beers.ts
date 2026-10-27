import { useEffect, useState } from "react"

import { getBeers, type Beer } from "@/entities/beer"
import type { ApiListResponse } from "@/shared/api"

type Result =
  | { pageNumber: number; status: "success"; response: ApiListResponse<Beer> }
  | { pageNumber: number; status: "error" }

export function useBeers(pageNumber: number) {
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    // Sans ça, la réponse d'une page quittée peut arriver après la suivante
    // et l'écraser.
    const controller = new AbortController()

    getBeers(pageNumber, controller.signal)
      .then((response) => setResult({ pageNumber, status: "success", response }))
      .catch(() => {
        if (!controller.signal.aborted) setResult({ pageNumber, status: "error" })
      })

    return () => controller.abort()
  }, [pageNumber])

  // `result` est encore celui de la page précédente tant que la nouvelle charge.
  if (result?.pageNumber !== pageNumber) return { status: "loading" } as const
  return result
}
