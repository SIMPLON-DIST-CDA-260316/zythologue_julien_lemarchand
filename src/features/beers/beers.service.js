import beerRepository from "./beers.repository.js";
import { ResourceNotFoundError } from "#errors/ResourceNotFoundError.js";
export default {
  getOne: async (id) => {
    const beer = await beerRepository.findOne(id);
    if (beer === null) throw new ResourceNotFoundError("Beer", id);
    return beer;
  },
  findAll: beerRepository.findAll,
  createOne: beerRepository.createOne,
};
