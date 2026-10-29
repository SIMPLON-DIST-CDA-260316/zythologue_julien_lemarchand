import * as z from "zod"

export const Email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ pattern: z.regexes.rfc5322Email }))

export type EmailValue = z.infer<typeof Email>
