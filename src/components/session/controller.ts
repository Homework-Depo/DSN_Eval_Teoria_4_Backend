import { Request, Response } from 'express';
import { verifyToken } from '../../utils/jwt';
import payloadBody from '../../models/payloadBody';

export const verify = async (req: Request, res: Response) => {
  const cookie = req.cookies.jwt;

  if (!cookie) {
    return res.status(401).json({
      success: false,
      message: "No estas autorizado para vistar esta ruta."
    });
  }

  try {
    const payload: payloadBody = verifyToken(cookie) as payloadBody;

    if (payload.tokenType !== "access") {
      return res.status(401).json({
        success: false,
        message: "No estas autorizado para vistar esta ruta."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Token valido.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor."
    });
  }
}