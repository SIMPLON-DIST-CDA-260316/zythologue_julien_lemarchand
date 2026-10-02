import * as z from "zod";

import { Id, CreatedAt, UpdatedAt } from "#shared/common.schemas.js";
import { ApiResponse } from "#http/apiResponse.js";

// Model -------------------------------------------------------------
// Forme et bornes d'un champ, sans comportement ni persistance. Clés en
// PascalCase : un spread depuis ce bloc produirait des clés de DTO invalides,
// donc les DTO les reprennent une par une, en snake_case.
//
// `nullable` se déclare ici, c'est une propriété de la colonne.
export const UserFields = {
  Id: Id.meta({ example: 1 }),
  Email: z
    .email({ pattern: z.regexes.rfc5322Email }) // https://www.rfc-editor.org/info/rfc5322/
    .describe("unique par utilisateur, la comparaison ignore la casse")
    .meta({ example: "user@domain.com" }),
  HashedPassword: z
    .string()
    .min(1)
    .max(255)
    .meta({ example: "Blonde légère et désaltérante." }),
  FirstName: z.string().min(1).max(80),
  LastName: z.string().min(1).max(80),
  Role: z.enum(["customer", "brewer", "admin"]).meta({ example: "customer" }),
  PhotoId: Id.nullable(),
  CreatedAt,
  UpdatedAt,
};

// Params ------------------------------------------------------------
// Un segment d'URL est toujours une string, d'où la coercition.
export const UserIdParam = z.coerce.number().pipe(UserFields.Id);

// ==========================================================================
// DTOs — L'optionalité appartient au contrat de l'endpoint, pas au modèle.
// ==========================================================================

// - entrée ----------------------------------------------------
export const Password = z
  .string()
  .min(8)
  .max(255)
  .regex(/[0-9]/, "doit contenir au moins un chiffre")
  .regex(/[^a-zA-Z0-9]/, "doit contenir au moins un caractère spécial");

export const NewUser = z.strictObject({
  email: UserFields.Email,
  password: Password,
});

export const UpdateUser = z
  .strictObject({
    email: UserFields.Email.optional(),
    password: Password.optional(),
    first_name: UserFields.FirstName.optional(),
    last_name: UserFields.LastName.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "au moins un champ requis",
  });

// - sortie ----------------------------------------------------

// Seules ces clés sortent vers le client (voir `pick`).
export const SafeUser = z.strictObject({
  id: UserFields.Id,
  email: UserFields.Email,
  last_name: UserFields.LastName.nullable(),
  first_name: UserFields.FirstName.nullable(),
  role: UserFields.Role,
  photo_id: UserFields.PhotoId,
  created_at: UserFields.CreatedAt,
  updated_at: UserFields.UpdatedAt,
});

// - sortie, détail --------------------------------------------

// - réponses --------------------------------------------------
// Ce que le handler sérialise, enveloppe comprise. Les DTO ci-dessus restent
// la ressource nue, réutilisable telle quelle dans une autre enveloppe.
export const UserResponse = ApiResponse(SafeUser);
