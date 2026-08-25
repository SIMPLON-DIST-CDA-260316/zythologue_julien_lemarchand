/**
 * Enveloppe des réponses en succès — seul propriétaire de sa forme.
 *
 * Toute réponse 2xx porte sa charge utile sous `data`, les erreurs gardent
 * `error`. Sur une collection c'est nécessaire : un array racine ne pourra
 * jamais accueillir `meta` sans casser les clients. Sur une ressource unique
 * c'est par cohérence, pour une seule règle de déballage côté client.
 *
 * Les fabriques alimentent la spec OpenAPI, les `send*` sont ce que les
 * handlers appellent — un handler qui construit `{ data }` à la main fait
 * diverger la doc et la réponse sans que rien n'échoue au démarrage.
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
