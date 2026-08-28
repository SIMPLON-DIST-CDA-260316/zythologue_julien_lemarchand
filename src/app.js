import express from "express";
import logger from "morgan";
import swaggerUi from "swagger-ui-express";
import beersRoutes from "#features/beers/beers.routes.js";
import swaggerDocument from "#config/openapi.js";
import attachResponseHelpers from "#http/middlewares/attachResponseHelpers.js";
import routeNotFoundHandler from "#http/middlewares/routeNotFound.js";
import errorHandler from "#http/middlewares/errorHandler.js";

export default () =>
  express()
    .use(express.json())
    .use(logger("dev"))
    .use(attachResponseHelpers)
    .use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
    .use("/beers", beersRoutes)
    .use(express.static("public"))
    .use(routeNotFoundHandler)
    .use(errorHandler); // le `catch` de l'app : toute erreur levée finit ici
