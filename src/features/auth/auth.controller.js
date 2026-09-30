import { HTTP_STATUS } from "#http/httpStatus.js";
import authService from "./auth.service.js";

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 3600000,
  path: "/",
};

export const login = async (req, res) => {
  const token = await authService.login(req.validated.body);

  res.cookie("token", token, cookieOptions).status(HTTP_STATUS.OK).end();
};
