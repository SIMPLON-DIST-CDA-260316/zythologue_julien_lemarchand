import { apiFetch } from "@/shared/api"

export async function postLogout() {
  await apiFetch("/auth/logout", { method: "POST" })
}
