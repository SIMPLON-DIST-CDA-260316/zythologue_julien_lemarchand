import express from "express";
import logger from "morgan";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import beerRoutes from "./routes/beer.routes.js";
import NotFoundHandler from "./middlewares/notFound.js";
// == Swagger (smoke test — spec minimale, aucune route documentée) ===
const swaggerDocument = swaggerJsdoc({
  definition: {
    openapi: "3.1.0",
    info: { title: "Zythologue API", version: "1.0.0" },
  },
  apis: ["./src/routes/*", "./src/controllers/*"],
});

export default () =>
  express()
    .use(express.json())
    .use(logger("dev"))
    .use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
    .use("/beers", beerRoutes)
    .use(NotFoundHandler);
