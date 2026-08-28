import { randomUUIDv7 } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PHOTO_MIMETYPE_EXTENSIONS } from "#features/photos/photos.schemas.js";
import { UnsupportedMediaTypeError } from "#errors/UnsupportedMediaTypeError.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadDir = "public/uploads";
const relativePath = join(__dirname, "..", "..", "..", uploadDir);

export default {
  store: async ({ buffer, mimetype }) => {
    const extension = PHOTO_MIMETYPE_EXTENSIONS[mimetype];
    if (!extension) throw new UnsupportedMediaTypeError(mimetype);

    await mkdir(relativePath, { recursive: true });
    const filename = `${randomUUIDv7()}.${extension}`;
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
