import breweryRepository from "./breweries.repository.js";

export default {
  findAll: () => breweryRepository.findAll(),
};
