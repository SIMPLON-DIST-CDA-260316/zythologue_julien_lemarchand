import { useSearchParams } from "react-router"

import { formatAlcoholContent } from "@/entities/beer"
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

import { useBeers } from "../model/use-beers"

export default function BeersPage() {
  // Dans l'URL plutôt qu'en state : F5 et « précédent » gardent la page.
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get("page")) || 1
  const result = useBeers(page)

  function goToPage(target: number) {
    setSearchParams({ page: String(target) })
  }

  if (result.status === "error") {
    return (
      <p className="px-4 py-6 text-sm text-destructive lg:px-6">
        Impossible de charger les bières. Réessayez plus tard.
      </p>
    )
  }

  if (result.status === "success" && result.response.meta.total === 0) {
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
          {result.status === "loading"
            ? Array.from({ length: 5 }, (_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={3}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))
            : result.response.data.map((beer) => (
                <TableRow key={beer.id}>
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
              ))}
        </TableBody>
      </Table>

      {result.status === "success" && (
        <Pagination
          page={page}
          totalPages={Math.ceil(result.response.meta.total / result.response.meta.size)}
          onPageChange={goToPage}
        />
      )}
    </div>
  )
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <span className="text-sm text-muted-foreground">
        Page {page} sur {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Précédent
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Suivant
      </Button>
    </div>
  )
}
