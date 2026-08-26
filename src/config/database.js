import pg from "pg";
const { Pool } = pg;

/**
 * SQLSTATE, classe 23 — violation de contrainte d'intégrité. Le module qui
 * possède le driver possède son vocabulaire ; les services le lisent pour
 * traduire. À sortir dans son propre fichier au-delà de quelques entrées.
 */
export const PG_ERROR = Object.freeze({
  FOREIGN_KEY_VIOLATION: "23503",
});

const pool = new Pool({
  host: process.env.POSTGRES_HOST || "localhost",
  port: process.env.POSTGRES_PORT || 5432,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

export const connect_db = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Postgres connecté");
    return pool;
  } catch (err) {
    console.error("❌ Connexion Postgres impossible:", err.message);
    throw err;
  }
};

export const close_db = async () => {
  await pool.end();
};

export default pool;
