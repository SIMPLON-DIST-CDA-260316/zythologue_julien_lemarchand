import { EllipsisIcon } from "lucide-react"
import { useState } from "react"
import { useSearchParams } from "react-router"

import { formatAlcoholContent, type Beer } from "@/entities/beer"
import { CreateBeerDialog } from "@/features/create-beer"
import { DeleteBeerDialog } from "@/features/delete-beer"
import { EditBeerDialog } from "@/features/edit-beer"
import type { ApiListResponse } from "@/shared/api"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
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

  function handleCreated() {
    if (pageNumber === 1) beersQuery.reload()
    else goToPage(1)
  }

  function handleDeleted() {
    const wasLastOnPage =
      beersQuery.status === "success" && beersQuery.response.data.length === 1
    if (wasLastOnPage && pageNumber > 1) goToPage(pageNumber - 1)
    else beersQuery.reload()
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-6 lg:px-6">
      <div className="flex justify-end">
        <CreateBeerDialog onCreated={handleCreated} />
      </div>
      <BeerList
        beersQuery={beersQuery}
        onPageChange={goToPage}
        onBeerDeleted={handleDeleted}
      />
    </div>
  )
}

function BeerList({
  beersQuery,
  onPageChange,
  onBeerDeleted,
}: {
  beersQuery: ReturnType<typeof useBeers>
  onPageChange: (page: number) => void
  onBeerDeleted: () => void
}) {
  if (beersQuery.status === "error") {
    return (
      <p className="text-sm text-destructive">
        Impossible de charger les bières. Réessayez plus tard.
      </p>
    )
  }

  if (beersQuery.status === "success" && beersQuery.response.meta.total === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucune bière pour le moment.
      </p>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Brasserie</TableHead>
            <TableHead>Degré</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {beersQuery.status === "loading" ? (
            <LoadingRows />
          ) : (
            beersQuery.response.data.map((beer) => (
              <BeerRow
                key={beer.id}
                beer={beer}
                onUpdated={beersQuery.reload}
                onDeleted={onBeerDeleted}
              />
            ))
          )}
        </TableBody>
      </Table>

      {beersQuery.status === "success" && (
        <Pagination meta={beersQuery.response.meta} onPageChange={onPageChange} />
      )}
    </>
  )
}

function LoadingRows() {
  return Array.from({ length: PAGE_SIZE }, (_, i) => (
    <TableRow key={i}>
      <TableCell colSpan={4}>
        <Skeleton className="h-5 w-full" />
      </TableCell>
    </TableRow>
  ))
}

type BeerRowProps = {
  beer: Beer
  onUpdated: () => void
  onDeleted: () => void
}

function BeerRow({ beer, onUpdated, onDeleted }: BeerRowProps) {
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
      <TableCell className="text-right">
        <BeerActions beer={beer} onUpdated={onUpdated} onDeleted={onDeleted} />
      </TableCell>
    </TableRow>
  )
}

function BeerActions({ beer, onUpdated, onDeleted }: BeerRowProps) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Actions pour ${beer.name}`}
            />
          }
        >
          <EllipsisIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditing(true)}>
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setDeleting(true)}>
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditBeerDialog
        beer={beer}
        open={editing}
        onOpenChange={setEditing}
        onUpdated={onUpdated}
      />
      <DeleteBeerDialog
        beer={beer}
        open={deleting}
        onOpenChange={setDeleting}
        onDeleted={onDeleted}
      />
    </>
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
