// Classe para tratamento padronizado de erros da aplicação
class AppError {
  message: string;
  statusCode: number;

  // Construtor com mensagem obrigatória e status code opcional
  constructor(message: string, statusCode = 400) {
    this.message = message;
    this.statusCode = statusCode;
  }
}

export { AppError };
