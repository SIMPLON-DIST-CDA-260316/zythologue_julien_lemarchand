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
  Beer,
  BeerResponse,
  BeerListResponse,
  BeerDetailsResponse,
  UpdateBeer,
} from "#features/beers/beers.schemas.js";
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
        NewBeer: toSchemaObject(NewBeer),
        Beer: toSchemaObject(Beer),
        BeerResponse: toSchemaObject(BeerResponse),
        BeerListResponse: toSchemaObject(BeerListResponse),
        BeerDetailsResponse: toSchemaObject(BeerDetailsResponse),
        UpdateBeer: toSchemaObject(UpdateBeer),
        ApiError: toSchemaObject(ApiError),
        ApiValidationError: toSchemaObject(ApiValidationError),
      },
      // Définies une fois, référencées par toutes les routes : le contrat
      // d'erreur ne peut pas dériver d'une opération à l'autre.
      responses: {
        NotFound: jsonResponse(
          "La ressource demandée n'existe pas",
          "ApiError",
        ),
        InternalServerError: jsonResponse(
          "Erreur inattendue. Le détail reste côté serveur, jamais exposé.",
          "ApiError",
          { error: "Internal server error" },
        ),
      },
    },
  },
  apis: ["./src/features/beers/*"],
});
