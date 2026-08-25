import * as z from "zod";

// Model -------------------------------------------------------------
export const BreweryFields = {
  Id: z.number().int().min(1),
};
