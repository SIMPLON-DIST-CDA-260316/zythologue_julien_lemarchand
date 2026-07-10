import * as z from "zod";

export const IdParam = z.coerce.number().int().min(1);
