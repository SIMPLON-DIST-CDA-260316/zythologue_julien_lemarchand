/**
 * Spécification OpenAPI servie sur /docs.
 *
 * Les schémas de payload sont générés depuis zod : les contraintes n'existent
 * qu'une fois, dans les schémas de ressource, et la doc ne peut pas dériver.
 *
 * @module config/openapi
 */
import swaggerJsdoc from "swagger-jsdoc";
import * as z from "zod";

import {
  NewBeer,
  BeerResponse,
  BeerListResponse,
  BeerDetailsResponse,
  UpdateBeer,
  BeerIdParam,
} from "#features/beers/beers.schemas.js";
import {
  NewPhoto,
  PhotoResponse,
  PhotoIdParam,
} from "#features/photos/photos.schemas.js";
import {
  NewUser,
  UpdateUser,
  UserIdParam,
  UserResponse,
} from "#features/users/users.schemas.js";
import { Login } from "#features/auth/auth.schemas.js";
import { AUTH_COOKIE_NAME } from "#features/auth/auth.config.js";
import { ApiError, ApiValidationError } from "#http/apiResponse.js";

/**
 * Convertit un schéma zod en Schema Object OpenAPI 3.1, qui suit JSON Schema
 * draft 2020-12. Seul `$schema` est retiré : il n'a pas de sens une fois le
 * schéma intégré à la spec.
 *
 * @param {import("zod").ZodType} schema
 * @returns {object}
 */
const toSchemaObject = (schema) => {
  const { $schema, ...schemaObject } = z.toJSONSchema(schema);
  return schemaObject;
};

/** Réponse JSON réutilisable — les routes la référencent par `$ref`. */
const jsonResponse = (description, schemaName, example) => ({
  description,
  content: {
    "application/json": {
      schema: { $ref: `#/components/schemas/${schemaName}` },
      ...(example && { example }),
    },
  },
});

export default swaggerJsdoc({
  definition: {
    openapi: "3.1.0",
    info: { title: "Zythologue API", version: "1.0.0" },
    components: {
      schemas: {
        BeerIdParam: toSchemaObject(BeerIdParam),
        NewBeer: toSchemaObject(NewBeer),
        BeerResponse: toSchemaObject(BeerResponse),
        BeerListResponse: toSchemaObject(BeerListResponse),
        BeerDetailsResponse: toSchemaObject(BeerDetailsResponse),
        UpdateBeer: toSchemaObject(UpdateBeer),
        NewPhoto: toSchemaObject(NewPhoto),
        PhotoResponse: toSchemaObject(PhotoResponse),
        PhotoIdParam: toSchemaObject(PhotoIdParam),
        NewUser: toSchemaObject(NewUser),
        UpdateUser: toSchemaObject(UpdateUser),
        UserIdParam: toSchemaObject(UserIdParam),
        UserResponse: toSchemaObject(UserResponse),
        Login: toSchemaObject(Login),
        ApiError: toSchemaObject(ApiError),
        ApiValidationError: toSchemaObject(ApiValidationError),
      },
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: AUTH_COOKIE_NAME,
          description: "JWT de session posé par POST /auth/login.",
        },
      },
      // Définies une fois, référencées par toutes les routes : le contrat
      // d'erreur ne peut pas dériver d'une opération à l'autre.
      responses: {
        NotFound: jsonResponse(
          "La ressource demandée n'existe pas",
          "ApiError",
        ),
        Unauthorized: jsonResponse(
          "Email inconnu ou mot de passe incorrect — les deux causes sont indistinguables.",
          "ApiError",
          { error: "Invalid email or password" },
        ),
        Unauthenticated: jsonResponse(
          `Cookie de session (\`${AUTH_COOKIE_NAME}\`) absent, invalide ou expiré.`,
          "ApiError",
          { error: "Unauthorized" },
        ),
        Forbidden: jsonResponse(
          "Authentifié, mais pas autorisé sur cette ressource.",
          "ApiError",
          { error: "Forbidden" },
        ),
        Conflict: jsonResponse(
          "La ressource entre en conflit avec une ressource existante.",
          "ApiError",
        ),
        UnprocessableContent: jsonResponse(
          "Le corps est bien formé mais désigne une ressource inexistante.",
          "ApiError",
        ),
        UnsupportedMediaType: jsonResponse(
          "Le mimetype du fichier envoyé n'est pas dans la whitelist.",
          "ApiError",
          { error: "Unsupported mimetype: text/plain" },
        ),
        InternalServerError: jsonResponse(
          "Erreur inattendue. Le détail reste côté serveur, jamais exposé.",
          "ApiError",
          { error: "Internal server error" },
        ),
      },
    },
  },
  apis: [
    "./src/features/beers/*",
    "./src/features/auth/*",
    "./src/features/users/*",
  ],
});
