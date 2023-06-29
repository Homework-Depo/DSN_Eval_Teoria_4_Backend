import { Request, Response } from 'express';

export const logout = async (req: Request, res: Response) => {

  res.clearCookie("jwt");

  return res.status(200).json({
    success: true,
    message: "Sesión cerrada correctamente"
  });
}