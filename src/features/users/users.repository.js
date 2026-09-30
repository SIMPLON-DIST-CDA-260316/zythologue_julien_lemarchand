import pool from "#config/database.js";

export default {
  createOne: async ({ email, hashed_password }) => {
    const { rows } = await pool.query(
      `INSERT INTO account (email, hashed_password)
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
      [email, hashed_password],
    );

    return rows[0];
  },
  updateOne: async (id, body) => {
    // Un nom de colonne ne se parametre pas : il vient de cette liste, jamais
    // du body. Seules les cles presentes entrent dans le SET, si bien qu'une
    // cle absente laisse la colonne intacte et qu'une cle a null l'efface.
    // Le body a deja passe UpdateUser, qui garantit au moins une cle.
    const columns = [
      "hashed_password",
      "last_name",
      "first_name",
      "email",
    ].filter(
      (column) => column in body,
    );

    const { rows } = await pool.query(
      `UPDATE account
          SET ${columns.map((column, i) => `${column} = $${i + 2}`).join(", ")}
        WHERE id = $1
        RETURNING
           id,
           email,
           last_name,
           first_name,
           role,
           photo_id,
           created_at,
           updated_at`,
      [id, ...columns.map((column) => body[column])],
    );

    return rows[0] || null;
  },
  findByEmail: async ({ email }) => {
    const { rows } = await pool.query(
      `SELECT
          id,
          email,
          hashed_password
        FROM account
        WHERE email = $1`,
      [email],
    );

    return rows[0];
  },
};
