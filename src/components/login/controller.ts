import { Request, Response } from "express";
import { PrismaClient, User } from "@prisma/client";
import { comparePassword } from "../../utils/bcrypt";
import { generateToken } from "../../utils/jwt";
import payloadBody from "../../models/payloadBody";
import { generate } from "../../utils/otp";

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Campos faltantes."
    });
  }

  try {
    const user: User | null = await prisma.user.findUnique({
      where: {
        username: username
      }
    });

    if (!user || typeof user !== "object") {
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas."
      });
    }

    const isValidPassword: boolean = await comparePassword(password, user.password);

    if (!isValidPassword) {
      if (user!.loginAttempts >= 2) {
        await prisma.user.update({
          where: {
            id: user.id
          },
          data: {
            loginAttempts: 0,
            locked: true
          }
        });
      }

      await prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          loginAttempts: user.loginAttempts + 1
        }
      });


      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas."
      });
    }

    if (user.locked) {
      return res.status(423).json({
        success: false,
        message: "Usuario bloqueado."
      });
    }

    const payload: payloadBody = {
      id: user.id,
      name: user.name
    };

    if (!user.secretKey) {
      payload.tokenType = "access";

      const token = generateToken(payload, "7d");

      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.status(200).json({
        success: true,
        message: "Usuario logueado correctamente."
      });
    }

    payload.tokenType = "otp";
    const token = generateToken(payload, "5m");

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 5 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: "Usuario logueado correctamente.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor."
    });
  }
}

export const validateOtp = async (req: Request, res: Response) => {
  const { otp } = req.body;
  const { id } = req.body.user.id;

  if (!otp) {
    return res.status(400).json({
      success: false,
      message: "Campos faltantes."
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: Number(id)
      }
    });

    const otpSecret = generate(user!.secretKey!);

    if (otpSecret !== otp) {
      return res.status(401).json({
        success: false,
        message: "Código OTP incorrecto."
      });
    }

    const payload: payloadBody = {
      id: user!.id,
      name: user!.name,
      tokenType: "access"
    };

    const token = generateToken(payload, "7d");

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: "Usuario logueado correctamente."
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor."
    });
  }
}