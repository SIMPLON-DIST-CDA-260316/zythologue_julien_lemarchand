/**
 * Une entrée ne respecte pas son schéma. Erreur de protocole, pas de métier :
 * elle vit dans `#http/` et non `#errors/`.
 *
 * Message fixe, contrairement à ses voisines : nommer les champs fautifs
 * dupliquerait `details`.
 */
export class ValidationError extends Error {
  constructor(issues) {
    super("Validation failed");
    this.name = "ValidationError";
    this.details = issues.map(({ path, message }) => ({
      path: path.join("."),
      message,
    }));
  }
}
