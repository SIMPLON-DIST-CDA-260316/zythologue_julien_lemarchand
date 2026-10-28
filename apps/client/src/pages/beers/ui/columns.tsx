import {
  columnVisibilityFeature,
  createColumnHelper,
  rowPaginationFeature,
  tableFeatures,
} from "@tanstack/react-table"

import { formatAlcoholContent, type Beer } from "@/entities/beer"

import { BeerActions } from "./BeerActions"

export const features = tableFeatures({
  columnVisibilityFeature,
  rowPaginationFeature,
})

const columnHelper = createColumnHelper<typeof features, Beer>()

// Une fonction plutôt qu'une constante : la cellule d'actions a besoin des
// callbacks de la page.
export function getBeerColumns({
  onUpdated,
  onDeleted,
}: {
  onUpdated: () => void
  onDeleted: () => void
}) {
  return columnHelper.columns([
    columnHelper.accessor("name", {
      header: "Nom",
      enableHiding: false,
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor("brewery.name", {
      header: "Brasserie",
    }),
    columnHelper.accessor("alcohol_content", {
      header: "Degré",
      cell: (info) => {
        const value = info.getValue()
        return value === null ? (
          <span className="text-muted-foreground">Non renseigné</span>
        ) : (
          formatAlcoholContent(value)
        )
      },
    }),
    columnHelper.display({
      id: "actions",
      enableHiding: false,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="text-right">
          <BeerActions
            beer={row.original}
            onUpdated={onUpdated}
            onDeleted={onDeleted}
          />
        </div>
      ),
    }),
  ])
}
