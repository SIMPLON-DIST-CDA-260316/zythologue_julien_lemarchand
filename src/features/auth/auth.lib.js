import argon2 from "argon2";
import jwt from "jsonwebtoken";

// =====================================================================
// Mot de passe (argon2)
// =====================================================================

export const hashPassword = async (password) => await argon2.hash(password);

export const verifyPassword = async (hashedPassword, password) =>
  await argon2.verify(hashedPassword, password);

// =====================================================================
// Token JWT
// =====================================================================

const JWT_DURATION = "15m";

export const generateToken = (id) => {
  // https://datatracker.ietf.org/doc/html/rfc7519
  const payload = { sub: String(id) };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: JWT_DURATION,
  });
};
