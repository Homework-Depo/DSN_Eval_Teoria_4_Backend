import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../../utils/bcrypt";
import { generateToken } from "../../utils/jwt";
import payloadBody from "../../models/payloadBody";
import sendEmail from "../../utils/mailgun";

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  const { name, email, password, secretKey } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      message: "Campos faltantes."
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (user) {
      return res.status(409).json({
        success: false,
        message: "Usuario ya existe."
      });
    }

    const hashedPassword: string = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        secretKey: secretKey || null,
        password: hashedPassword,
        Password: {
          create: {
            password: hashedPassword
          }
        }
      }
    });

    const emailTemplate = `
    <div>
      <h1>Bienvenido/a a nuestro sitio</h1>
      <p>Estimado/a ${name},</p>
      <p>Gracias por registrarte en nuestro sitio. ¡Estamos encantados de tenerte como parte de nuestra comunidad!</p>
      <p>A partir de ahora, podrás acceder a todos los servicios y características de nuestra plataforma.</p>
      <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en ponerte en contacto con nuestro equipo de soporte.</p>
      <p>¡Que tengas una experiencia maravillosa en nuestro sitio!</p>
      <br>
      <p>Atentamente,</p>
      <p>Javier Aponte</p>
    </div>
    `;

    await sendEmail(
      email,
      "Bienvendo/a a nuestro sitio",
      emailTemplate);

    const payload: payloadBody = {
      id: newUser.id,
      name: newUser.name,
      tokenType: "access"
    }

    const token: string = generateToken(payload, "7d");

    res.cookie("jwt", token, {
      domain: "http://3.94.173.130:5173/",
      path: "/",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "Usuario creado."
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor."
    });
  }
}
