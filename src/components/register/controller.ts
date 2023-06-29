import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../../utils/bcrypt";
import { generateToken } from "../../utils/jwt";
import payloadBody from "../../models/payloadBody";

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

    const payload: payloadBody = {
      id: newUser.id,
      name: newUser.name,
      tokenType: "access"
    }

    const token: string = generateToken(JSON.stringify(payload), "7d");

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "Usuario creado."
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor."
    });
  }
}
