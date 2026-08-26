import service from "./beers.service.js";
import { sendOne, sendMany } from "#http/apiResponse.js";
import { HTTP_STATUS } from "#http/httpStatus.js";

const TestHandler = async (req, res) =>
  res.send(`hello world from ${req.method} : ${req.path}`);

export default {
  getOne: async (req, res) => sendOne(res, await service.getOne(req.params.id)),

  findAll: async (req, res) => sendMany(res, await service.findAll()),

  createOne: async (req, res) =>
    sendOne(res, await service.createOne(req.body), HTTP_STATUS.CREATED),

  deleteOne: TestHandler,
  updateOne: async (req, res) =>
    sendOne(res, await service.updateOne(req.params.id, req.body)),
};
