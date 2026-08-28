import multer from "multer";
import { ALLOWED_PHOTO_MIMETYPES } from "#features/photos/photos.schemas.js";
import { UnsupportedMediaTypeError } from "#errors/UnsupportedMediaTypeError.js";

export default multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_PHOTO_MIMETYPES.includes(file.mimetype)) {
      return cb(new UnsupportedMediaTypeError(file.mimetype));
    }
    cb(null, true);
  },
});
