import userService from "#features/users/users.services.js";
import { InvalidCredentialsError } from "#errors/InvalidCredentialsError.js";
import { verifyPassword } from "./auth.lib.js";
import jwt from "jsonwebtoken";

const JWT_DURATION = "15m";

const generateToken = (id) => {
  // https://datatracker.ietf.org/doc/html/rfc7519
  const payload = { sub: String(id) };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: JWT_DURATION,
  });
};

export default {
  loginUser: async ({ email, password }) => {
    const user = await userService.findByEmail({ email });

    if (!user) throw new InvalidCredentialsError();

    const isValide = await verifyPassword(user.hashed_password, password);

    if (!isValide) throw new InvalidCredentialsError();

    return generateToken(user.id);
  },
};
