/**
 * Enveloppes de réponse — seul propriétaire de leur forme, succès et échec.
 *
 * Un array racine ne pourra jamais accueillir `meta` sans casser les clients ;
 * la ressource unique prend l'enveloppe par cohérence.
 *
 * Les fabriques alimentent la spec OpenAPI, les `send*` sont ce qu'appellent
 * les handlers — construire `{ data }` à la main fait diverger les deux.
 *
 * @module apiResponse
 */
import * as z from "zod";
import { HTTP_STATUS } from "#http/httpStatus.js";

/** Ressource unique : `{ data: <T> }`. */
export const ApiResponse = (schema) => z.strictObject({ data: schema });

/** Collection : `{ data: <T>[], meta }`. */
export const ApiListResponse = (schema) =>
  z.strictObject({
    data: z.array(schema),
    meta: z.strictObject({
      total: z.number().int().min(0),
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

/** Émet une ressource unique — `status` à `CREATED` sur une création. */
export const sendOne = (res, data, status = HTTP_STATUS.OK) =>
  res.status(status).json({ data });

/** Émet une collection. `total` est à passer dès qu'un LIMIT existe. */
export const sendMany = (res, data, total = data.length) =>
  res.status(HTTP_STATUS.OK).json({ data, meta: { total } });
