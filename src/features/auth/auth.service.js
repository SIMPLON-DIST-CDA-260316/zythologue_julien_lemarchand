import userService from "#features/users/users.services.js";
import { InvalidCredentialsError } from "#errors/InvalidCredentialsError.js";
import { verifyPassword, generateToken } from "./auth.lib.js";

export default {
  loginUser: async ({ email, password }) => {
    const user = await userService.findByEmail({ email });

    if (!user) throw new InvalidCredentialsError();

    const isValide = await verifyPassword(user.hashed_password, password);

    if (!isValide) throw new InvalidCredentialsError();

    return generateToken(user.id);
  },
};
