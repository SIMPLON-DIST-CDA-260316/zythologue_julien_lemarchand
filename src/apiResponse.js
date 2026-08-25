/**
 * Enveloppe des réponses en succès — seul propriétaire de sa forme.
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

/** Émet une ressource unique — `status` à 201 sur une création. */
export const sendOne = (res, data, status = 200) =>
  res.status(status).json({ data });

/** Émet une collection. `total` est à passer dès qu'un LIMIT existe. */
export const sendMany = (res, data, total = data.length) =>
  res.status(200).json({ data, meta: { total } });
