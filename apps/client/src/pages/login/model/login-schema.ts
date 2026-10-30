import { Email } from "@zytho/schemas"
import { z } from "zod"

export const loginSchema = z.object({
  email: Email,
  password: z.string().min(1, "Mot de passe requis"),
})

export type LoginValues = z.infer<typeof loginSchema>
