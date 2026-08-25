import pool from "../config/database.js";

export default {
  readOne: async (id) => {
    try {
      const { rows } = await pool.query(
        `SELECT 
          b.id,
          b.name, 
          b.description, 
          b.alcohol_content,
          jsonb_build_object(
            'id', br.id,
            'name', br.name
          ) AS brewery,

          -- construction d'un tableau d'ingredients
          json_agg( 
            DISTINCT jsonb_build_object(
              'name', i.name,
              'isAllergen', i.is_allergen
            )
          ) AS ingredients,

          -- construction d'un tableau de categories
          json_agg(
            DISTINCT jsonb_build_object(
              'id', cat.id,
              'name',cat.name
            )
          ) AS categories,

          -- construction d'un tableau de photos
          json_agg(
            DISTINCT jsonb_build_object(
              'url', p.url,
              'caption', p.caption
            )
          ) AS photos,
          
          -- construction d'un tableau d'outlets
          json_agg(
            DISTINCT jsonb_build_object(
             'id', o.id,
             'name', o.name,
             'type', o.type,
             'onlineSale', o.online_sales,
             'website', o.website,
             'address', CASE WHEN a.id IS NULL THEN NULL ELSE
               jsonb_build_object(
                 'number', a.number,
                 'street', a.street,
                 'zipCode', a.zip_code,
                 'city', a.city,
                 'country', a.country
               )
             END
            )
          ) AS outlets

          
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

        WHERE b.id = $1
        GROUP BY b.id, br.id
        `,
        [id],
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  },
  createOne: async () => {
    return {
      msg: "wip - createOne",
    };
  },
};
