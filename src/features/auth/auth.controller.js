import { HTTP_STATUS } from "#http/httpStatus.js";

export const login = async (req, res) => {
  // mauvais payload -> 400 (middleware)

  // soumettre l'authentificiotn au service
  // true -> 200
  // JWT stub
  const token = {
    user_id: 1234,
    expiration_date: Date.now() + 3600000,
  };

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 3600000,
    path: "/",
  });

  res.status(HTTP_STATUS.OK).end();

  // false -> 401
};
