import express from "express";
import logger from "morgan";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";
import cors from "cors";
import beersRoutes from "#features/beers/beers.routes.js";
import breweriesRoutes from "#features/breweries/breweries.routes.js";
import usersRoutes from "#features/users/users.routes.js";
import authRoutes from "#features/auth/auth.routes.js";
import swaggerDocument from "#config/openapi.js";
import attachResponseHelpers from "#http/middlewares/attachResponseHelpers.js";
import routeNotFoundHandler from "#http/middlewares/routeNotFound.js";
import errorHandler from "#http/middlewares/errorHandler.js";

export default () =>
  express()
    // En premier : le navigateur envoie un preflight (OPTIONS) avant toute
    // requête cross-origin "non simple" (PATCH, DELETE, corps JSON…) pour
    // demander la permission ; la vraie requête ne part que si on l'autorise ici.
    // TODO : verifier la politique cors.
    .use(
      cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PATCH", "DELETE"],
        maxAge: 600, // secondes de cache du preflight côté navigateur
      }),
    )
    .use(express.json())
    .use(cookieParser())
    .use(logger("dev"))
    .use(attachResponseHelpers)
    .use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
    .use("/beers", beersRoutes)
    .use("/breweries", breweriesRoutes)
    .use("/users", usersRoutes)
    .use("/auth", authRoutes)
    .use(express.static("public"))
    .use(routeNotFoundHandler)
    .use(errorHandler); // le `catch` de l'app : toute erreur levée finit ici
