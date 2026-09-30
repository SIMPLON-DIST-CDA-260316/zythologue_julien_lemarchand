import repository from "./users.repository.js";
import { ConflictError } from "#errors/ConflictError.js";
import { ResourceNotFoundError } from "#errors/ResourceNotFoundError.js";
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
      return await repository.createOne({
        email,
        hashed_password: await hashPassword(password),
      });
    } catch (error) {
      throw toDomainError(error);
    }
  },
  updateOne: async (id, body) => {
    const patch = { ...body };
    if ("password" in patch) {
      patch.hashed_password = await hashPassword(patch.password);
      delete patch.password;
    }
    let user;
    try {
      user = await repository.updateOne(id, patch);
    } catch (error) {
      throw toDomainError(error);
    }
    if (user === null) throw new ResourceNotFoundError("User", id);
    return user;
  },
  findOne: async (id) => {
    try {
      return await repository.findOne(id);
    } catch (error) {
      throw toDomainError(error);
    }
  },
  findByEmail: async ({ email }) => {
    try {
      return await repository.findByEmail({ email });
    } catch (error) {
      throw toDomainError(error);
    }
  },
};
