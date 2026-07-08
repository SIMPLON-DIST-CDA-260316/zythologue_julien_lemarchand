import create_app from "./src/app.js";
import { connect_db, close_db } from "./src/config/database.js";

try {
  await connect_db();
} catch {
  process.exit(1);
}

const PORT = process.env.PORT || 3000;
create_app().listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
  try {
    await close_db();
    console.log("✅ Postgres déconnecté");
    process.exit(0); // arrêt propre
  } catch (err) {
    console.error("Erreur à la fermeture:", err.message);
    process.exit(1); // on sort quand même, en signalant l'échec
  }
});
