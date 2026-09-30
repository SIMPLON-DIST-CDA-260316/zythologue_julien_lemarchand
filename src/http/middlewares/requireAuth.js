import { UnauthorizedError } from "#errors/UnauthorizedError.js";

export default (req, res, next) => {
  if (!req.cookies.token) throw new UnauthorizedError();

  next();
};
