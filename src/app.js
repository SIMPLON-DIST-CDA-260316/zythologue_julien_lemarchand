import express from "express";

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
      .get("/", rootHandler)
      // - CREATE ONE
      .post("/beers", TestHandler)
      // - READ ALL (pagination)
      .get("/beers", TestHandler)
      // CRUD BEERS
      // - READ ONE (by PK)
      .get("/beers/:id", (req, res) => {
        const { id = null } = req.params;
        const output = `fetch beer with id ${id}`;
        res.send(logged(output));
      })
      // - UPDATE ONE (by pk)
      .put("/beers/:id", TestHandler)
      // - DELETE ONE (by pk)
      .delete("/beers/:id", TestHandler)
  );
};
