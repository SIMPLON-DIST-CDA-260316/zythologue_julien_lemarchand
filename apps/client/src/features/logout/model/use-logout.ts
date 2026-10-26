import { useAuth } from "@/entities/user"

import { postLogout } from "../api/post-logout"

// Déconnexion complète : la session côté API, puis l'état côté client.
export function useLogout() {
  const { clearUser } = useAuth()

  return async function () {
    await postLogout()
    clearUser()
  }
}
