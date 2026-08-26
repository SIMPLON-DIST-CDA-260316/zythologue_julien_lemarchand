import service from "./beers.service.js";
import { sendOne, sendMany } from "#http/apiResponse.js";

const TestHandler = async (req, res) =>
  res.send(`hello world from ${req.method} : ${req.path}`);

export default {
  findOne: async (req, res) => {
    try {
      const beer = await service.findOne(req.params.id);
      if (beer === null)
        return res
          .status(404)
          .json({ error: `Beer with id ${req.params.id} not found` });
      return sendOne(res, beer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  findAll: async (req, res) => {
    try {
      const beers = await service.findAll();

      return sendMany(res, beers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  createOne: async (req, res) => {
    try {
      const beer = await service.createOne(req.body);

      return sendOne(res, beer, 201);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  deleteOne: TestHandler,
  updateOne: TestHandler,
};
