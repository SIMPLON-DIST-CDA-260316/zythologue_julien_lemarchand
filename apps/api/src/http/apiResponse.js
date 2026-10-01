/**
 * Enveloppes de réponse — seul propriétaire de leur forme, succès et échec.
 *
 * Un array racine ne pourra jamais accueillir `meta` sans casser les clients ;
 * la ressource unique prend l'enveloppe par cohérence.
 *
 * Les fabriques alimentent la spec OpenAPI ; les producteurs réels sont
 * ailleurs (`attachResponseHelpers` pour le succès, `errorHandler` pour
 * l'échec) et doivent rester alignés sur les formes décrites ici.
 *
 * @module apiResponse
 */
import * as z from "zod";

/** Ressource unique : `{ data: <T> }`. */
export const ApiResponse = (schema) => z.strictObject({ data: schema });

/** Collection : `{ data: <T>[], meta }`. */
export const ApiListResponse = (schema) =>
  z.strictObject({
    data: z.array(schema),
    meta: z.strictObject({
      total: z.number().int().min(0),
      page: z.number().int().min(1),
      size: z.number().int().min(1),
    }),
  });

/** Échec : `{ error }`. Émis par `errorHandler`, seul producteur de cette forme. */
export const ApiError = z.strictObject({ error: z.string() });

/** Échec de validation : `ApiError`, plus le détail par champ. */
export const ApiValidationError = ApiError.extend({
  details: z.array(
    z.strictObject({
      path: z
        .string()
        .describe(
          "chemin pointé du champ fautif — vide quand l'erreur porte sur le corps entier",
        ),
      message: z.string(),
    }),
  ),
});
