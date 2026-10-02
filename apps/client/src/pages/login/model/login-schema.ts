import { z } from "zod"

// Règles de format reprises du schéma `Password` de l'API (users.schemas.js).
export const loginSchema = z.object({
  email: z.email({ pattern: z.regexes.rfc5322Email }),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "At least 8 characters")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^a-zA-Z0-9]/, "Must contain a special character"),
})

export type LoginValues = z.infer<typeof loginSchema>
