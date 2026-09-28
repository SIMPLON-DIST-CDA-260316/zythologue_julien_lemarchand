import pool from "#config/database.js";

export default {
  createOne: async ({ email, password }) => {
    const { rows } = await pool.query(
      `INSERT INTO account (email, password)
         VALUES ($1, $2)
         RETURNING
           id,
           email,
           last_name,
           first_name,
           role,
           photo_id,
           created_at,
           updated_at`,
      // Cle absente du body : undefined, que pg ecrit en NULL.
      [email, password],
    );

    return rows[0];
  },
};
