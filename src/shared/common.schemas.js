import * as z from "zod";

// TIMESTAMPTZ en base, sérialisé en ISO 8601 UTC par `res.json()`.
export const TimeStampTZ = z.iso.datetime();
export const CreatedAt = TimeStampTZ.meta({
  example: "2026-08-26T19:17:59.934Z",
});
export const UpdatedAt = TimeStampTZ.meta({
  example: "2026-08-26T19:17:59.934Z",
});
