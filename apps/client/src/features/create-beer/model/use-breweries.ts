import { useEffect, useState } from "react"

import { getBreweries, type Brewery } from "@/entities/brewery"

type BreweriesQuery =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; breweries: Brewery[] }

export function useBreweries() {
  const [query, setQuery] = useState<BreweriesQuery>({ status: "loading" })

  useEffect(() => {
    const controller = new AbortController()
    getBreweries(controller.signal)
      .then((breweries) => setQuery({ status: "success", breweries }))
      .catch(() => {
        if (!controller.signal.aborted) setQuery({ status: "error" })
      })
    return () => controller.abort()
  }, [])

  return query
}
