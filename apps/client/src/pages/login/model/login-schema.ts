import { z } from "zod"

import { emailSchema, passwordSchema } from "@/entities/user"

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export type LoginValues = z.infer<typeof loginSchema>
