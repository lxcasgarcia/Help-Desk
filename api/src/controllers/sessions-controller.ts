import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { AppError } from "../utils/AppError";
import { z } from "zod";
import { authConfig } from "../configs/auth";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";

class SessionsController {
  // Autentica usuário e retorna token JWT
  async create(request: Request, response: Response) {
    // Valida dados de login
    const bodySchema = z.object({
      email: z
        .string()
        .trim()
        .email({ message: "Email inválido." })
        .toLowerCase(),
      password: z.string(),
    });

    const { email, password } = bodySchema.parse(request.body);

    // Busca usuário pelo email
    const user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      throw new AppError("E-mail ou senha inválido.", 401);
    }

    // Verifica se a senha está correta
    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      throw new AppError("E-mail ou senha inválido.", 401);
    }

    // Gera token JWT com configurações de autenticação
    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({ role: user.role }, secret, {
      subject: user.id,
      expiresIn,
    });

    // Remove senha da resposta por segurança
    const { password: _, ...userWithoutPassword } = user;

    response.json({ token, user: userWithoutPassword });
  }
}

export { SessionsController };
