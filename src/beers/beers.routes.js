import { Router } from "express";
import controller from "./beers.controller.js";
import { IdParam, NewBeer } from "./beers.schema.js";
import {
  validateBody,
  validateParam,
} from "../middlewares/validateRequest.js";
const router = Router();

/**
 * @openapi
 * /beers:
 *   get:
 *     summary: récupère toutes les bières (sans filtre ni pagination à ce stade)
 *     responses:
 *       200:
 *         description: Liste de toutes les bières
 *       500:
 *         description: Erreur serveur
 *   post:
 *     summary: crée une nouvelle bière
 *     requestBody:
 *     responses:
 *       201:
 *         description: La bière a été créée
 *       400:
 *         description: Mauvaise requête
 *       500:
 *         description: Erreur serveur
 */
router
  .route("/")
  .get(controller.readAll)
  .post(validateBody(NewBeer), controller.createOne);

/**
 * @openapi
 * /beers/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       description: la clef primaire d'une bière
 *       schema:
 *         type: integer
 *         minimum: 1
 *   get:
 *     summary: récupère une bière par son ID
 *     responses:
 *       200:
 *         description: La bière demandée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BeerDetails'
 *       400:
 *         description: L'ID fourni n'est pas un entier positif
 *       404:
 *         description: La bière n'a pas été trouvée
 *       500:
 *         description: Erreur serveur
 *   put:
 *     summary: met à jour une bière par son ID
 *     requestBody:
 *     responses:
 *       200:
 *         description: La bière mise à jour
 *       400:
 *         description: L'ID fourni n'est pas un entier positif
 *       404:
 *         description: La bière n'a pas été trouvée
 *       500:
 *         description: Erreur serveur
 *   delete:
 *     summary: supprime une bière par son ID
 *     responses:
 *       204:
 *         description: La bière a été supprimée
 *       400:
 *         description: L'ID fourni n'est pas un entier positif
 *       404:
 *         description: La bière n'a pas été trouvée
 *       500:
 *         description: Erreur serveur
 */
router
  .param("id", validateParam(IdParam))
  .route("/:id")
  .get(controller.readOne)
  .put(controller.updateOne)
  .delete(controller.deleteOne);

export default router;
