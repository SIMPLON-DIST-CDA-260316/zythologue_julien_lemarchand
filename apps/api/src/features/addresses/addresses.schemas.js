import * as z from "zod";
import { Id } from "#shared/common.schemas.js";

// Model -------------------------------------------------------------
export const AddressFields = {
  Id,
  Number: z.string().trim().min(1).max(10).nullable(),
  Street: z.string().trim().min(1).max(255),
  ZipCode: z.string().trim().min(1).max(10),
  City: z.string().trim().min(1).max(100),
  Country: z.string().trim().min(1).max(60),
};

// - sortie ----------------------------------------------------
// Partagée par brewery.address_id et outlet.address_id — pas d'endpoint
// /addresses pour l'instant, donc pas d'id exposé.
export const Address = z.strictObject({
  number: AddressFields.Number,
  street: AddressFields.Street,
  zip_code: AddressFields.ZipCode,
  city: AddressFields.City,
  country: AddressFields.Country,
});
