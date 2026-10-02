import { HTTP_STATUS } from "#http/httpStatus.js";
import authService from "./auth.service.js";
import { JWT_DURATION_MS, AUTH_COOKIE_NAME } from "./auth.config.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: JWT_DURATION_MS,
  path: "/",
};

export const login = async (req, res) => {
  const token = await authService.login(req.validated.body);

  res.cookie(AUTH_COOKIE_NAME, token, cookieOptions).status(HTTP_STATUS.OK).end();
};

// Mêmes options qu'à la pose, sinon le navigateur ne reconnaît pas le cookie.
export const logout = (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, cookieOptions).status(HTTP_STATUS.NO_CONTENT).end();
};
