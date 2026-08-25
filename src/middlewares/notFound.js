import * as z from "zod";

/**
 * Forme des réponses 404. Un message et rien d'autre : il n'y a pas de détail
 * à donner sur une route qui n'existe pas. Alimente `components.schemas` de la
 * spec OpenAPI.
 */
export const NotFoundError = z.object({
  error: z.string(),
});

/** @typedef {z.infer<typeof NotFoundError>} NotFoundErrorBody */

/**
 * Répond 404 pour toute route non reconnue. À monter après les routes : ce qui
 * arrive ici n'a été reconnu par aucune d'elles.
 *
 * Ne couvre pas les 404 « ressource absente », que les contrôleurs produisent
 * après consultation de la base.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response<NotFoundErrorBody>} res
 */
export default (req, res) => res.status(404).json({ error: "Not found" });
