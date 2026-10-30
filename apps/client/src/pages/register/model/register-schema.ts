import { Email, Password } from "@zytho/schemas"
import { z } from "zod"

export const registerSchema = z.object({
  email: Email,
  password: Password,
})

export type RegisterValues = z.infer<typeof registerSchema>
