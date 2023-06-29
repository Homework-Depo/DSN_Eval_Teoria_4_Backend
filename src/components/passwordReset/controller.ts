import { Response, Request } from 'express';
import sendEmail from '../../utils/mailgun';
import { PrismaClient } from '@prisma/client';
import generateRandomCode from '../../utils/randomCode';

const prisma = new PrismaClient();

export const passwordResetRequest = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Campos faltantes."
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email
      }
    });

    if (!user || typeof user !== "object") {
      return res.status(404).json({
        success: false,
        message: "Credenciales incorrectas."
      });
    }

    const randomCode = generateRandomCode(6);

    await prisma.user.update({
      where: {
        email: email
      },
      data: {
        passwordResetToken: randomCode
      }
    });

    const data = await sendEmail(
      email,
      "Recuperación de contraseña",
      `Su código de recuperación es: ${randomCode}`
    );

    return res.status(200).json({
      success: true,
      message: "Correo enviado.",
      data: data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor.",
      error: error
    });
  }
}