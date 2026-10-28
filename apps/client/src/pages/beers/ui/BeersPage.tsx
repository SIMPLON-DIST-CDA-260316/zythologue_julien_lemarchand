import {
  FlexRender,
  functionalUpdate,
  useTable,
  type PaginationState,
  type Table as TanStackTable,
} from "@tanstack/react-table"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Columns3Icon,
} from "lucide-react"
import { useSearchParams } from "react-router"

import type { Beer } from "@/entities/beer"
import { CreateBeerDialog } from "@/features/create-beer"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { Label } from "@/shared/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { Skeleton } from "@/shared/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"

import { PAGE_SIZES, useBeers } from "../model/use-beers"
import { features, getBeerColumns } from "./columns"

type BeerTable = TanStackTable<typeof features, Beer>

export default function BeersPage() {
  // Dans l'URL plutôt qu'en state : F5 et « précédent » gardent la page.
  const [searchParams, setSearchParams] = useSearchParams()
  const pageNumber = Number(searchParams.get("page")) || 1
  const sizeParam = Number(searchParams.get("size"))
  const pageSize = PAGE_SIZES.includes(sizeParam) ? sizeParam : PAGE_SIZES[0]
  const beersQuery = useBeers(pageNumber, pageSize)

  function setPagination({ pageIndex, pageSize }: PaginationState) {
    setSearchParams({ page: String(pageIndex + 1), size: String(pageSize) })
  }

  function goToPage(target: number) {
    setPagination({ pageIndex: target - 1, pageSize })
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
      <BeerList
        beersQuery={beersQuery}
        pagination={{ pageIndex: pageNumber - 1, pageSize }}
        onPaginationChange={setPagination}
        onBeerCreated={handleCreated}
        onBeerDeleted={handleDeleted}
      />
    </div>
  )
}

const NO_BEERS: Beer[] = []

function BeerList({
  beersQuery,
  pagination,
  onPaginationChange,
  onBeerCreated,
  onBeerDeleted,
}: {
  beersQuery: ReturnType<typeof useBeers>
  pagination: PaginationState
  onPaginationChange: (pagination: PaginationState) => void
  onBeerCreated: () => void
  onBeerDeleted: () => void
}) {
  const table = useTable({
    features,
    data: beersQuery.status === "success" ? beersQuery.response.data : NO_BEERS,
    columns: getBeerColumns({
      onUpdated: beersQuery.reload,
      onDeleted: onBeerDeleted,
    }),
    getRowId: (beer) => String(beer.id),
    // L'API pagine déjà : sans ça, TanStack redécoupe la page reçue.
    manualPagination: true,
    rowCount: beersQuery.status === "success" ? beersQuery.response.meta.total : 0,
    state: { pagination },
    onPaginationChange: (updater) =>
      onPaginationChange(functionalUpdate(updater, pagination)),
  })

  const isEmpty =
    beersQuery.status === "success" && beersQuery.response.meta.total === 0
  const showTable = beersQuery.status !== "error" && !isEmpty

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        {showTable && <ColumnsMenu table={table} />}
        <CreateBeerDialog onCreated={onBeerCreated} />
      </div>

      {beersQuery.status === "error" && (
        <p className="text-sm text-destructive">
          Impossible de charger les bières. Réessayez plus tard.
        </p>
      )}

      {isEmpty && (
        <p className="text-sm text-muted-foreground">
          Aucune bière pour le moment.
        </p>
      )}

      {showTable && (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : <FlexRender header={header} />}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {beersQuery.status === "loading" ? (
                <LoadingRows
                  rowCount={pagination.pageSize}
                  columnCount={table.getVisibleLeafColumns().length}
                />
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        <FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {beersQuery.status === "success" && !isEmpty && (
        <Pagination table={table} pagination={pagination} />
      )}
    </>
  )
}

function ColumnsMenu({ table }: { table: BeerTable }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
        <Columns3Icon data-icon="inline-start" />
        Colonnes
        <ChevronDownIcon data-icon="inline-end" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        {table
          .getAllLeafColumns()
          .filter((column) => column.getCanHide())
          .map((column) => {
            const { header } = column.columnDef
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(checked) => column.toggleVisibility(checked)}
              >
                {typeof header === "string" ? header : column.id}
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function LoadingRows({
  rowCount,
  columnCount,
}: {
  rowCount: number
  columnCount: number
}) {
  return Array.from({ length: rowCount }, (_, i) => (
    <TableRow key={i}>
      <TableCell colSpan={columnCount}>
        <Skeleton className="h-5 w-full" />
      </TableCell>
    </TableRow>
  ))
}

function Pagination({
  table,
  pagination,
}: {
  table: BeerTable
  pagination: PaginationState
}) {
  return (
    <div className="flex items-center justify-end gap-8 px-4">
      <div className="hidden items-center gap-2 lg:flex">
        <Label htmlFor="beers-per-page" className="text-sm font-medium">
          Bières par page
        </Label>
        <Select
          value={String(pagination.pageSize)}
          onValueChange={(value) => table.setPageSize(Number(value))}
          items={PAGE_SIZES.map((size) => ({ label: String(size), value: String(size) }))}
        >
          <SelectTrigger size="sm" className="w-20" id="beers-per-page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="top">
            <SelectGroup>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <span className="text-sm font-medium">
        Page {pagination.pageIndex + 1} sur {table.getPageCount()}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="hidden size-8 lg:flex"
          aria-label="Première page"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.firstPage()}
        >
          <ChevronsLeftIcon />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          aria-label="Page précédente"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
        >
          <ChevronLeftIcon />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          aria-label="Page suivante"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
        >
          <ChevronRightIcon />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="hidden size-8 lg:flex"
          aria-label="Dernière page"
          disabled={!table.getCanNextPage()}
          onClick={() => table.lastPage()}
        >
          <ChevronsRightIcon />
        </Button>
      </div>
    </div>
  )
}
