import { useState } from "react"
import { toast } from "sonner"

import { deleteBeer, type Beer } from "@/entities/beer"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog"
import { FieldError } from "@/shared/ui/field"

export function DeleteBeerDialog({
  beer,
  open,
  onOpenChange,
  onDeleted,
}: {
  beer: Beer
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: () => void
}) {
  const [submitError, setSubmitError] = useState<string>()
  const [pending, setPending] = useState(false)

  async function handleDelete() {
    setSubmitError(undefined)
    setPending(true)
    try {
      await deleteBeer(beer.id)
      toast.success("Bière supprimée")
      onOpenChange(false)
      onDeleted()
    } catch {
      setSubmitError("Suppression impossible, réessayez plus tard")
    } finally {
      setPending(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer « {beer.name} » ?</AlertDialogTitle>
          <AlertDialogDescription>
            Ses avis, favoris, photos et compositions seront aussi supprimés,
            y compris ceux des autres utilisateurs. Cette action est
            irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <FieldError>{submitError}</FieldError>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={handleDelete}
          >
            {pending ? "Suppression…" : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
