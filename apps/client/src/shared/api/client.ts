// URL de l'API vue par le navigateur (pas le nom de service Docker `api`).
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    // Sans ça, le navigateur n'envoie pas la cookie `access_token` (autre origine).
    credentials: 'include',
  })

  // `fetch` ne rejette pas sur 4xx/5xx : c'est à nous de tester `res.ok`.
  if (!res.ok) {
    const json = await res.json().catch(() => undefined)
    throw new ApiError(json?.error ?? `HTTP ${res.status}`, res.status)
  }

  return res
}
