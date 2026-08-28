import { Router } from "express";
import controller from "./beers.controller.js";
import {
  BeerIdParam,
  NewBeer,
  UpdateBeer,
  BeerQuery,
} from "./beers.schemas.js";
import {
  validateBody,
  validateParam,
  validateQuery,
} from "#http/middlewares/validateRequest.js";
import uploadHanlder, {
  requirePhoto,
} from "#features/upload/upload.middleware.js";
import { NewPhoto } from "#features/photos/photos.schemas.js";
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
   *     operationId: listBeers
   *     tags: [Beers]
   *     summary: récupère toutes les bières
   *     description: >
   *       Renvoie la représentation nue de chaque bière. Composition, points de
   *       vente et statistiques d'avis ne sont servis que par `GET /beers/{id}`.
   *       Ni filtre ni pagination à ce stade : la collection est renvoyée entière.
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
  .get(validateQuery(BeerQuery), controller.findAll)
  /**
   * @openapi
   * /beers:
   *   post:
   *     operationId: createBeer
   *     tags: [Beers]
   *     summary: crée une nouvelle bière
   *     description: >
   *       Le nom doit être libre au sein de la brasserie, la comparaison
   *       ignorant la casse — un homonyme donne un 409. `brewery_id` doit
   *       désigner une brasserie existante, faute de quoi la requête est
   *       bien formée mais irrecevable : 422.
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
   *     operationId: getBeer
   *     tags: [Beers]
   *     summary: récupère une bière par son ID
   *     description: >
   *       Représentation détaillée, plus riche que celle de la collection :
   *       brasserie, ingrédients, catégories, photos, points de vente et
   *       statistiques d'avis. `rating_stats` vaut `null` tant qu'aucun avis
   *       n'a été posté.
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
   *     operationId: updateBeer
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
   *     operationId: deleteBeer
   *     tags: [Beers]
   *     summary: supprime une bière par son ID
   *     description: >
   *       Suppression en cascade : les avis, catégorisations, compositions,
   *       favoris, illustrations et mises en vente rattachés à la bière
   *       disparaissent avec elle. Réponse sans corps.
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

router
  .route("/:id/photos")
  /**
   * @openapi
   * /beers/{id}/photos:
   *   post:
   *     operationId: createBeerPhoto
   *     tags: [Beers]
   *     summary: ajoute une photo à une bière
   *     description: >
   *       Ajoute une photo à la galerie de la bière, sans remplacer les
   *       photos existantes. Le mimetype doit faire partie de la whitelist
   *       (`image/jpeg`, `image/png`, `image/webp`), vérifié avant toute
   *       écriture disque.
   *     parameters:
   *       - $ref: '#/components/parameters/BeerId'
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required: [photo]
   *             properties:
   *               photo:
   *                 type: string
   *                 format: binary
   *                 description: fichier image, mimetype dans la whitelist
   *               caption:
   *                 type: string
   *                 description: légende optionnelle
   *     responses:
   *       201:
   *         description: La photo a été ajoutée
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PhotoResponse'
   *       400:
   *         description: L'ID fourni n'est pas un entier positif
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiValidationError'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       415:
   *         $ref: '#/components/responses/UnsupportedMediaType'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  .post(
    uploadHanlder.single("photo"),
    requirePhoto,
    validateBody(NewPhoto),
    controller.createPhoto,
  );

export default router;
