import * as z from "zod";
import { Id, CreatedAt, UpdatedAt } from "#shared/common.schemas.js";
import { ApiResponse } from "#http/apiResponse.js";

export const ALLOWED_PHOTO_MIMETYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const PHOTO_MIMETYPE_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// Model -------------------------------------------------------------
export const PhotoFields = {
  Id,
  Url: z.url().max(255),
  Caption: z.string().trim().min(1).max(255).nullable(),
  Mimetype: z.enum(ALLOWED_PHOTO_MIMETYPES),
  CreatedAt,
  UpdatedAt,
};


// - entrée ----------------------------------------------------
export const NewPhoto = z.strictObject({
  caption: PhotoFields.Caption.optional(),
});

// - sortie ----------------------------------------------------
// Vue embarquée (beer.photos), partagée avec review.photo_id en base — pas
// de ressource /photos autonome, donc réutilisée telle quelle en réponse de
// POST /beers/:id/photos.
export const Photo = z.strictObject({
  id: PhotoFields.Id,
  url: PhotoFields.Url,
  caption: PhotoFields.Caption,
  mimetype: PhotoFields.Mimetype,
  created_at: PhotoFields.CreatedAt,
  updated_at: PhotoFields.UpdatedAt,
});

export const PhotoResponse = ApiResponse(Photo);