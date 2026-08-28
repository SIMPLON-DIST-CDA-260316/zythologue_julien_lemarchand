import * as z from "zod";
import { Id } from "#shared/common.schemas.js";

// Model -------------------------------------------------------------
export const BreweryFields = {
  Id: Id.meta({ example: 1 }),
  Name: z.string().trim().min(1).max(120),
};
