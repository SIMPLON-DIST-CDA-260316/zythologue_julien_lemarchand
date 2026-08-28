import service from "./beers.service.js";
import { HTTP_STATUS } from "#http/httpStatus.js";

const TestHandler = async (req, res) =>
  res.send(`hello world from ${req.method} : ${req.path}`);

export default {
  getOne: async (req, res) =>
    res.sendItem(await service.getOne(req.validated.params.id)),
  findAll: async (req, res) => {
    const { page, size } = req.validated.query;
    const { items, total } = await service.findAll({ page, size });
    return res.sendCollection(items, { total, page, size });
  },
  createOne: async (req, res) =>
    res
      .status(HTTP_STATUS.CREATED)
      .sendItem(await service.createOne(req.validated.body)),
  updateOne: async (req, res) =>
    res.sendItem(
      await service.updateOne(req.validated.params.id, req.validated.body),
    ),
  deleteOne: async (req, res) => {
    await service.deleteOne(req.validated.params.id);
    res.status(HTTP_STATUS.NO_CONTENT).end();
  },
  createPhoto: async (req, res) =>
    res
      .status(HTTP_STATUS.CREATED)
      .sendItem(
        await service.createPhoto(
          req.validated.params.id,
          req.file,
          req.body.caption,
        ),
      ),
};
