import * as z from "zod";

// Model -------------------------------------------------------------
export const BreweryFields = {
  Id: z.number().int().min(1).meta({ example: 1 }),
  Name: z.string().trim().min(1).max(120),
};
