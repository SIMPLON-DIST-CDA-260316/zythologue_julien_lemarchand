/**
 * Le mimetype du fichier envoyé n'est pas dans la whitelist de la ressource.
 * Erreur de protocole (multer, avant tout accès au domaine bière/photo).
 */
export class UnsupportedMediaTypeError extends Error {
  constructor(mimetype) {
    super(`Unsupported mimetype: ${mimetype}`);
    this.name = "UnsupportedMediaTypeError";
    this.mimetype = mimetype;
  }
}
