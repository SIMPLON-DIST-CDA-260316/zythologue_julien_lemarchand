/**
 * La ressource demandée entre en conflit avec ce qui existe déjà. Le corps est
 * valide, c'est l'état courant qui le refuse — un 409, pas un 422.
 *
 * Transverse, donc `#errors/` : un doublon n'a rien de propre aux bières.
 */
export class ConflictError extends Error {
  constructor(resource, fields) {
    super(`${resource} already exists with the same ${fields.join(" and ")}`);
    this.name = "ConflictError";
    this.resource = resource;
    this.fields = fields;
  }
}
