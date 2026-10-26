import { ApiError, apiFetch } from "@/shared/api"

import type { User } from "../model/user"

export async function getMe(): Promise<User | null> {
  try {
    const res = await apiFetch("/users/me")
    const json: { data: User } = await res.json()
    return json.data
  } catch (error) {
    // `null` = pas de session (401). Toute autre erreur remonte à l'appelant.
    if (error instanceof ApiError && error.status === 401) return null
    throw error
  }
}
