import { Router } from "express";
import { NewUser } from "./users.schemas.js";
import controller from "./users.controller.js";
import { validateBody } from "#http/middlewares/validateRequest.js";
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

export default router;
