import { Router } from "express";
import controller from "./beers.controller.js";
import { IdParam, NewBeer, UpdateBeer } from "./beers.schemas.js";
import {
  validateBody,
  validateParam,
} from "#http/middlewares/validateRequest.js";
const router = Router();

/**
 * @openapi
 * /beers:
 *   get:
 *     summary: récupère toutes les bières (sans filtre ni pagination à ce stade)
 *     responses:
 *       200:
 *         description: Liste de toutes les bières
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BeerListResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   post:
 *     summary: crée une nouvelle bière
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewBeer'
 *     responses:
 *       201:
 *         description: La bière a été créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BeerResponse'
 *       400:
 *         description: Le corps de la requête ne respecte pas le schéma
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router
  .route("/")
  .get(controller.findAll)
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
 *               $ref: '#/components/schemas/BeerDetailsResponse'
 *       400:
 *         description: L'ID fourni n'est pas un entier positif
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   patch:
 *     summary: met à jour une bière par son ID
 *     description: >
 *       Mise à jour partielle : une clé absente laisse la colonne inchangée,
 *       une clé à `null` l'efface. Au moins un champ est requis.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBeer'
 *     responses:
 *       200:
 *         description: La bière mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BeerResponse'
 *       400:
 *         description: >
 *           L'ID fourni n'est pas un entier positif, ou le corps ne respecte
 *           pas le schéma
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   delete:
 *     summary: supprime une bière par son ID
 *     responses:
 *       204:
 *         description: La bière a été supprimée
 *       400:
 *         description: L'ID fourni n'est pas un entier positif
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router
  .param("id", validateParam(IdParam))
  .route("/:id")
  .get(controller.getOne)
  .patch(validateBody(UpdateBeer), controller.updateOne)
  .delete(controller.deleteOne);

export default router;
