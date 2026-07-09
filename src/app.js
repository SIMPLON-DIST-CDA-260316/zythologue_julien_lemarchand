import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import pool from "./config/database.js";

// == Swagger (smoke test — spec minimale, aucune route documentée) ===
const swaggerDocument = swaggerJsdoc({
  definition: {
    openapi: "3.1.0",
    info: { title: "Zythologue API", version: "1.0.0" },
  },
  apis: [], // aucun fichier scanné pour l'instant
});

// == Utils ========================================
const logged = (msg) => {
  console.log(msg);
  return msg;
};

// == Controller Handlers =====================================
const TestHandler = (req, res) =>
  res.send(logged(`hello world from ${req.method} : ${req.path}`));
// ---------------------------------------------------
const rootHandler = (req, res) => res.send("hello world");

// == App =====================================
export default () => {
  return (
    express()
      .use(express.json())
      .use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
      .get("/", rootHandler)
      // - CREATE ONE
      .post("/beers", TestHandler)
      // - READ ALL (pagination)
      .get("/beers", TestHandler)
      // CRUD BEERS
      // - READ ONE (by PK)
      .get("/beers/:id", async (req, res) => {
        try {
          const { rows } = await pool.query(
            "SELECT * FROM beer WHERE id = $1;",
            [req.params.id],
          );
          if (rows.length === 0) {
            return res.status(404).json({ error: "Beer not found" });
          }
          res.send(logged(rows));
        } catch (error) {
          console.error(error);
          res.status(500).json({ error });
        }
      })
      // - UPDATE ONE (by pk)
      .put("/beers/:id", TestHandler)
      // - DELETE ONE (by pk)
      .delete("/beers/:id", TestHandler)
  );
};
