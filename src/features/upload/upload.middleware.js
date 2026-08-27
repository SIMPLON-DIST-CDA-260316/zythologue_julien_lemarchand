import multer from "multer";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const uploadDirName = "uploads";
const uploadDir = join(currentDir, "..", "..", "..", uploadDirName);

export default multer({ dest: uploadDir });
