import beerRepository from "./beers.repository.js";

export default {
  readOne: beerRepository.readOne,
  findAll: beerRepository.findAll,
  createOne: beerRepository.createOne,
};
