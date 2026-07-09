import pool from "../config/database.js";
const TestHandler = async (req, res) =>
  res.send(`hello world from ${req.method} : ${req.path}`);
//

export default {
  readOne: async (req, res) => {
    try {
      const { rows } = await pool.query("SELECT * FROM beer WHERE id = $1;", [
        req.params.id,
      ]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Beer not found" });
      }
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  readAll: TestHandler,
  createOne: TestHandler,
  deleteOne: TestHandler,
  updateOne: TestHandler,
};
