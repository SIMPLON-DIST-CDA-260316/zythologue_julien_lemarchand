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
  checkAuth: async (token) => {
    let id;
    try {
      id = verifyToken(token);
    } catch {
      throw new UnauthorizedError();
    }

    const user = await userService.findOne(id);
    if (!user) throw new UnauthorizedError();

    return user;
  },
};
