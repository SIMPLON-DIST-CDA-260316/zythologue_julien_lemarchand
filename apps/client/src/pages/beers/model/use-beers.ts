import { useEffect, useState } from "react"

import { getBeers, type Beer } from "@/entities/beer"
import type { ApiListResponse } from "@/shared/api"

// La première sert par défaut. Fixées ici plutôt que laissées au défaut de
// l'API : le squelette de chargement doit avoir autant de lignes que la page
// qui arrive.
export const PAGE_SIZES = [12, 24, 48]

type FetchResult =
  | { pageNumber: number; pageSize: number; status: "success"; response: ApiListResponse<Beer> }
  | { pageNumber: number; pageSize: number; status: "error" }

export function useBeers(pageNumber: number, pageSize: number) {
  const [lastResult, setLastResult] = useState<FetchResult | null>(null)
  // Sa valeur ne compte pas : chaque changement relance l'effet.
  const [reloadTrigger, setReloadTrigger] = useState(0)

  useEffect(() => {
    // Sans ça, la réponse d'une page quittée peut arriver après la suivante
    // et l'écraser.
    const controller = new AbortController()

    getBeers({ pageNumber, pageSize }, controller.signal)
      .then((response) => setLastResult({ pageNumber, pageSize, status: "success", response }))
      .catch(() => {
        if (!controller.signal.aborted) setLastResult({ pageNumber, pageSize, status: "error" })
      })

    return () => controller.abort()
  }, [pageNumber, pageSize, reloadTrigger])

  const reload = () => setReloadTrigger((trigger) => trigger + 1)

  if (lastResult?.pageNumber !== pageNumber || lastResult.pageSize !== pageSize) {
    return { status: "loading", reload } as const
  }
  return { ...lastResult, reload }
}
