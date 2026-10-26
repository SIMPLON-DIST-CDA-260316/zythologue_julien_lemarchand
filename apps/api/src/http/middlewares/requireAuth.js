import authService from "#features/auth/auth.service.js";
import { UnauthorizedError } from "#errors/UnauthorizedError.js";
import { AUTH_COOKIE_NAME } from "#features/auth/auth.config.js";

export default async (req, res, next) => {
  const token = req.cookies[AUTH_COOKIE_NAME];
  if (!token) throw new UnauthorizedError();

  req.user = await authService.checkAuth(token);
  // Réponse propre à l'utilisateur : le navigateur ne doit pas la resservir
  // depuis son cache, par exemple au « précédent » après un logout.
  res.set("Cache-Control", "no-store");

  next();
};
