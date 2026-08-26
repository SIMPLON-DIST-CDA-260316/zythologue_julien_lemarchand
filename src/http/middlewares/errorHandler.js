import { ResourceNotFoundError } from "#errors/ResourceNotFoundError.js";
import { RouteNotFoundError } from "#http/errors/RouteNotFoundError.js";
import { ValidationError } from "#http/errors/ValidationError.js";
import { HTTP_STATUS, isServerErrorStatus } from "#http/httpStatus.js";

/** Seul point où une classe d'erreur reçoit un code HTTP. Absente = imprévu = 500. */
const HTTP_STATUS_BY_ERROR = new Map()
  .set(ResourceNotFoundError, HTTP_STATUS.NOT_FOUND)
  .set(RouteNotFoundError, HTTP_STATUS.NOT_FOUND)
  .set(ValidationError, HTTP_STATUS.BAD_REQUEST);

/** Terminal, à monter en dernier dans l'app. */
export default (error, req, res, next) => {
  const status =
    HTTP_STATUS_BY_ERROR.get(error.constructor) ??
    HTTP_STATUS.INTERNAL_SERVER_ERROR;

  // Un message de 5xx porte le SQL, l'hôte, les chemins : logs seulement.
  if (isServerErrorStatus(status)) {
    console.error(error);
    return res.status(status).json({ error: "Internal server error" });
  }

  // `details` vient de l'erreur, pas du statut : aucune classe n'est nommée ici.
  return res.status(status).json({
    error: error.message,
    ...(error.details && { details: error.details }),
  });
};
