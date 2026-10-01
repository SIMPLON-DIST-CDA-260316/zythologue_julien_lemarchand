/**
 * Email inconnu ou mot de passe incorrect — 401.
 */
export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid email or password");
    this.name = "InvalidCredentialsError";
  }
}
