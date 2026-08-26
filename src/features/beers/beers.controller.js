import service from "./beers.service.js";
import { HTTP_STATUS } from "#http/httpStatus.js";

const TestHandler = async (req, res) =>
  res.send(`hello world from ${req.method} : ${req.path}`);

export default {
  getOne: async (req, res) => res.sendItem(await service.getOne(req.params.id)),
  findAll: async (req, res) => res.sendCollection(await service.findAll()),
  createOne: async (req, res) =>
    res.status(HTTP_STATUS.CREATED).sendItem(await service.createOne(req.body)),
  updateOne: async (req, res) =>
    res.sendItem(await service.updateOne(req.params.id, req.body)),
  deleteOne: async (req, res) => {
    await service.deleteOne(req.params.id);
    res.status(HTTP_STATUS.NO_CONTENT).end();
  },
};
