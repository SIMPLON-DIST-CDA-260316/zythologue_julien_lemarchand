import { randomUUIDv7 } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const uploadDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "uploads",
);

export default {
  // ! pas d'extension, pas de traitement Sharp, pas d'URL.
  store: async (buffer) => {
    await mkdir(uploadDir, { recursive: true });
    const filename = randomUUIDv7();
    await writeFile(join(uploadDir, filename), buffer);
    return {
      filename,
      storageref: "/uploads/" + filename,
      url: "http://localhost:3000/uploads/" + filename,
    };
  },
};
