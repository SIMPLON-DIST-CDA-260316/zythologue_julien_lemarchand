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

          -- construction d'un tableau de categories
          json_agg(
            DISTINCT jsonb_build_object(
              'url', p.url,
              'caption', p.caption
            )
          ) AS photos
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
};
