import * as z from "zod";

// Model -------------------------------------------------------------
export const Brewery = {
  Id: z.number().int().min(1),
};
