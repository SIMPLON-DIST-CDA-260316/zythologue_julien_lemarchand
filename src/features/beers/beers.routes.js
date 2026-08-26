import { Router } from "express";
import controller from "./beers.controller.js";
import { BeerIdParam, NewBeer, UpdateBeer } from "./beers.schemas.js";
import {
  validateBody,
  validateParam,
} from "#http/middlewares/validateRequest.js";
const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Beers
 *     description: >
 *       Catalogue des bières : la ressource, sa composition et ses points de
 *       vente. Chaque bière appartient à une brasserie et y porte un nom unique.
 */

router
  .route("/")
  /**
   * @openapi
   * /beers:
   *   get:
   *     tags: [Beers]
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
   */
  .get(controller.findAll)
  /**
   * @openapi
   * /beers:
   *   post:
   *     tags: [Beers]
   *     summary: crée une nouvelle bière
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/NewBeer'
   *           examples:
   *             minimale:
   *               summary: les seuls champs obligatoires
   *               value:
   *                 name: Gueuze du Béguinage
   *                 brewery_id: 1
   *             complete:
   *               summary: tous les champs renseignés
   *               value:
   *                 name: Ambrée des Wateringues
   *                 description: Ambrée maltée, finale légèrement caramélisée.
   *                 alcohol_content: 6.8
   *                 brewery_id: 2
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
   *               $ref: '#/components/schemas/ApiValidationError'
   *       409:
   *         $ref: '#/components/responses/Conflict'
   *       422:
   *         $ref: '#/components/responses/UnprocessableContent'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  .post(validateBody(NewBeer), controller.createOne);

router
  /**
   * @openapi
   * components:
   *   parameters:
   *     BeerId:
   *       in: path
   *       name: id
   *       required: true
   *       description: la clef primaire d'une bière
   *       schema:
   *         $ref: '#/components/schemas/BeerIdParam'
   */
  .param("id", validateParam(BeerIdParam))
  .route("/:id")
  /**
   * @openapi
   * /beers/{id}:
   *   get:
   *     tags: [Beers]
   *     summary: récupère une bière par son ID
   *     parameters:
   *       - $ref: '#/components/parameters/BeerId'
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
   *               $ref: '#/components/schemas/ApiValidationError'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  .get(controller.getOne)
  /**
   * @openapi
   * /beers/{id}:
   *   patch:
   *     tags: [Beers]
   *     summary: met à jour une bière par son ID
   *     description: >
   *       Mise à jour partielle : une clé absente laisse la colonne inchangée,
   *       une clé à `null` l'efface. Au moins un champ est requis.
   *     parameters:
   *       - $ref: '#/components/parameters/BeerId'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateBeer'
   *           examples:
   *             un_seul_champ:
   *               summary: renommage — les autres colonnes sont laissées intactes
   *               value:
   *                 name: Blonde du Nord — édition d'hiver
   *             effacement:
   *               summary: null efface la colonne, contrairement à son absence
   *               value:
   *                 description: null
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
   *               $ref: '#/components/schemas/ApiValidationError'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         $ref: '#/components/responses/Conflict'
   *       422:
   *         $ref: '#/components/responses/UnprocessableContent'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  .patch(validateBody(UpdateBeer), controller.updateOne)
  /**
   * @openapi
   * /beers/{id}:
   *   delete:
   *     tags: [Beers]
   *     summary: supprime une bière par son ID
   *     parameters:
   *       - $ref: '#/components/parameters/BeerId'
   *     responses:
   *       204:
   *         description: La bière a été supprimée
   *       400:
   *         description: L'ID fourni n'est pas un entier positif
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiValidationError'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  .delete(controller.deleteOne);

export default router;
