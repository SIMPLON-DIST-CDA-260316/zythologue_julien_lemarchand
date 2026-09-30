import { HTTP_STATUS } from "#http/httpStatus.js";
import authService from "./auth.service.js";
import { JWT_DURATION_MS } from "./auth.config.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: JWT_DURATION_MS,
  path: "/",
};

export const login = async (req, res) => {
  const token = await authService.login(req.validated.body);

  res.cookie("token", token, cookieOptions).status(HTTP_STATUS.OK).end();
};
