import { apiFetch } from "@/shared/api"

export async function deleteBeer(id: number) {
  await apiFetch(`/beers/${id}`, { method: "DELETE" })
}
