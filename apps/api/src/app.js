import express from "express";
import logger from "morgan";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";
import cors from "cors";
import beersRoutes from "#features/beers/beers.routes.js";
import usersRoutes from "#features/users/users.routes.js";
import authRoutes from "#features/auth/auth.routes.js";
import swaggerDocument from "#config/openapi.js";
import attachResponseHelpers from "#http/middlewares/attachResponseHelpers.js";
import routeNotFoundHandler from "#http/middlewares/routeNotFound.js";
import errorHandler from "#http/middlewares/errorHandler.js";

export default () =>
  express()
    // En premier, pour répondre aux preflight OPTIONS
    .use(
      cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        credentials: true,
      }),
    )
    .use(express.json())
    .use(cookieParser())
    .use(logger("dev"))
    .use(attachResponseHelpers)
    .use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
    .use("/beers", beersRoutes)
    .use("/users", usersRoutes)
    .use("/auth", authRoutes)
    .use(express.static("public"))
    .use(routeNotFoundHandler)
    .use(errorHandler); // le `catch` de l'app : toute erreur levée finit ici
