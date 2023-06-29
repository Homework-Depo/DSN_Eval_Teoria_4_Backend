import { Response, Request } from 'express';
import sendEmail from '../../utils/mailgun';
import { PrismaClient } from '@prisma/client';
import generateRandomCode from '../../utils/randomCode';
import { comparePassword, hashPassword } from '../../utils/bcrypt';

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

export const submit = async (req: Request, res: Response) => {
  const { passwordResetToken, password, passwordConfirmation } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: passwordResetToken
      },
      include: {
        Password: true
      }
    });

    if (!user || typeof user !== "object") {
      return res.status(404).json({
        success: false,
        message: "Credenciales incorrectas."
      });
    }

    const hashedPassword = await hashPassword(password);

    const lastFourPasswords = await prisma.password.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 4
    });

    const isPasswordDuplicate = lastFourPasswords.some(async (hashedPassword) => {
      return await comparePassword(password, hashedPassword.password);
    });

    if (isPasswordDuplicate) {
      return res.status(409).json({
        success: false,
        message: "La contraseña no puede ser la misma que la anterior."
      });
    }

    await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        Password: {
          create: {
            password: hashedPassword
          }
        }
      }
    });

    const emailTemplate = `
    <div>
      <h1>Contraseña restablecida exitosamente</h1>
      <p>Estimado/a ${user.name},</p>
      <p>Te informamos que se ha restablecido exitosamente la contraseña de tu cuenta.</p>
      <p>Si no realizaste esta acción o consideras que ha sido un error, te recomendamos tomar las medidas necesarias para asegurar tu cuenta.</p>
      <p>Si tienes alguna pregunta o necesitas asistencia, no dudes en contactar a nuestro equipo de soporte.</p>
      <br>
      <p>Atentamente,</p>
      <p>Javier Aponte</p>
    </div>
    `;

    await sendEmail(user.email, "Contraseña Actualizada", emailTemplate);

    return res.status(200).json({
      success: true,
      message: "Contraseña actualizada."
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor."
    });
  }
}