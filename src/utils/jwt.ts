import { Secret, sign, verify } from "jsonwebtoken";

const jwtSecret: Secret = process.env["JWT_SECRET"]!;

export const generateToken = (payload: string | object, expiresIn: string | number) => {
  return sign(payload, jwtSecret, {
    expiresIn: expiresIn
  });
}

export const verifyToken = (token: string) => {
  return verify(token, jwtSecret);
}

