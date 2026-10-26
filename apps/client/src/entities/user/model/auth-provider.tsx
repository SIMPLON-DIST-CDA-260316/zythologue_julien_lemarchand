import { useEffect, useState, type ReactNode } from "react"

import { getMe } from "../api/get-me"
import { AuthContext } from "./auth-context"
import type { User } from "./user"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Au démarrage : une session existe-t-elle déjà (cookie encore valide) ?
  useEffect(() => {
    getMe()
      .then(setUser)
      // API injoignable ou 500 : on se considère comme non connecté.
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  // Après un login : les erreurs remontent, le formulaire les affiche.
  async function refreshUser() {
    setUser(await getMe())
  }

  function clearUser() {
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        refreshUser,
        clearUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
