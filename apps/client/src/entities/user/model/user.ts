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

export function getFullName(user: User) {
  const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
  return fullName || null
}

export function getInitials(user: User) {
  const initials = (user.first_name?.[0] ?? "") + (user.last_name?.[0] ?? "")
  return initials.toUpperCase() || null
}
