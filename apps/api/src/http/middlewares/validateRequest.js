/**
 * Validation des entrées HTTP avec zod. Le résultat est écrit sous
 * `req.validated.<source>`, jamais sur `req.body`/`params`/`query`
 * (nécessaire pour `query`, un getter sans setter en Express 5).
 *
 * @module http/middlewares/validateRequest
 */
import { ValidationError } from "#http/errors/ValidationError.js";

/**
 * Valide un paramètre de route (monté via `router.param`, arité différente
 * de `use`) et fusionne le résultat dans `req.validated.params`.
 *
 * @param {import("zod").ZodType} schema
 * @returns {import("express").RequestParamHandler}
 * @example
 * router.param("id", validateParam(BeerIdParam));
 */
export const validateParam =
  (schema) => (req, res, next, rawValue, paramName) => {
    const { success, error, data } = schema.safeParse(rawValue);
    if (!success) throw new ValidationError(error.issues);
    req.validated ??= {};
    req.validated.params ??= {};
    req.validated.params[paramName] = data;
    next();
  };

/**
 * Valide `req[source]` et écrit le résultat dans `req.validated[source]`.
 *
 * @param {"body" | "query"} source
 * @returns {(schema: import("zod").ZodType) => import("express").RequestHandler}
 */
const validateIn = (source) => (schema) => (req, res, next) => {
  const { success, error, data } = schema.safeParse(req[source]);
  if (!success) throw new ValidationError(error.issues);
  req.validated ??= {};
  req.validated[source] = data;
  next();
};

/**
 * @param {import("zod").ZodType} schema
 * @returns {import("express").RequestHandler}
 * @example
 * router.post("/", validateBody(NewBeer), controller.createOne);
 * // req.validated.body
 */
export const validateBody = validateIn("body");

/**
 * @param {import("zod").ZodType} schema
 * @returns {import("express").RequestHandler}
 * @example
 * router.get("/", validateQuery(BeerQuery), controller.findAll);
 * // req.validated.query
 */
export const validateQuery = validateIn("query");
