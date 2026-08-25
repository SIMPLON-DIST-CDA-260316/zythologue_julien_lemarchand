import beerRepository from "./beers.repository.js";

export default {
  findOne: beerRepository.findOne,
  findAll: beerRepository.findAll,
  createOne: beerRepository.createOne,
};
