import pool from "../config/database.js";

export default {
  readOne: async (id) => {
    try {
      const { rows } = await pool.query("SELECT * FROM beer WHERE id = $1;", [
        id,
      ]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  },
};
