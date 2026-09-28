import repository from "./users.repository.js";
import { PG_ERROR } from "#config/database.js";

const translate = (error, body) => {
  if (error.code === PG_ERROR.FOREIGN_KEY_VIOLATION)
    return new InvalidReferenceError("brewery_id", body.brewery_id);
  if (error.code === PG_ERROR.UNIQUE_VIOLATION)
    return new ConflictError("Beer", ["name", "brewery_id"]);
  return error;
};

export default {
  createOne: async (body) => {
    try {
      return await repository.createOne(body);
    } catch (error) {
      throw translate(error, body);
    }
  },
};
