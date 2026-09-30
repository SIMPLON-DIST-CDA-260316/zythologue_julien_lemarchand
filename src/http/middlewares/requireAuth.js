import authService from "#features/auth/auth.service.js";
import { UnauthorizedError } from "#errors/UnauthorizedError.js";

export default (req, res, next) => {
  const token = req.cookies.token;
  if (!token) throw new UnauthorizedError();

  req.userId = authService.checkAuth(token);

  next();
};
