import * as z from "zod";

// Model -------------------------------------------------------------
export const PhotoFields = {
  Id: z.number().int().min(1),
  Url: z.url().max(255),
  Caption: z.string().trim().min(1).max(255).nullable(),
};

// - sortie ----------------------------------------------------
// Vue embarquée (beer.photos) — partagée avec review.photo_id en base, pas
// d'endpoint /photos pour l'instant, donc pas d'id exposé.
export const Photo = z.strictObject({
  url: PhotoFields.Url,
  caption: PhotoFields.Caption,
});
