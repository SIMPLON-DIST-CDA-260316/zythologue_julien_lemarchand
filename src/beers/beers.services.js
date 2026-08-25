import beerRepository from "./beers.repository.js";

export default {
  readOne: beerRepository.readOne,
  createOne: beerRepository.createOne,
};
