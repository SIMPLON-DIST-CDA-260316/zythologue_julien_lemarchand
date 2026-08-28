import * as z from "zod";
import { Id } from "#shared/common.schemas.js";

// Model -------------------------------------------------------------
export const CategoryFields = {
  Id,
  Name: z.string().trim().min(1).max(60),
};

// - sortie ----------------------------------------------------
export const Category = z.strictObject({
  id: CategoryFields.Id,
  name: CategoryFields.Name,
});
