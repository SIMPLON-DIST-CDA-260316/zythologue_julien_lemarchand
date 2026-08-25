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

import { NewBeer } from "../beers/beers.schema.js";
import { NotFoundError } from "../middlewares/notFound.js";
import { ValidationError } from "../middlewares/validateRequest.js";

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

export default swaggerJsdoc({
  definition: {
    openapi: "3.1.0",
    info: { title: "Zythologue API", version: "1.0.0" },
    components: {
      schemas: {
        NewBeer: toSchemaObject(NewBeer),
        NotFoundError: toSchemaObject(NotFoundError),
        ValidationError: toSchemaObject(ValidationError),
      },
    },
  },
  apis: ["./src/beers/*"],
});
