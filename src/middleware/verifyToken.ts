import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import payloadBody from "../models/payloadBody";

const validateToken = (req: Request, res: Response, next: NextFunction) => {
  const cookie = req.cookies.jwt;
  console.log(cookie);

  if (!cookie) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload: payloadBody = verifyToken(cookie.toString()) as payloadBody;

    if (payload.tokenType !== "access") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.body.user = {
      id: payload.id
    };

    return next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor."
    });
  }
}

export default validateToken;