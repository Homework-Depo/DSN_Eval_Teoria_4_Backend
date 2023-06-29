import { Request, Response } from 'express';

export const logout = async (req: Request, res: Response) => {
  const { id } = req.body.user;
  console.log(id);

  res.clearCookie("jwt");

  return res.status(200).json({
    success: true,
    message: "Sesión cerrada correctamente"
  });
}