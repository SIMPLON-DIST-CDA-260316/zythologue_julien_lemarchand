import { apiFetch } from "@/shared/api"

import type { LoginValues } from "../model/login-schema"

export async function login(values: LoginValues) {
  await apiFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  })
}
