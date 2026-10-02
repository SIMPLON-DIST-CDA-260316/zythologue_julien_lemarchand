import { apiFetch } from "@/shared/api"

import type { RegisterValues } from "../model/register-schema"

export async function register(values: RegisterValues) {
  await apiFetch("/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  })
}
