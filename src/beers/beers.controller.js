import service from "./beers.services.js";

const TestHandler = async (req, res) =>
  res.send(`hello world from ${req.method} : ${req.path}`);

export default {
  /**
   * @openapi
   * components:
   *   schemas:
   *     BeerDetails:
   *       type: object
   *       description: Détail complet d'une bière — données propres, brasserie, composition, points de vente et statistiques d'avis.
   *       required:
   *         - id
   *         - name
   *         - photos
   *         - categories
   *         - brewery
   *         - composition
   *         - outlets
   *       properties:
   *         id:
   *           type: integer
   *           minimum: 1
   *         name:
   *           type: string
   *           maxLength: 120
   *         description:
   *           type: ["string", "null"]
   *         alcoholContent:
   *           type: ["number", "null"]
   *           format: float
   *           minimum: 0
   *           maximum: 100
   *           description: teneur en alcool en % vol.
   *         photos:
   *           type: array
   *           items:
   *             type: object
   *             properties:
   *               url:
   *                 type: string
   *                 format: uri
   *                 maxLength: 255
   *               caption:
   *                 type: ["string", "null"]
   *                 maxLength: 255
   *         categories:
   *           type: array
   *           items:
   *             type: object
   *             properties:
   *               id:
   *                 type: integer
   *                 minimum: 1
   *               name:
   *                 type: string
   *                 maxLength: 60
   *         brewery:
   *           type: object
   *           properties:
   *             id:
   *               type: integer
   *               minimum: 1
   *             name:
   *               type: string
   *               maxLength: 120
   *         composition:
   *           type: array
   *           items:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 maxLength: 80
   *               isAllergen:
   *                 type: boolean
   *                 description: indique si l'ingrédient est un allergène déclaré
   *         outlets:
   *           type: array
   *           items:
   *             type: object
   *             properties:
   *               id:
   *                 type: integer
   *                 minimum: 1
   *               name:
   *                 type: string
   *                 maxLength: 120
   *               type:
   *                 type: ["string", "null"]
   *                 enum: [cellar, bar, restaurant, supermarket, null]
   *               onlineSales:
   *                 type: boolean
   *                 description: indique si le lieu propose une vente en ligne
   *               website:
   *                 type: ["string", "null"]
   *                 format: uri
   *                 maxLength: 255
   *               address:
   *                 type: ["object", "null"]
   *                 description: null pour les outlets exclusivement en ligne
   *                 properties:
   *                   city:
   *                     type: string
   *                   zipCode:
   *                     type: string
   *                   country:
   *                     type: string
   *         ratingStats:
   *           type: ["object", "null"]
   *           description: null si aucun avis n'a encore été posté
   *           properties:
   *             average:
   *               type: number
   *               format: float
   *               minimum: 1
   *               maximum: 5
   *               description: note moyenne sur une échelle de 1 à 5
   *             count:
   *               type: integer
   *               minimum: 0
   */
  readOne: async (req, res) => {
    try {
      const beer = await service.readOne(req.params.id);
      if (beer === null)
        return res
          .status(404)
          .json({ error: `Beer with id ${req.params.id} not found` });
      return res.status(200).json(beer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  readAll: TestHandler,
  createOne: async (req, res) => {
    try {
      const output = {
        msg: "WIP - createOne  handler",
      };

      return res.status(201).json(output);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  deleteOne: TestHandler,
  updateOne: TestHandler,
};
