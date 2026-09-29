import userService from "#features/users/users.services.js";
import { InvalidCredentialsError } from "#errors/InvalidCredentialsError.js";
import { verifyPassword } from "./auth.lib.js";

// jwt stub
const generateToken = (id) => ({
  user_id: 1234,
  expiration_date: Date.now() + 3600000,
});

export default {
  loginUser: async ({ email, password }) => {
    const user = await userService.findByEmail({ email });

    if (!user) throw new InvalidCredentialsError();

    const isValide = await verifyPassword(user.hashed_password, password);

    if (!isValide) throw new InvalidCredentialsError();

    return generateToken(user.id);
  },
};
