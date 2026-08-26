/**
 * Le corps désigne une ressource qui n'existe pas. Syntaxe valide, sémantique
 * refusée : un 422, pas un 400.
 *
 * Transverse, donc `#errors/` : une référence cassée n'a rien de propre aux
 * bières. Pas un 404 non plus — celui-ci désigne la ressource de l'URL.
 */
export class InvalidReferenceError extends Error {
  constructor(field, value) {
    super(`No such ${field}: ${value}`);
    this.name = "InvalidReferenceError";
    this.field = field;
    this.value = value;
  }
}
