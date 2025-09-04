import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { ZodError } from "zod";

// Middleware global para tratamento de erros da aplicação
export const errorHandling = (
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // Trata erros customizados da aplicação
  if (error instanceof AppError) {
    response.status(error.statusCode).json({ message: error.message });
    return;
  }

  // Trata erros de validação do Zod
  if (error instanceof ZodError) {
    response
      .status(400)
      .json({ message: "validation error", issues: error.format() });
    return;
  }

  // Trata erros genéricos do servidor
  response
    .status(500)
    .json({ message: error.message || "Internal server error" });
};
