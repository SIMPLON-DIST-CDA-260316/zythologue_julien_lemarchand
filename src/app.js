import express from "express";
import logger from "morgan";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";
import beersRoutes from "#features/beers/beers.routes.js";
import usersRoutes from "#features/users/users.routes.js";
import swaggerDocument from "#config/openapi.js";
import attachResponseHelpers from "#http/middlewares/attachResponseHelpers.js";
import routeNotFoundHandler from "#http/middlewares/routeNotFound.js";
import errorHandler from "#http/middlewares/errorHandler.js";

export default () =>
  express()
    .use(express.json())
    .use(cookieParser())
    .use(logger("dev"))
    .use(attachResponseHelpers)
    .use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
    .use("/beers", beersRoutes)
    .use("/users", usersRoutes)
    .use(express.static("public"))
    .use(routeNotFoundHandler)
    .use(errorHandler); // le `catch` de l'app : toute erreur levée finit ici
