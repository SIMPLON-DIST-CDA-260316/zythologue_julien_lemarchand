import { ResourceNotFoundError } from "#errors/ResourceNotFoundError.js";
import { HTTP_STATUS, isServerErrorStatus } from "#http/httpStatus.js";

/** Seul point où le domaine reçoit un code HTTP. Absent = imprévu = 500. */
const HTTP_STATUS_BY_ERROR = new Map().set(
  ResourceNotFoundError,
  HTTP_STATUS.NOT_FOUND,
);

/**
 * Terminal, à monter en dernier dans l'app`.
 */
export default (error, req, res, next) => {
  const status =
    HTTP_STATUS_BY_ERROR.get(error.constructor) ??
    HTTP_STATUS.INTERNAL_SERVER_ERROR;

  // Un message de 5xx porte le SQL, l'hôte, les chemins : logs seulement.
  if (isServerErrorStatus(status)) {
    console.error(error);
    return res.status(status).json({ error: "Internal server error" });
  }

  return res.status(status).json({ error: error.message });
};
