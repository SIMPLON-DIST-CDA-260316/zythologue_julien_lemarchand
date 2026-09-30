import userService from "#features/users/users.service.js";
import { InvalidCredentialsError } from "#errors/InvalidCredentialsError.js";
import { UnauthorizedError } from "#errors/UnauthorizedError.js";
import { verifyPassword, generateToken, verifyToken } from "./auth.lib.js";

export default {
  login: async ({ email, password }) => {
    const user = await userService.findByEmail({ email });

    if (!user) throw new InvalidCredentialsError();

    const isValide = await verifyPassword(user.hashed_password, password);

    if (!isValide) throw new InvalidCredentialsError();

    return generateToken(user.id);
  },
  checkAuth: (token) => {
    try {
      return verifyToken(token);
    } catch {
      throw new UnauthorizedError();
    }
  },
};
