/**
 * Validation des entrées HTTP avec zod.
 *
 * Chaque validateur remplace la valeur brute par la valeur parsée, si bien que
 * le contrôleur ne reçoit que des champs déclarés. Le format de la réponse 400
 * est défini ici une seule fois : c'est le contrat exposé aux clients.
 *
 * @module middlewares/validateRequest
 */

/**
 * Répond 400 avec les erreurs de validation zod.
 *
 * @param {import("express").Response} res
 * @param {import("zod").ZodError} error
 * @returns {import("express").Response}
 */
const reject = (res, error) => res.status(400).json({ errors: error.issues });

/**
 * Valide un paramètre de route et écrase `req.params[nom]` par la valeur parsée.
 *
 * À monter via `router.param(nom, ...)`, pas via `use` : l'arité est celle des
 * param callbacks Express, qui fournissent la valeur brute et le nom du
 * paramètre en 4e et 5e arguments.
 *
 * @param {import("zod").ZodType} schema
 * @returns {import("express").RequestParamHandler}
 * @example
 * router.param("id", validateParam(IdParam));
 */
export const validateParam =
  (schema) => (req, res, next, rawValue, paramName) => {
    const { success, error, data } = schema.safeParse(rawValue);
    if (!success) return reject(res, error);
    req.params[paramName] = data;
    next();
  };

/**
 * Fabrique un middleware qui valide une clé de `req` et l'écrase par la valeur
 * parsée. Toutes les sources de même arité passent par ici : `body`, `query`.
 *
 * @param {"body" | "query"} source
 * @returns {(schema: import("zod").ZodType) => import("express").RequestHandler}
 */
const validateIn = (source) => (schema) => (req, res, next) => {
  const { success, error, data } = schema.safeParse(req[source]);
  if (!success) return reject(res, error);
  req[source] = data;
  next();
};

/**
 * Valide le corps de la requête et écrase `req.body` par la valeur parsée.
 *
 * @param {import("zod").ZodType} schema
 * @returns {import("express").RequestHandler}
 * @example
 * router.post("/", validateBody(NewBeer), controller.createOne);
 */
export const validateBody = validateIn("body");
