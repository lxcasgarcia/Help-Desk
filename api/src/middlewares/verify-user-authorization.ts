import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

// Middleware para verificar autorização do usuário baseado em roles
function verifyUserAuthorization(role: string[]) {
  return (request: Request, response: Response, next: NextFunction) => {
    // Verifica se o usuário está autenticado e tem role permitido
    if (!request.user || !role.includes(request.user.role)) {
      throw new AppError("Unauthorized", 401);
    }

    // Continua para o próximo middleware/controller
    return next();
  };
}

export { verifyUserAuthorization };
