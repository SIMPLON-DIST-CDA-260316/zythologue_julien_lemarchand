import pool from "#config/database.js";

export default {
  findOne: async (id) => {
    const { rows } = await pool.query(
      `SELECT 
          b.id,
          b.name, 
          b.description, 
          -- sans ce cast, NUMERIC sort en string
          b.alcohol_content::float AS alcohol_content,
          jsonb_build_object(
            'id', br.id,
            'name', br.name
          ) AS brewery,

          -- construction d'un tableau d'ingredients
          COALESCE(json_agg(
            DISTINCT jsonb_build_object(
              'name', i.name,
              'is_allergen', i.is_allergen
            )
          ) FILTER (WHERE i.id IS NOT NULL), '[]') AS ingredients,

          -- construction d'un tableau de categories
          COALESCE(json_agg(
            DISTINCT jsonb_build_object(
              'id', cat.id,
              'name',cat.name
            )
          ) FILTER (WHERE cat.id IS NOT NULL), '[]') AS categories,

          -- construction d'un tableau de photos
          COALESCE(json_agg(
            DISTINCT jsonb_build_object(
              'id', p.id,
              'url', p.url,
              'caption', p.caption,
              'mimetype', p.mimetype,
              'created_at', p.created_at,
              'updated_at', p.updated_at
            )
          ) FILTER (WHERE p.id IS NOT NULL), '[]') AS photos,

          -- construction d'un tableau d'outlets
          COALESCE(json_agg(
            DISTINCT jsonb_build_object(
             'id', o.id,
             'name', o.name,
             'type', o.type,
             'online_sales', o.online_sales,
             'website', o.website,
             'address', CASE WHEN a.id IS NULL THEN NULL ELSE
               jsonb_build_object(
                 'number', a.number,
                 'street', a.street,
                 'zip_code', a.zip_code,
                 'city', a.city,
                 'country', a.country
               )
             END
            )
          ) FILTER (WHERE o.id IS NOT NULL), '[]') AS outlets,

          -- statistiques d'avis : null tant qu'aucun avis n'a ete poste
          CASE WHEN rs.count = 0 THEN NULL ELSE
            jsonb_build_object(
              'average', rs.average,
              'count', rs.count
            )
          END AS rating_stats


        FROM beer b
        JOIN brewery br ON br.id = b.brewery_id

        -- jointure sur les ingredients vie composition
        LEFT JOIN composition c ON c.beer_id = b.id
        LEFT JOIN ingredient i ON i.id = c.ingredient_id


        -- jointure sur category via categorization
        LEFT JOIN categorization catz ON catz.beer_id = b.id
        LEFT JOIN category cat ON cat.id = catz.category_id

        -- jointure sur photo via illustration_beer
        LEFT JOIN illustration_beer ib ON ib.beer_id = b.id
        LEFT JOIN photo p ON p.id = ib.photo_id

        -- jointure sur outlet via sale
        LEFT JOIN sale s ON s.beer_id = b.id
        LEFT JOIN outlet o ON o.id = s.outlet_id
        LEFT JOIN address a ON a.id = o.address_id

        -- agregat des avis isole du produit cartesien : la sous-requete
        -- agregee sans GROUP BY retourne toujours exactement une ligne
        LEFT JOIN LATERAL (
          SELECT
            ROUND(AVG(r.rating), 2)::float AS average,
            COUNT(*)::int                  AS count
          FROM review r
          WHERE r.beer_id = b.id
        ) rs ON TRUE

        WHERE b.id = $1
        GROUP BY b.id, br.id, rs.average, rs.count
        `,
      [id],
    );
    return rows[0] || null;
  },
  findAll: async ({ limit, offset }) => {
    const [{ rows: items }, {
      rows: [{ count: total }],
    }] = await Promise.all([
      pool.query(
        `SELECT
        id,
        name,
        description,
        -- sans ce cast, NUMERIC sort en string
        alcohol_content::float AS alcohol_content,
        created_at,
             updated_at,
             brewery_id
           FROM beer
           ORDER BY id
           LIMIT $1 OFFSET $2;`,
        [limit, offset],
      ),
      pool.query(`SELECT COUNT(*)::int AS count FROM beer;`),
    ]);

    return { items, total };
  },
  createOne: async ({ name, description, alcohol_content, brewery_id }) => {
    const { rows } = await pool.query(
      `INSERT INTO beer (name, description, alcohol_content, brewery_id)
         VALUES ($1, $2, $3, $4)
         RETURNING
           id,
           name,
           description,
           -- sans ce cast, NUMERIC sort en string
           alcohol_content::float AS alcohol_content,
           created_at,
           updated_at,
           brewery_id`,
      // Cle absente du body : undefined, que pg ecrit en NULL.
      [name, description, alcohol_content, brewery_id],
    );

    return rows[0];
  },
  updateOne: async (id, body) => {
    // Un nom de colonne ne se parametre pas : il vient de cette liste, jamais
    // du body. Seules les cles presentes entrent dans le SET, si bien qu'une
    // cle absente laisse la colonne intacte et qu'une cle a null l'efface.
    // Le body a deja passe UpdateBeer, qui garantit au moins une cle.
    const columns = [
      "name",
      "description",
      "alcohol_content",
      "brewery_id",
    ].filter((column) => column in body);

    const { rows } = await pool.query(
      `UPDATE beer
          SET ${columns.map((column, i) => `${column} = $${i + 2}`).join(", ")}
        WHERE id = $1
        RETURNING
          id,
          name,
          description,
          -- sans ce cast, NUMERIC sort en string
          alcohol_content::float AS alcohol_content,
          created_at,
          updated_at,
          brewery_id`,
      // updated_at n'est pas ecrit ici : trg_beer_updated_at s'en charge.
      [id, ...columns.map((column) => body[column])],
    );

    return rows[0] || null;
  },
  deleteOne: async (id) => {
    const { rowCount } = await pool.query(
      `DELETE FROM beer
        WHERE beer.id=$1
      `,
      [id],
    );

    return !!rowCount;
  },
};
