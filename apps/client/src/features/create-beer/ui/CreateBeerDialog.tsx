import { PlusIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog"

import { CreateBeerForm } from "./CreateBeerForm"

export function CreateBeerDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)

  function handleCreated() {
    setOpen(false)
    onCreated()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <PlusIcon data-icon="inline-start" />
        Ajouter une bière
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une bière</DialogTitle>
        </DialogHeader>
        <CreateBeerForm onCreated={handleCreated} />
      </DialogContent>
    </Dialog>
  )
}
