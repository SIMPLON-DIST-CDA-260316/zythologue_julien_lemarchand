import { z } from "zod"

export function firstFieldErrors<T>(error: z.ZodError<T>) {
  const { fieldErrors } = z.flattenError(error)
  return Object.fromEntries(
    Object.entries<string[] | undefined>(fieldErrors).map(
      ([field, messages]) => [field, messages?.[0]],
    ),
  ) as Partial<Record<keyof T, string>>
}
