import { RouteNotFoundError } from "#http/errors/RouteNotFoundError.js";

/** À monter après les routes : ce qui arrive ici n'a été reconnu par aucune. */
export default (req, res, next) =>
  next(new RouteNotFoundError(req.method, req.originalUrl));
