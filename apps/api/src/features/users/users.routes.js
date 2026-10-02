import { Router } from "express";
import { NewUser, UserIdParam, UpdateUser } from "./users.schemas.js";
import controller from "./users.controller.js";
import requireAuth from "#http/middlewares/requireAuth.js";
import requireSelf from "#http/middlewares/requireSelf.js";
import {
  validateBody,
  validateParam,
} from "#http/middlewares/validateRequest.js";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Users
 *     description: >
 *       Routes pour les utilisateurs
 */
router
  .route("/")
  /**
   * @openapi
   * /users:
   *   post:
   *     operationId: createUser
   *     tags: [Users]
   *     summary: crée un nouvel utilisateur
   *     description: >
   *       L'email doit être libre, la comparaison ignorant la casse — un
   *       email déjà utilisé donne un 409.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/NewUser'
   *           examples:
   *             value:
   *               email: user@email.com
   *               password: 1234567
   *     responses:
   *       201:
   *         description: Le compte utilisateur a été créé
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserResponse'
   *       400:
   *         description: Le corps de la requête ne respecte pas le schéma
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiValidationError'
   *       409:
   *         $ref: '#/components/responses/Conflict'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  .post(validateBody(NewUser), controller.createOne);

router
  .route("/me")
  /**
   * @openapi
   * /users/me:
   *   get:
   *     operationId: getMe
   *     tags: [Users]
   *     summary: renvoie l'utilisateur connecté
   *     description: >
   *       Identifie l'utilisateur à partir du cookie de session. Le JWT étant
   *       en cookie httpOnly, c'est le seul moyen pour le client de savoir
   *       qui est connecté.
   *     security:
   *       - cookieAuth: []
   *     responses:
   *       200:
   *         description: L'utilisateur connecté, sans son mot de passe
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserResponse'
   *       401:
   *         $ref: '#/components/responses/Unauthenticated'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  .get(requireAuth, controller.findMe);

router
  /**
   * @openapi
   * components:
   *   parameters:
   *     UserId:
   *       in: path
   *       name: id
   *       required: true
   *       description: la clef primaire d'un user
   *       schema:
   *         $ref: '#/components/schemas/UserIdParam'
   */
  .param("id", validateParam(UserIdParam))
  .route("/:id")
  /**
   * @openapi
   * /users/{id}:
   *   patch:
   *     operationId: updateUser
   *     tags: [Users]
   *     summary: met à jour un utilisateur par son ID
   *     description: >
   *       Mise à jour partielle, réservée au propriétaire du compte —
   *       l'ID de session doit correspondre à l'ID de la ressource, sinon 403.
   *       Au moins un champ est requis.
   *     security:
   *       - cookieAuth: []
   *     parameters:
   *       - $ref: '#/components/parameters/UserId'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateUser'
   *           examples:
   *             renommage:
   *               summary: un seul champ — les autres colonnes sont laissées intactes
   *               value:
   *                 first_name: Camille
   *     responses:
   *       200:
   *         description: L'utilisateur mis à jour
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserResponse'
   *       400:
   *         description: >
   *           L'ID fourni n'est pas un entier positif, ou le corps ne respecte
   *           pas le schéma
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiValidationError'
   *       401:
   *         $ref: '#/components/responses/Unauthenticated'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         $ref: '#/components/responses/Conflict'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  .patch(
    requireAuth,
    requireSelf,
    validateBody(UpdateUser),
    controller.updateOne,
  );

export default router;
