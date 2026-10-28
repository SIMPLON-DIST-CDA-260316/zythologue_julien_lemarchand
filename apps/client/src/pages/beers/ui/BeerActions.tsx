import { EllipsisIcon } from "lucide-react"
import { useState } from "react"

import type { Beer } from "@/entities/beer"
import { DeleteBeerDialog } from "@/features/delete-beer"
import { EditBeerDialog } from "@/features/edit-beer"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"

export type BeerActionsProps = {
  beer: Beer
  onUpdated: () => void
  onDeleted: () => void
}

export function BeerActions({ beer, onUpdated, onDeleted }: BeerActionsProps) {
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
