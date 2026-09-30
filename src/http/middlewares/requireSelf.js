import { ForbiddenError } from "#errors/ForbiddenError.js";

export default (req, res, next) => {
  if (req.user.id !== req.validated.params.id) throw new ForbiddenError();

  next();
};
