import { createContext, useContext } from "react"

import type { User } from "./user"

export type AuthContextValue = {
  user: User | null
  // `true` tant que le premier `GET /users/me` n'a pas répondu.
  isLoading: boolean
  isAuthenticated: boolean
  refreshUser: () => Promise<void>
  clearUser: () => void
}

// Valeur lue par `useContext` quand aucun `<AuthProvider>` n'est au-dessus :
// `null` permet à `useAuth` de détecter ce cas et de lever une erreur.
export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error(
      "useAuth() doit être appelé dans un composant descendant de <AuthProvider>",
    )
  }
  return context
}
