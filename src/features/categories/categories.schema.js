import * as z from "zod";

// Model -------------------------------------------------------------
export const CategoryFields = {
  Id: z.number().int().min(1),
  Name: z.string().trim().min(1).max(60),
};

// - sortie ----------------------------------------------------
export const Category = z.strictObject({
  id: CategoryFields.Id,
  name: CategoryFields.Name,
});
