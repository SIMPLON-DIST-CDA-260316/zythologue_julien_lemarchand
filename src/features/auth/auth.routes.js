import { Router } from "express";
import { login } from "./auth.controller.js";
import { validateBody } from "#http/middlewares/validateRequest.js";
import { LoginUser } from "./auth.schemas.js";
const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: >
 *       Authentification : vérification des identifiants et émission du
 *       token de session, posé en cookie httpOnly.
 */

/**
 * @openapi
 * /auth/login:
 *   post:
 *     operationId: login
 *     tags: [Auth]
 *     summary: authentifie un utilisateur
 *     description: >
 *       Vérifie l'email et le mot de passe. Les deux causes d'échec — email
 *       inconnu ou mot de passe incorrect — renvoient la même erreur 401,
 *       sans distinction possible côté client. En cas de succès, le JWT est
 *       posé en cookie httpOnly (`token`) ; la réponse n'a pas de corps.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginUser'
 *           examples:
 *             value:
 *               email: user@email.com
 *               password: 1234567
 *     responses:
 *       200:
 *         description: >
 *           Authentification réussie. Le token est posé en cookie httpOnly,
 *           aucun corps dans la réponse.
 *         headers:
 *           Set-Cookie:
 *             description: JWT de session (`token`), httpOnly, expire après 1h
 *             schema:
 *               type: string
 *       400:
 *         description: Le corps de la requête ne respecte pas le schéma
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/login", validateBody(LoginUser), login);

export default router;
