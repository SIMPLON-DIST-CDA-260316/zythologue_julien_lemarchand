import { useSearchParams } from "react-router"

import { formatAlcoholContent, type Beer } from "@/entities/beer"
import type { ApiListResponse } from "@/shared/api"
import { Button } from "@/shared/ui/button"
import { Skeleton } from "@/shared/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"

import { PAGE_SIZE, useBeers } from "../model/use-beers"

export default function BeersPage() {
  // Dans l'URL plutôt qu'en state : F5 et « précédent » gardent la page.
  const [searchParams, setSearchParams] = useSearchParams()
  const pageNumber = Number(searchParams.get("page")) || 1
  const beersQuery = useBeers(pageNumber)

  function goToPage(target: number) {
    setSearchParams({ page: String(target) })
  }

  if (beersQuery.status === "error") {
    return (
      <p className="px-4 py-6 text-sm text-destructive lg:px-6">
        Impossible de charger les bières. Réessayez plus tard.
      </p>
    )
  }

  if (beersQuery.status === "success" && beersQuery.response.meta.total === 0) {
    return (
      <p className="px-4 py-6 text-sm text-muted-foreground lg:px-6">
        Aucune bière pour le moment.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-6 lg:px-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Brasserie</TableHead>
            <TableHead>Degré</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {beersQuery.status === "loading" ? (
            <LoadingRows />
          ) : (
            beersQuery.response.data.map((beer) => <BeerRow key={beer.id} beer={beer} />)
          )}
        </TableBody>
      </Table>

      {beersQuery.status === "success" && (
        <Pagination meta={beersQuery.response.meta} onPageChange={goToPage} />
      )}
    </div>
  )
}

function LoadingRows() {
  return Array.from({ length: PAGE_SIZE }, (_, i) => (
    <TableRow key={i}>
      <TableCell colSpan={3}>
        <Skeleton className="h-5 w-full" />
      </TableCell>
    </TableRow>
  ))
}

function BeerRow({ beer }: { beer: Beer }) {
  return (
    <TableRow>
      <TableCell className="font-medium">{beer.name}</TableCell>
      <TableCell>{beer.brewery.name}</TableCell>
      <TableCell>
        {beer.alcohol_content === null ? (
          <span className="text-muted-foreground">Non renseigné</span>
        ) : (
          formatAlcoholContent(beer.alcohol_content)
        )}
      </TableCell>
    </TableRow>
  )
}

function Pagination({
  meta,
  onPageChange,
}: {
  meta: ApiListResponse<unknown>["meta"]
  onPageChange: (page: number) => void
}) {
  const totalPages = Math.ceil(meta.total / meta.size)

  return (
    <div className="flex items-center justify-end gap-2">
      <span className="text-sm text-muted-foreground">
        Page {meta.page} sur {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={meta.page <= 1}
        onClick={() => onPageChange(meta.page - 1)}
      >
        Précédent
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={meta.page >= totalPages}
        onClick={() => onPageChange(meta.page + 1)}
      >
        Suivant
      </Button>
    </div>
  )
}
