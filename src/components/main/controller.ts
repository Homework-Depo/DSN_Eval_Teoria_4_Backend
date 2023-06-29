import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.body.user;
  
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: Number(id)
      },
      select: {
        name: true,
        email: true,
        secretKey: true,
      }
    });

    return res.status(200).json({
      success: true,
      message: "Usuario encontrado.",
      data: user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor.",
    });
  }
}