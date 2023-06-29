import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import payloadBody from "../models/payloadBody";

const validateOtpToken = (req: Request, res: Response, next: NextFunction) => {
  const cookie = req.cookies.jwt;

  if (!cookie) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload: payloadBody = verifyToken(cookie) as payloadBody;

    if (payload.tokenType !== "otp") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    req.body.user.id = payload.id;

    return next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor."
    });
  }
}

export default validateOtpToken;