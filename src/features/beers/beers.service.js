import beerRepository from "./beers.repository.js";
import { ResourceNotFoundError } from "#errors/ResourceNotFoundError.js";
import { InvalidReferenceError } from "#errors/InvalidReferenceError.js";
import { PG_ERROR } from "#config/database.js";

export default {
  getOne: async (id) => {
    const beer = await beerRepository.findOne(id);
    if (beer === null) throw new ResourceNotFoundError("Beer", id);
    return beer;
  },
  findAll: beerRepository.findAll,
  // Le seul catch justifie sa place : il traduit, il ne relaie pas. `beer`
  // n'a qu'une clé étrangère, inutile d'identifier la contrainte. Tout ce
  // qu'il ne sait pas nommer repart : absent de la table = imprévu = 500.
  createOne: async (body) => {
    try {
      return await beerRepository.createOne(body);
    } catch (error) {
      if (error.code === PG_ERROR.FOREIGN_KEY_VIOLATION)
        throw new InvalidReferenceError("brewery_id", body.brewery_id);
      throw error;
    }
  },
  // Le RETURNING vide vaut inexistence : pas de SELECT prealable.
  updateOne: async (id, body) => {
    let beer;
    try {
      beer = await beerRepository.updateOne(id, body);
    } catch (error) {
      if (error.code === PG_ERROR.FOREIGN_KEY_VIOLATION)
        throw new InvalidReferenceError("brewery_id", body.brewery_id);
      throw error;
    }
    if (beer === null) throw new ResourceNotFoundError("Beer", id);
    return beer;
  },
};
