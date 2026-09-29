import repository from "./users.repository.js";
import { ConflictError } from "#errors/ConflictError.js";
import { PG_ERROR } from "#config/database.js";
import { hashPassword } from "#features/auth/auth.lib.js";

// TODO: deuxième occurrence de cette fonction (../beers/beers.service.js), signature légèrement différente. À refactoriser à l'occasion.
const toDomainError = (error) => {
  if (error.code === PG_ERROR.UNIQUE_VIOLATION)
    return new ConflictError("User", ["email"]);
  return error;
};

export default {
  createOne: async ({ email, password }) => {
    try {
      const hashed_password = await hashPassword(password);
      return await repository.createOne({ email, hashed_password });
    } catch (error) {
      throw toDomainError(error);
    }
  },
};
