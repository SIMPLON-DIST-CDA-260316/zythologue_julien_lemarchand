import service from "./users.service.js";
import { HTTP_STATUS } from "#http/httpStatus.js";

export default {
  createOne: async (req, res) => 
    res
      .status(HTTP_STATUS.CREATED)
      .sendItem(await service.createOne(req.validated.body)),
};
