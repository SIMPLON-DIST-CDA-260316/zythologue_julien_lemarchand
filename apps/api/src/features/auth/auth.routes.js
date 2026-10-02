import { Router } from "express";
import { login, logout } from "./auth.controller.js";
import { validateBody } from "#http/middlewares/validateRequest.js";
import { Login } from "./auth.schemas.js";
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
 *       posé en cookie httpOnly (`access_token`) ; la réponse n'a pas de corps.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
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
 *             description: JWT de session (`access_token`), httpOnly, expire après 15 min
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
router.post("/login", validateBody(Login), login);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     operationId: logout
 *     tags: [Auth]
 *     summary: déconnecte l'utilisateur
 *     description: >
 *       Efface le cookie de session (`access_token`). Le cookie étant httpOnly,
 *       seul le serveur peut le supprimer. Répond 204 même sans session.
 *     responses:
 *       204:
 *         description: Cookie de session effacé, aucun corps dans la réponse.
 *         headers:
 *           Set-Cookie:
 *             description: "`access_token` vide, expiré"
 *             schema:
 *               type: string
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/logout", logout);

export default router;
