import * as z from "zod"

// Pas `z.email().trim()` : le format y est contrôlé avant le trim.
export const Email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(
    z.email({
      pattern: z.regexes.rfc5322Email, // https://www.rfc-editor.org/info/rfc5322/
      error: "Adresse email invalide",
    }),
  )
  .describe("unique par utilisateur, la comparaison ignore la casse")
  .meta({ example: "user@domain.com" })

export const Password = z
  .string()
  .min(1, "Mot de passe requis")
  .min(8, "Au moins 8 caractères")
  .max(255, "255 caractères maximum")
  .regex(/[0-9]/, "Doit contenir un chiffre")
  .regex(/[^a-zA-Z0-9]/, "Doit contenir un caractère spécial")
