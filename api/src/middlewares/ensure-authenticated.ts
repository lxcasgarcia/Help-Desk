import { Request, Response, NextFunction } from "express";
import { authConfig } from "../configs/auth";
import { AppError } from "../utils/AppError";
import { verify } from "jsonwebtoken";

// Interface para o payload do token JWT
interface TokenPayload {
  role: string;
  sub: string;
}

// Middleware para garantir que o usuário esteja autenticado
function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    // Extrai o token do header de autorização
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new AppError("JWT token is missing", 401);
    }

    // Remove o prefixo "Bearer " do token
    const [, token] = authHeader.split(" ");

    // Verifica e decodifica o token JWT
    const { role, sub: user_id } = verify(
      token,
      authConfig.jwt.secret
    ) as TokenPayload;

    // Adiciona informações do usuário ao request
    request.user = {
      id: user_id,
      role,
    };

    // Continua para o próximo middleware/controller
    return next();
  } catch (error) {
    throw new AppError("Invalid JWT token", 401);
  }
}

export { ensureAuthenticated };
