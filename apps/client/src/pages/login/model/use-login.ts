import { useAuth } from "@/entities/user"

import { postLogin } from "../api/post-login"
import type { LoginValues } from "./login-schema"

// Connexion complète : le cookie côté API, puis l'utilisateur côté client.
export function useLogin() {
  const { refreshUser } = useAuth()

  return async function (credentials: LoginValues) {
    await postLogin(credentials)
    await refreshUser()
  }
}
