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
    .email()
    .describe("unique par utilisateur, la comparaison ignore la casse")
    .meta({ example: "user@domain.com" }),
  PasswordHash: z
    .string()
    .trim()
    .min(1)
    .nullable()
    .meta({ example: "Blonde légère et désaltérante." }),
  CreatedAt,
  UpdatedAt,
};

// ==========================================================================
// DTOs — L'optionalité appartient au contrat de l'endpoint, pas au modèle.
// ==========================================================================

// - entrée ----------------------------------------------------
// TODO: verifier la complexité du mdp via regex
const Password = z.string(z.string().min(6).max(255));

export const NewUser = z.strictObject({
  email: UserFields.Email,
  password: Password,
});

// - sortie ----------------------------------------------------
export const User = z.strictObject({
  id: UserFields.Id,
  email: UserFields.Email,
  created_at: UserFields.CreatedAt,
  updated_at: UserFields.UpdatedAt,
});

// - sortie, détail --------------------------------------------

// - réponses --------------------------------------------------
// Ce que le handler sérialise, enveloppe comprise. Les DTO ci-dessus restent
// la ressource nue, réutilisable telle quelle dans une autre enveloppe.
export const UserResponse = ApiResponse(User);
