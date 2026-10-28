import { z } from "zod"

import { emailSchema } from "@/entities/user"

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Mot de passe requis"),
})

export type LoginValues = z.infer<typeof loginSchema>
