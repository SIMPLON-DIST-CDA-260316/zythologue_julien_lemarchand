import { Router } from "express";
import controller from "./breweries.controller.js";
import requireAuth from "#http/middlewares/requireAuth.js";
const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Breweries
 *     description: >
 *       Brasseries du catalogue. Chaque bière appartient à l'une d'elles.
 */

router.use(requireAuth);

router
  .route("/")
  /**
   * @openapi
   * /breweries:
   *   get:
   *     operationId: listBreweries
   *     tags: [Breweries]
   *     summary: récupère toutes les brasseries
   *     description: >
   *       Renvoie l'id et le nom de chaque brasserie, triées par nom, pour
   *       choisir la brasserie d'une bière. Sans pagination : la liste est
   *       renvoyée entière.
   *     security:
   *       - cookieAuth: []
   *     responses:
   *       200:
   *         description: Liste de toutes les brasseries
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/BreweryListResponse'
   *       401:
   *         $ref: '#/components/responses/Unauthenticated'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  .get(controller.findAll);

export default router;
