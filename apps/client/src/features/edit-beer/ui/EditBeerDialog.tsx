import type { Beer } from "@/entities/beer"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"

import { EditBeerForm } from "./EditBeerForm"

// Ouvert depuis un menu : le menu se démonte en se fermant, il ne peut
// donc pas porter le DialogTrigger. C'est la ligne qui tient `open`.
export function EditBeerDialog({
  beer,
  open,
  onOpenChange,
  onUpdated,
}: {
  beer: Beer
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: () => void
}) {
  function handleUpdated() {
    onOpenChange(false)
    onUpdated()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier une bière</DialogTitle>
        </DialogHeader>
        <EditBeerForm
          beer={beer}
          onUpdated={handleUpdated}
          onUnchanged={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
