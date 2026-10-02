import service from "./users.service.js";
import { HTTP_STATUS } from "#http/httpStatus.js";

export default {
  // `req.user` est déjà chargé par requireAuth.
  findMe: (req, res) => res.sendItem(req.user),
  createOne: async (req, res) =>
    res
      .status(HTTP_STATUS.CREATED)
      .sendItem(await service.createOne(req.validated.body)),
  updateOne: async (req, res) =>
    res.sendItem(
      await service.updateOne(req.validated.params.id, req.validated.body),
    ),
};
