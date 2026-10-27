import { useEffect, useState } from "react"

import { getBeers, type Beer } from "@/entities/beer"
import type { ApiListResponse } from "@/shared/api"

type Result =
  | { page: number; status: "success"; response: ApiListResponse<Beer> }
  | { page: number; status: "error" }

export function useBeers(page: number) {
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    // Sans ça, la réponse d'une page quittée peut arriver après la suivante
    // et l'écraser.
    const controller = new AbortController()

    getBeers(page, controller.signal)
      .then((response) => setResult({ page, status: "success", response }))
      .catch(() => {
        if (!controller.signal.aborted) setResult({ page, status: "error" })
      })

    return () => controller.abort()
  }, [page])

  // `result` est encore celui de la page précédente tant que la nouvelle charge.
  if (result?.page !== page) return { status: "loading" } as const
  return result
}
