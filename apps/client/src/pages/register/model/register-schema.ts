import { z } from "zod"

import { emailSchema, passwordSchema } from "@/entities/user"

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export type RegisterValues = z.infer<typeof registerSchema>
