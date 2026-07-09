import { Router } from "express";
import controller from "../controllers/beer.controller.js";

export default Router()
  /**
   * @openapi
   * /beers:
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
  .post("/", controller.createOne)
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
   */
  .get("/", controller.readAll)
  /**
   * @openapi
   * /beers/{id}:
   *   get:
   *     summary: récupère une bière par son ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: la clef primaire d'une bière
   *         schema:
   *           type: integer
   *           minimum: 1
   *     responses:
   *       200:
   *         description: La bière demandée
   *       404:
   *         description: La bière n'a pas été trouvée
   *       500:
   *         description: Erreur serveur
   */
  .get("/:id", controller.readOne)
  /**
   * @openapi
   * /beers/{id}:
   *   put:
   *     summary: met à jour une bière par son ID
   *     requestBody: // à compléter
   *     responses:
   *       200:
   *         description: La bière mise à jour
   *       404:
   *         description: La bière n'a pas été trouvée
   *       500:
   *         description: Erreur serveur
   */
  .put("/:id", controller.updateOne)
  /**
   * @openapi
   * /beers/{id}:
   *   delete:
   *     summary: supprime une bière par son ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: la clef primaire d'une bière
   *         schema:
   *           type: integer
   *           minimum: 1
   *     responses:
   *       204:
   *         description: La bière a été supprimée
   *       404:
   *         description: La bière n'a pas été trouvée
   *       500:
   *         description: Erreur serveur
   */
  .delete("/:id", controller.deleteOne);
