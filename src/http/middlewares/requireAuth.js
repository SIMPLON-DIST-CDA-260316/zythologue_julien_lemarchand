import authService from "#features/auth/auth.service.js";
import { UnauthorizedError } from "#errors/UnauthorizedError.js";

export default async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) throw new UnauthorizedError();

  req.user = await authService.checkAuth(token);

  next();
};
