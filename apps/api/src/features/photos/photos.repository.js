import pool from "#config/database.js";

export default {
  // TODO : voire comment on peut implementer un create one polymorphique qui pourra traiter la creation des relation de maniere generique. sinon un handler specifique pour chaque relation. mais pas terrible.

  createOne: async ({ filename, url, caption, beerId, mimetype }) => {
    const { rows } = await pool.query(
      `
      WITH inserted_photo AS (
        INSERT INTO photo (url, caption, mimetype)
        VALUES ($1, $2, $3)
        RETURNING id, url, caption, mimetype, created_at, updated_at
      ),
      inserted_relation AS (
        INSERT INTO illustration_beer (beer_id, photo_id)
        SELECT $4, id FROM inserted_photo
      )
      SELECT id, url, caption, mimetype, created_at, updated_at
      FROM inserted_photo
    `,
      [url, caption, mimetype, beerId],
    );

    return rows[0];
  },
  findOne: async (id) => {
    const { rows } = await pool.query(
      `
        SELECT p.id, p.url, p.caption, p.mimetype, p.created_at, p.updated_at, ib.beer_id
        FROM photo p
        JOIN illustration_beer ib ON ib.photo_id = p.id
        WHERE p.id = $1
      `,
      [id],
    );

    return rows[0] || null;
  },
  // TODO: verifier la relation avec la biere , sinon on supprime pas
  deleteOne: async (id) => {
    const { rowCount } = await pool.query(
      `DELETE FROM photo
        WHERE id=$1
      `,
      [id],
    );

    return !!rowCount;
  },
};
