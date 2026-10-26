// Forme renvoyée par `GET /users/me` (schéma `SafeUser` de l'API).
export type User = {
  id: number
  email: string
  first_name: string | null
  last_name: string | null
  role: "customer" | "brewer" | "admin"
  photo_id: number | null
  created_at: string
  updated_at: string
}
