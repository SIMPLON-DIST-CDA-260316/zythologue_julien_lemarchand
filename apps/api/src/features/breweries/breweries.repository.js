import pool from "#config/database.js";

export default {
  findAll: async () => {
    const { rows } = await pool.query(
      `SELECT id, name
         FROM brewery
         ORDER BY name;`,
    );
    return rows;
  },
};
