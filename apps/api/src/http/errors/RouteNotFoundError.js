/**
 * Aucune route ne reconnaît l'URL. Erreur de protocole, pas de métier : elle
 * vit dans `#http/` et non `#errors/`.
 */
export class RouteNotFoundError extends Error {
  constructor(method, url) {
    super(`Cannot ${method} ${url}`);
    this.name = "RouteNotFoundError";
    this.method = method;
    this.url = url;
  }
}
