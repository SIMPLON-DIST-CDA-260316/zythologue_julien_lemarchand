import beerRepository from "./beers.repository.js";
import photoRepository from "#features/photos/photos.repository.js";
import uploadService from "#features/upload/upload.service.js";
import { ResourceNotFoundError } from "#errors/ResourceNotFoundError.js";
import { InvalidReferenceError } from "#errors/InvalidReferenceError.js";
import { ConflictError } from "#errors/ConflictError.js";
import { PG_ERROR } from "#config/database.js";

/**
 * Traduit les deux violations que le client peut provoquer. `beer` n'a qu'une
 * clé étrangère et qu'un UNIQUE : le code suffit à les distinguer, sans lire
 * le nom de la contrainte.
 *
 * Rend l'erreur au lieu de la lever, pour que le `throw` reste visible à
 * l'appel. Ce qu'elle ne sait pas nommer repart tel quel : absent de la table
 * d'`errorHandler` = imprévu = 500.
 */
const translate = (error, body) => {
  if (error.code === PG_ERROR.FOREIGN_KEY_VIOLATION)
    return new InvalidReferenceError("brewery_id", body.brewery_id);
  if (error.code === PG_ERROR.UNIQUE_VIOLATION)
    return new ConflictError("Beer", ["name", "brewery_id"]);
  return error;
};

const toLimitOffset = ({ page, size }) => ({
  limit: size,
  offset: (page - 1) * size,
});

export default {
  getOne: async (id) => {
    const beer = await beerRepository.findOne(id);
    if (beer === null) throw new ResourceNotFoundError("Beer", id);
    return beer;
  },
  findAll: async ({ page, size }) => {
    const { items, total } = await beerRepository.findAll(
      toLimitOffset({ page, size }),
    );
    return { items, total, page, size };
  },
  createOne: async (body) => {
    try {
      return await beerRepository.createOne(body);
    } catch (error) {
      throw translate(error, body);
    }
  },
  // Le RETURNING vide vaut inexistence : pas de SELECT prealable.
  updateOne: async (id, body) => {
    let beer;
    try {
      beer = await beerRepository.updateOne(id, body);
    } catch (error) {
      throw translate(error, body);
    }
    if (beer === null) throw new ResourceNotFoundError("Beer", id);
    return beer;
  },
  deleteOne: async (id) => {
    const success = await beerRepository.deleteOne(id);
    if (!success) throw new ResourceNotFoundError("Beer", id);
    return;
  },
  createPhoto: async (beerId, file, caption) => {
    const beer = await beerRepository.findOne(beerId);

    if (beer === null) throw new ResourceNotFoundError("Beer", beerId);

    const { filename, url, mimetype } = await uploadService.store({
      buffer: file.buffer,
      mimetype: file.mimetype,
    });

    const photo = await photoRepository.createOne({
      filename,
      url,
      caption,
      beerId,
      mimetype,
    });

    return photo;
  },
};
