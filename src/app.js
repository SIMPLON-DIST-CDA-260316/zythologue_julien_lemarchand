import express from "express";
import logger from "morgan";
import swaggerUi from "swagger-ui-express";
import beersRoutes from "#features/beers/beers.routes.js";
import swaggerDocument from "#config/openapi.js";
import NotFoundHandler from "#middlewares/notFound.js";

export default () =>
  express()
    .use(express.json())
    .use(logger("dev"))
    .use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
    .use("/beers", beersRoutes)
    .use(NotFoundHandler);
