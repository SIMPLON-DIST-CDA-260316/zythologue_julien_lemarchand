import { z } from "zod"

// Mêmes règles que le schéma `Login` de l'API.
export const loginSchema = z.object({
  email: z.email({ pattern: z.regexes.rfc5322Email }),
  password: z.string().min(1, "Password is required"),
})

export type LoginValues = z.infer<typeof loginSchema>
