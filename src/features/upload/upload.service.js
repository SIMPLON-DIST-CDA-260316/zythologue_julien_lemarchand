import { randomUUIDv7 } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadDir = "public/uploads";
const relativePath = join(__dirname, "..", "..", "..", uploadDir);

export default {
  // ! pas d'extension, pas de traitement Sharp, pas d'URL.
  store: async ({ buffer, mimetype }) => {
    await mkdir(relativePath, { recursive: true });
    const filename = randomUUIDv7();
    await writeFile(join(relativePath, filename), buffer);
    const storageRef = uploadDir + "/" + filename;

    return {
      filename,
      storageRef,
      mimetype,
      //TODO: construitre l'url sur BASE_URL
      // ? même pas sur qu'on a beosin de constuire l'url ici. couplage entre l'app et son environnement (-> storageRef plus fiable)
      url: "http://localhost:3000/" + storageRef,
    };
  },
};
