import * as z from "zod";
import { CreatedAt, UpdatedAt } from "#shared/common.schemas.js";

export const ALLOWED_PHOTO_MIMETYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

// Model -------------------------------------------------------------
export const PhotoFields = {
  Id: z.number().int().min(1),
  Url: z.url().max(255),
  Caption: z.string().trim().min(1).max(255).nullable(),
  Mimetype: z.enum(ALLOWED_PHOTO_MIMETYPES),
  CreatedAt,
  UpdatedAt,
};

// - sortie ----------------------------------------------------
// Vue embarquée (beer.photos) — partagée avec review.photo_id en base, pas
// d'endpoint /photos pour l'instant, donc pas d'id exposé.
export const PhotoResponse = z.strictObject({
  id: PhotoFields.Id,
  url: PhotoFields.Url,
  caption: PhotoFields.Caption,
  mimetype: PhotoFields.Mimetype,
  created_at: PhotoFields.CreatedAt,
  updated_at: PhotoFields.UpdatedAt,
});
