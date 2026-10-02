import { apiFetch } from "@/shared/api"

export async function logout() {
  await apiFetch("/auth/logout", { method: "POST" })
}
