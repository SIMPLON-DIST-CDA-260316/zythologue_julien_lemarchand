import z from "zod";

import { UserFields } from "#features/users/users.schemas.js";

export const Login = z.object({
  email: UserFields.Email,
  password: z.string().min(1),
});
