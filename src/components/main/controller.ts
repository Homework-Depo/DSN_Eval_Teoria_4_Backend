import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generate, generateKeyUri, generateSecret } from "../../utils/otp";

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

    const otpSecretKey = generateSecret();
    const otpKeyUri = generateKeyUri(user!!.email, otpSecretKey);

    return res.status(200).json({
      success: true,
      message: "Usuario encontrado.",
      data: { ...user, otpSecretKey, otpKeyUri }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor.",
    });
  }
}

export const enable2fa = async (req: Request, res: Response) => {
  const id = req.body.id;
  const authCode = req.body.authCode;
  const otpSecretKey = req.body.otpSecretKey;

  console.log(id, authCode, otpSecretKey);


  if (!id || !authCode) {
    return res.status(400).json({ message: "Id o código de autenticación inválido." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id
      },
      select: {
        secretKey: true,
        email: true
      }
    });

    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado." });
    }

    if (user.secretKey) {
      return res.status(400).json({ message: "2FA ya está activado." });
    }

    const otp = generate(otpSecretKey);
    console.log(otp, authCode);

    if (authCode !== otp) {
      return res.status(400).json({ message: "Código de autenticación inválido." });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: id
      },
      data: {
        secretKey: otpSecretKey
      }
    });

    return res.status(200).json({ status: "success", message: "2FA activado." });
  } catch (error) {
    return res.status(500).json({ message: "Error del servidor." });
  }
}

export const disable2fa = async (req: Request, res: Response) => {
  const id = Number(req.body.user.id);

  if (!id) {
    return res.status(400).json({ message: "Id inválido." });
  }

  try {
    const user = await prisma.user.update({
      where: {
        id: id
      },
      data: {
        secretKey: null
      }
    });

    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({ status: "success", message: "2FA desactivado." });
  } catch (error) {
    return res.status(500).json({ message: "Error del servidor." });
  }
}