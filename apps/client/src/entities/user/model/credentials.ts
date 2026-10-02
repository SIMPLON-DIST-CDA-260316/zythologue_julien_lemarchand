import { z } from "zod"

export const emailSchema = z.email({
  pattern: z.regexes.rfc5322Email,
  error: "Adresse email invalide",
})

// Règles reprises du schéma `Password` de l'API (users.schemas.js).
export const passwordSchema = z
  .string()
  .min(1, "Mot de passe requis")
  .min(8, "Au moins 8 caractères")
  .regex(/[0-9]/, "Doit contenir un chiffre")
  .regex(/[^a-zA-Z0-9]/, "Doit contenir un caractère spécial")
