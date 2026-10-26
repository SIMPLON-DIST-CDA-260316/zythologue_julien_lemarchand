import service from "./breweries.service.js";

export default {
  findAll: async (req, res) => res.sendItem(await service.findAll()),
};
